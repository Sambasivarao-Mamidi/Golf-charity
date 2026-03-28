const crypto = require("crypto");
const Draw = require("../models/Draw");
const DrawLog = require("../models/DrawLog");
const User = require("../models/User");
const { sendWinnerNotification, sendPrizeApproved, sendPrizeRejected } = require("../utils/email");

const CHARITY_PERCENT = 10;
const POOL_PER_USER = 10;

const generateRandomNumbers = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    const randomBytes = crypto.randomBytes(4);
    const randomValue = randomBytes.readUInt32BE(0);
    const num = (randomValue % 45) + 1;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

const generateWeightedNumbers = (type, subscribers) => {
  const frequencyMap = {};
  for (let i = 1; i <= 45; i++) frequencyMap[i] = 0;
  subscribers.forEach(user => {
    if (user.drawNumbers && user.drawNumbers.length === 5) {
      user.drawNumbers.forEach(num => { if (num >= 1 && num <= 45) frequencyMap[num]++; });
    }
  });
  const totalOccurrences = Object.values(frequencyMap).reduce((sum, count) => sum + count, 0);
  if (totalOccurrences === 0) return generateRandomNumbers();
  const weights = {};
  const totalFrequency = Object.values(frequencyMap).reduce((a, b) => a + b, 0);
  for (let i = 1; i <= 45; i++) {
    if (type === "weighted_least_frequent") weights[i] = totalFrequency / (frequencyMap[i] || 1);
    else weights[i] = (frequencyMap[i] || 0.001) / totalFrequency;
  }
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalizedWeights = {};
  for (let i = 1; i <= 45; i++) normalizedWeights[i] = weights[i] / totalWeight;
  const numbers = new Set();
  const weightArray = [];
  const numArray = [];
  for (let i = 1; i <= 45; i++) { numArray.push(i); weightArray.push(normalizedWeights[i]); }
  while (numbers.size < 5) {
    const randomBytes = crypto.randomBytes(4);
    const randomValue = randomBytes.readUInt32BE(0) / 0xFFFFFFFF;
    let cumulative = 0;
    for (let i = 0; i < weightArray.length; i++) {
      cumulative += weightArray[i];
      if (randomValue < cumulative) { numbers.add(numArray[i]); break; }
    }
    if (numbers.size < 5) {
      const fallbackBytes = crypto.randomBytes(4);
      const fallbackValue = fallbackBytes.readUInt32BE(0);
      numbers.add((fallbackValue % 45) + 1);
    }
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

const generateWinningNumbers = (type = "random", subscribers = []) => {
  if (type === "random") return generateRandomNumbers();
  return generateWeightedNumbers(type, subscribers);
};

const countMatches = (userNumbers, winningNumbers) => userNumbers.filter(num => winningNumbers.includes(num)).length;

const calculatePrizes = (totalPool, rolloverAmount = 0) => {
  const charityAmount = totalPool * (CHARITY_PERCENT / 100);
  const prizePool = totalPool - charityAmount + rolloverAmount;
  return {
    totalCollected: totalPool, charityPercent: CHARITY_PERCENT, charityAmount, prizePool,
    fiveMatchPool: prizePool * 0.40, fourMatchPool: prizePool * 0.35, threeMatchPool: prizePool * 0.25, rollover: rolloverAmount
  };
};

const runSingleSimulation = (winningNumbers, subscribers) => {
  const winners = { 5: 0, 4: 0, 3: 0 };
  subscribers.forEach(user => {
    if (!user.drawNumbers || user.drawNumbers.length !== 5) return;
    const matches = countMatches(user.drawNumbers, winningNumbers);
    if (matches === 5) winners[5]++; else if (matches === 4) winners[4]++; else if (matches === 3) winners[3]++;
  });
  return winners;
};

const runMonteCarloSimulation = async (drawType, runs = 100) => {
  const subscribers = await User.find({ role: "subscriber" });
  if (subscribers.length === 0) return { results: [], summary: { fiveMatch: 0, fourMatch: 0, threeMatch: 0 }, minMax: { fiveMatch: [0, 0], fourMatch: [0, 0], threeMatch: [0, 0] } };
  const allResults = [], totals = { fiveMatch: 0, fourMatch: 0, threeMatch: 0 };
  const minMax = { fiveMatch: [Infinity, 0], fourMatch: [Infinity, 0], threeMatch: [Infinity, 0] };
  for (let i = 0; i < runs; i++) {
    const winningNumbers = generateWinningNumbers(drawType, subscribers);
    const winners = runSingleSimulation(winningNumbers, subscribers);
    allResults.push({ ...winners, winningNumbers });
    totals.fiveMatch += winners[5]; totals.fourMatch += winners[4]; totals.threeMatch += winners[3];
    minMax.fiveMatch = [Math.min(minMax.fiveMatch[0], winners[5]), Math.max(minMax.fiveMatch[1], winners[5])];
    minMax.fourMatch = [Math.min(minMax.fourMatch[0], winners[4]), Math.max(minMax.fourMatch[1], winners[4])];
    minMax.threeMatch = [Math.min(minMax.threeMatch[0], winners[3]), Math.max(minMax.threeMatch[1], winners[3])];
  }
  const avgWinners = { fiveMatch: totals.fiveMatch / runs, fourMatch: totals.fourMatch / runs, threeMatch: totals.threeMatch / runs };
  minMax.fiveMatch = [minMax.fiveMatch[0] === Infinity ? 0 : minMax.fiveMatch[0], minMax.fiveMatch[1]];
  minMax.fourMatch = [minMax.fourMatch[0] === Infinity ? 0 : minMax.fourMatch[0], minMax.fourMatch[1]];
  minMax.threeMatch = [minMax.threeMatch[0] === Infinity ? 0 : minMax.threeMatch[0], minMax.threeMatch[1]];
  return { results: allResults, summary: avgWinners, minMax, totalParticipants: subscribers.length };
};

const logDrawAction = async (adminId, action, details, req) => {
  try {
    const log = new DrawLog({ action, admin: adminId, details, ipAddress: req?.ip || req?.connection?.remoteAddress, userAgent: req?.headers?.["user-agent"] });
    await log.save();
  } catch (error) { console.error("Draw logging error:", error); }
};

const sendWinnerEmail = async (user, draw, prizeAmount) => {
  try {
    await sendWinnerNotification(user, draw, prizeAmount);
  } catch (error) {
    console.error("Failed to send winner notification email:", error);
  }
};

const runSimulation = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, error: "Admin access required" });
    const { drawType = "random" } = req.body;
    const subscribers = await User.find({ role: "subscriber" });
    const winningNumbers = generateWinningNumbers(drawType, subscribers);
    const winners = runSingleSimulation(winningNumbers, subscribers);
    const prizes = calculatePrizes(subscribers.length * POOL_PER_USER);
    await logDrawAction(req.user._id, "simulation_run", { drawType, winningNumbers, participantCount: subscribers.length, winnersFound: winners }, req);
    res.json({ success: true, data: { winningNumbers, drawType, totalParticipants: subscribers.length, winnersFound: winners, estimatedPools: prizes } });
  } catch (error) { console.error("Simulation Error:", error); res.status(500).json({ success: false, error: "Server error running simulation" }); }
};

