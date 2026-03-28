const crypto = require('crypto');
const Draw = require('../models/Draw');
const DrawLog = require('../models/DrawLog');
const User = require('../models/User');

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
    if (type === 'weighted_least_frequent') weights[i] = totalFrequency / (frequencyMap[i] || 1);
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
    if (numbers.size < 5) numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

const generateWinningNumbers = (type = 'random', subscribers = []) => {
  if (type === 'random') return generateRandomNumbers();
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
  const subscribers = await User.find({ role: 'subscriber' });
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
    const log = new DrawLog({ action, admin: adminId, details, ipAddress: req?.ip || req?.connection?.remoteAddress, userAgent: req?.headers?.['user-agent'] });
    await log.save();
  } catch (error) { console.error('Draw logging error:', error); }
};

const sendWinnerEmail = async (user, draw, prizeAmount) => {
  console.log('[EMAIL MOCK] Winner notification sent to ' + user.email);
  console.log('[EMAIL MOCK] Subject: Congratulations! You have won $' + prizeAmount.toFixed(2) + ' in the ' + new Date(draw.drawDate).toLocaleDateString() + ' draw!');
  console.log('[EMAIL MOCK] Body: Dear ' + user.name + ', you matched ' + draw.winners.find(w => w.user.toString() === user._id.toString()).matchCount + ' numbers and won $' + prizeAmount.toFixed(2) + '! Please submit your proof of score to claim your prize.');
  return true;
};

const runSimulation = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Admin access required' });
    const { drawType = 'random' } = req.body;
    const subscribers = await User.find({ role: 'subscriber' });
    const winningNumbers = generateWinningNumbers(drawType, subscribers);
    const winners = runSingleSimulation(winningNumbers, subscribers);
    const prizes = calculatePrizes(subscribers.length * POOL_PER_USER);
    await logDrawAction(req.user._id, 'simulation_run', { drawType, winningNumbers, participantCount: subscribers.length, winnersFound: winners }, req);
    res.json({ success: true, data: { winningNumbers, drawType, totalParticipants: subscribers.length, winnersFound: winners, estimatedPools: prizes } });
  } catch (error) { console.error('Simulation Error:', error); res.status(500).json({ success: false, error: 'Server error running simulation' }); }
};

const runMultipleSimulations = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Admin access required' });
    const { drawType = 'random', runs = 100 } = req.body;
    const simulationRuns = Math.min(Math.max(parseInt(runs) || 100, 50), 500);
    const subscribers = await User.find({ role: 'subscriber' });
    const prizes = calculatePrizes(subscribers.length * POOL_PER_USER);
    const simulation = await runMonteCarloSimulation(drawType, simulationRuns);
    await logDrawAction(req.user._id, 'simulation_run', { drawType, simulationCount: simulationRuns, participantCount: subscribers.length, averageWinners: simulation.summary, winnerRange: simulation.minMax }, req);
    const estimatedPrizePerWinner = {
      fiveMatch: prizes.fiveMatchPool > 0 && simulation.summary.fiveMatch > 0 ? (prizes.fiveMatchPool / simulation.summary.fiveMatch).toFixed(2) : 0,
      fourMatch: prizes.fourMatchPool > 0 && simulation.summary.fourMatch > 0 ? (prizes.fourMatchPool / simulation.summary.fourMatch).toFixed(2) : 0,
      threeMatch: prizes.threeMatchPool > 0 && simulation.summary.threeMatch > 0 ? (prizes.threeMatchPool / simulation.summary.threeMatch).toFixed(2) : 0