const runMultipleSimulations = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, error: "Admin access required" });
    const { drawType = "random", runs = 100 } = req.body;
    const simulationRuns = Math.min(Math.max(parseInt(runs) || 100, 50), 500);
    const subscribers = await User.find({ role: "subscriber" });
    const prizes = calculatePrizes(subscribers.length * POOL_PER_USER);
    const simulation = await runMonteCarloSimulation(drawType, simulationRuns);
    await logDrawAction(req.user._id, "simulation_run", { drawType, simulationCount: simulationRuns, participantCount: subscribers.length, averageWinners: simulation.summary, winnerRange: simulation.minMax }, req);
    const estimatedPrizePerWinner = {
      fiveMatch: prizes.fiveMatchPool > 0 && simulation.summary.fiveMatch > 0 ? (prizes.fiveMatchPool / simulation.summary.fiveMatch).toFixed(2) : 0,
      fourMatch: prizes.fourMatchPool > 0 && simulation.summary.fourMatch > 0 ? (prizes.fourMatchPool / simulation.summary.fourMatch).toFixed(2) : 0,
      threeMatch: prizes.threeMatchPool > 0 && simulation.summary.threeMatch > 0 ? (prizes.threeMatchPool / simulation.summary.threeMatch).toFixed(2) : 0
    };
    res.json({ success: true, data: { drawType, simulationRuns, totalParticipants: subscribers.length, estimatedPools: prizes, averageWinners: { fiveMatch: simulation.summary.fiveMatch.toFixed(2), fourMatch: simulation.summary.fourMatch.toFixed(2), threeMatch: simulation.summary.threeMatch.toFixed(2) }, winnerRange: { fiveMatch: simulation.minMax.fiveMatch[0] + "-" + simulation.minMax.fiveMatch[1], fourMatch: simulation.minMax.fourMatch[0] + "-" + simulation.minMax.fourMatch[1], threeMatch: simulation.minMax.threeMatch[0] + "-" + simulation.minMax.threeMatch[1] }, estimatedPrizePerWinner } });
  } catch (error) { console.error("Monte Carlo Simulation Error:", error); res.status(500).json({ success: false, error: "Server error running simulation" }); }
};

const publishDraw = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, error: "Admin access required" });
    const { winningNumbers, drawType = "random" } = req.body;
    if (!winningNumbers || winningNumbers.length !== 5) return res.status(400).json({ success: false, error: "Must provide exactly 5 winning numbers" });
    for (const num of winningNumbers) {
      if (!Number.isInteger(num) || num < 1 || num > 45) {
        return res.status(400).json({ success: false, error: "Winning numbers must be integers between 1 and 45" });
      }
    }
    if (new Set(winningNumbers).size !== winningNumbers.length) {
      return res.status(400).json({ success: false, error: "Winning numbers must be unique" });
    }
    const lastDraw = await Draw.findOne().sort({ drawDate: -1 });
    const rolloverAmount = lastDraw?.rolloverAmount || 0;
    const subscribers = await User.find({ role: "subscriber" });
    const totalPool = subscribers.length * POOL_PER_USER;
    const prizes = calculatePrizes(totalPool, rolloverAmount);
    const winners = [];
    for (const user of subscribers) {
      if (!user.drawNumbers || user.drawNumbers.length !== 5) continue;
      const matches = countMatches(user.drawNumbers, winningNumbers);
      if (matches >= 3) winners.push({ user: user._id, matchCount: matches, status: "pending" });
    }
    const winnersByTier = { 5: [], 4: [], 3: [] };
    winners.forEach(w => winnersByTier[w.matchCount].push(w));
    const prizePerWinner = {
      fiveMatch: winnersByTier[5].length > 0 ? prizes.fiveMatchPool / winnersByTier[5].length : 0,
      fourMatch: winnersByTier[4].length > 0 ? prizes.fourMatchPool / winnersByTier[4].length : 0,
      threeMatch: winnersByTier[3].length > 0 ? prizes.threeMatchPool / winnersByTier[3].length : 0
    };
    const finalWinners = winners.map(w => {
      let prizeAmount = 0;
      if (w.matchCount === 5) prizeAmount = prizePerWinner.fiveMatch;
      else if (w.matchCount === 4) prizeAmount = prizePerWinner.fourMatch;
      else if (w.matchCount === 3) prizeAmount = prizePerWinner.threeMatch;
      return { ...w, prizeAmount };
    });
    const draw = new Draw({
      drawDate: new Date(), winningNumbers: winningNumbers.sort((a, b) => a - b), drawType, totalPool: prizes.totalCollected, charityPool: prizes.charityAmount, winners: finalWinners, rolloverAmount: prizes.rollover, status: "completed", publishedAt: new Date(), publishedBy: req.user._id,
      prizeBreakdown: { totalCollected: prizes.totalCollected, charityPercent: prizes.charityPercent, charityAmount: prizes.charityAmount, prizePool: prizes.prizePool, fiveMatchPool: prizes.fiveMatchPool, fourMatchPool: prizes.fourMatchPool, threeMatchPool: prizes.threeMatchPool, fiveMatchWinners: winnersByTier[5].length, fourMatchWinners: winnersByTier[4].length, threeMatchWinners: winnersByTier[3].length, fiveMatchPerWinner: prizePerWinner.fiveMatch, fourMatchPerWinner: prizePerWinner.fourMatch, threeMatchPerWinner: prizePerWinner.threeMatch }
    });
    await draw.save();
    await logDrawAction(req.user._id, "draw_published", { drawId: draw._id, drawType, winningNumbers, participantCount: subscribers.length, totalPool: prizes.totalCollected, winnerCount: winners.length, winnersByTier: { fiveMatch: winnersByTier[5].length, fourMatch: winnersByTier[4].length, threeMatch: winnersByTier[3].length } }, req);
    for (const winner of finalWinners) {
      const winnerUser = await User.findById(winner.user);
      if (winnerUser) await sendWinnerEmail(winnerUser, draw, winner.prizeAmount);
    }
    res.status(201).json({ success: true, data: { drawId: draw._id, drawType, winnersCount: finalWinners.length, winnersByTier: { fiveMatch: winnersByTier[5].length, fourMatch: winnersByTier[4].length, threeMatch: winnersByTier[3].length }, prizeBreakdown: prizes, prizePerWinner } });
  } catch (error) { console.error("Publish Draw Error:", error); res.status(500).json({ success: false, error: "Server error publishing draw" }); }
};

const getDrawResults = async (req, res) => {
  try {
    const draws = await Draw.find().sort({ drawDate: -1 }).populate("winners.user", "name email").populate("publishedBy", "name").limit(24);
    res.json({ success: true, data: draws });
  } catch (error) { console.error("Get Draw Results Error:", error); res.status(500).json({ success: false, error: "Server error fetching draw results" }); }
};

const getDrawInfo = async (req, res) => {
  try {
    const subscribers = await User.countDocuments({ role: "subscriber" });
    const totalDraws = await Draw.countDocuments({ status: "completed" });
    const lastDraw = await Draw.findOne().sort({ drawDate: -1 });
    const nextDraw = await Draw.findOne({ status: "pending" }).sort({ scheduledDate: 1 });
    const prizes = calculatePrizes(subscribers * POOL_PER_USER);
    res.json({ success: true, data: { rules: { drawTypes: [{ type: "random", name: "Random Draw", description: "Standard lottery-style draw where every number has an equal chance of being selected.", recommended: true }, { type: "weighted_least_frequent", name: "Weighted: Least Frequent", description: "Numbers that appear less frequently in player scores have a higher chance of being drawn. (Experimental)", experimental: true }, { type: "weighted_most_frequent", name: "Weighted: Most Frequent", description: "Numbers that appear more frequently in player scores have a higher chance of being drawn. (Experimental)", experimental: true }], prizeDistribution: { fiveMatch: { percent: 40, description: "5 numbers match - Jackpot tier" }, fourMatch: { percent: 35, description: "4 numbers match - Second tier" }, threeMatch: { percent: 25, description: "3 numbers match - Third tier" } }, charityContribution: CHARITY_PERCENT + "% of total pool", rollover: "Unclaimed 5-match prizes roll over to next draw" }, stats: { totalDraws, currentParticipants: subscribers, estimatedPrizePool: prizes.prizePool, estimatedCharityPool: prizes.charityAmount }, lastDraw: lastDraw ? { date: lastDraw.drawDate, type: lastDraw.drawType } : null, nextScheduledDraw: nextDraw?.scheduledDate || null } });
  } catch (error) { console.error("Get Draw Info Error:", error); res.status(500).json({ success: false, error: "Server error fetching draw info" }); }
};

const getDrawLogs = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, error: "Admin access required" });
    const { page = 1, limit = 50, action } = req.query;
    const query = action ? { action } : {};
    const logs = await DrawLog.find(query).populate("admin", "name email").populate("drawId", "drawDate winningNumbers").sort({ timestamp: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await DrawLog.countDocuments(query);
    res.json({ success: true, data: { logs, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) { console.error("Get Draw Logs Error:", error); res.status(500).json({ success: false, error: "Server error fetching draw logs" }); }
};

const submitProof = async (req, res) => {
  try {
    const { drawId, winnerId } = req.params;
    const { proofUrl } = req.body;
    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ success: false, error: "Draw not found" });
    const winnerIndex = draw.winners.findIndex(w => w._id.toString() === winnerId && w.user.toString() === req.user._id.toString());
    if (winnerIndex === -1) return res.status(403).json({ success: false, error: "Not authorized to submit proof for this winner" });
    draw.winners[winnerIndex].proofUrl = proofUrl;
    draw.winners[winnerIndex].proofSubmittedAt = new Date();
    draw.winners[winnerIndex].status = "Awaiting Review";
    await draw.save();
    res.json({ success: true, data: draw.winners[winnerIndex] });
  } catch (error) { console.error("Submit Proof Error:", error); res.status(500).json({ success: false, error: "Server error submitting proof" }); }
};

const uploadProof = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });
    const { drawId, winnerId } = req.params;
    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ success: false, error: "Draw not found" });
    const winnerIndex = draw.winners.findIndex(w => w._id.toString() === winnerId && w.user.toString() === req.user._id.toString());
    if (winnerIndex === -1) return res.status(403).json({ success: false, error: "Not authorized to submit proof for this winner" });
    draw.winners[winnerIndex].proofUrl = req.file.path;
    draw.winners[winnerIndex].proofSubmittedAt = new Date();
    draw.winners[winnerIndex].status = "Awaiting Review";
    await draw.save();
    res.json({ success: true, data: { proofUrl: req.file.path, status: "Awaiting Review", submittedAt: draw.winners[winnerIndex].proofSubmittedAt } });
  } catch (error) { console.error("Upload Proof Error:", error); res.status(500).json({ success: false, error: "Server error uploading proof" }); }
};

const approveWinner = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, error: "Admin access required" });
    const { drawId, winnerId } = req.params;
    const { status, rejectionReason } = req.body;
    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ success: false, error: "Draw not found" });
    const winnerIndex = draw.winners.findIndex(w => w._id.toString() === winnerId);
    if (winnerIndex === -1) return res.status(404).json({ success: false, error: "Winner not found" });
    const previousStatus = draw.winners[winnerIndex].status;
    if (status === "approved") { draw.winners[winnerIndex].status = "Approved"; draw.winners[winnerIndex].paidAt = new Date(); }
    else if (status === "rejected") { draw.winners[winnerIndex].status = "Rejected"; draw.winners[winnerIndex].rejectionReason = rejectionReason; }
    await draw.save();
    await logDrawAction(req.user._id, status === "approved" ? "winner_verified" : "winner_rejected", { drawId, winnerId, winnerUser: draw.winners[winnerIndex].user, previousStatus, newStatus: status, rejectionReason }, req);
    const winnerUser = await User.findById(draw.winners[winnerIndex].user);
    if (winnerUser) {
      if (status === "approved") {
        await sendPrizeApproved(winnerUser, draw, draw.winners[winnerIndex].prizeAmount);
      } else if (status === "rejected") {
        await sendPrizeRejected(winnerUser, draw, draw.winners[winnerIndex].prizeAmount, rejectionReason);
      }
    }
    res.json({ success: true, data: draw.winners[winnerIndex] });
  } catch (error) { console.error("Approve Winner Error:", error); res.status(500).json({ success: false, error: "Server error approving winner" }); }
};

const getMyWinnings = async (req, res) => {
  try {
    const draws = await Draw.find({ "winners.user": req.user._id }).sort({ drawDate: -1 }).select("drawDate winningNumbers prizeBreakdown winners status");
    const winnings = draws.map(draw => {
      const myWinner = draw.winners.find(w => w.user.toString() === req.user._id.toString());
      return { drawId: draw._id, drawDate: draw.drawDate, winningNumbers: draw.winningNumbers, matchCount: myWinner.matchCount, prizeAmount: myWinner.prizeAmount, status: myWinner.status, proofUrl: myWinner.proofUrl, proofSubmittedAt: myWinner.proofSubmittedAt, rejectionReason: myWinner.rejectionReason, paidAt: myWinner.paidAt };
    });
    const stats = { totalWinnings: winnings.reduce((sum, w) => sum + w.prizeAmount, 0), pendingCount: winnings.filter(w => w.status === "pending" || w.status === "Awaiting Review").length, approvedCount: winnings.filter(w => w.status === "Approved").length, rejectedCount: winnings.filter(w => w.status === "Rejected").length };
    res.json({ success: true, data: { winnings, stats } });
  } catch (error) { console.error("Get My Winnings Error:", error); res.status(500).json({ success: false, error: "Server error fetching winnings" }); }
};

const getAllWinners = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, error: "Admin access required" });
    const { page = 1, limit = 20, status, drawId } = req.query;
    const query = {};
    if (status) query["winners.status"] = status;
    if (drawId) query._id = drawId;
    const draws = await Draw.find(query).sort({ drawDate: -1 }).populate("winners.user", "name email drawNumbers").skip((page - 1) * limit).limit(parseInt(limit));
    const allWinners = [];
    draws.forEach(draw => { draw.winners.forEach(winner => { allWinners.push({ drawId: draw._id, drawDate: draw.drawDate, winningNumbers: draw.winningNumbers, winner: { id: winner._id, name: winner.user?.name || "Unknown", email: winner.user?.email || "Unknown", drawNumbers: winner.user?.drawNumbers || [], matchCount: winner.matchCount, prizeAmount: winner.prizeAmount, status: winner.status, proofUrl: winner.proofUrl, proofSubmittedAt: winner.proofSubmittedAt, rejectionReason: winner.rejectionReason, paidAt: winner.paidAt } }); }); });
    const totalWinners = await Draw.aggregate([{ $match: { status: "completed" } }, { $unwind: "$winners" }, { $count: "total" }]);
    const pendingCount = await Draw.aggregate([{ $match: { status: "completed" } }, { $unwind: "$winners" }, { $match: { "winners.status": { $in: ["pending", "Awaiting Review"] } } }, { $count: "total" }]);
    res.json({ success: true, data: { winners: allWinners, total: totalWinners[0]?.total || 0, pending: pendingCount[0]?.total || 0, page: parseInt(page), pages: Math.ceil((totalWinners[0]?.total || 0) / limit) } });
  } catch (error) { console.error("Get All Winners Error:", error); res.status(500).json({ success: false, error: "Server error fetching winners" }); }
};

module.exports = { runSimulation, runMultipleSimulations, publishDraw, getDrawResults, getDrawInfo, getDrawLogs, submitProof, uploadProof, approveWinner, getMyWinnings, getAllWinners };
