import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, DollarSign, Clock, CheckCircle, XCircle, ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import WinnerStatusCard from "../components/draw/WinnerStatusCard";
import ProofUploadForm from "../components/draw/ProofUploadForm";
import { PageSkeleton } from "../components/common/Skeleton";

const MyWinnings = () => {
  const [winnings, setWinnings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWinning, setSelectedWinning] = useState(null);

  useEffect(() => {
    fetchWinnings();
  }, []);

  const fetchWinnings = async () => {
    try {
      const res = await api.get("/api/draws/winners/me");
      setWinnings(res.data.data.winnings);
      setStats(res.data.data.stats);
    } catch (error) {
      console.error("Failed to fetch winnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProofSuccess = () => {
    fetchWinnings();
    setSelectedWinning(null);
  };

  const getStatusBadge = (status) => {
    if (status === "Approved") return "bg-emerald-100 text-emerald-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    if (status === "Awaiting Review") return "bg-blue-100 text-blue-700";
    return "bg-amber-100 text-amber-700";
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft size={20} />
        Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Winnings</h1>
        <p className="text-gray-600 mb-8">Track your prizes and submit proof of score</p>
      </motion.div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
            <DollarSign size={24} className="mb-2 opacity-80" />
            <p className="text-sm opacity-80">Total Winnings</p>
            <p className="text-2xl font-bold">${stats.totalWinnings.toFixed(2)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 p-5">
            <Clock size={24} className="text-amber-500 mb-2" />
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-800">{stats.pendingCount}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-100 p-5">
            <CheckCircle size={24} className="text-emerald-500 mb-2" />
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-gray-800">{stats.approvedCount}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl border border-gray-100 p-5">
            <XCircle size={24} className="text-red-500 mb-2" />
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-gray-800">{stats.rejectedCount}</p>
          </motion.div>
        </div>
      )}

      {selectedWinning ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <button onClick={() => setSelectedWinning(null)} className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
            <ArrowLeft size={20} />
            Back to all winnings
          </button>
          <WinnerStatusCard winning={selectedWinning} />
          {(selectedWinning.status === "pending" || selectedWinning.status === "Awaiting Review") && (
            <ProofUploadForm winning={selectedWinning} onSuccess={handleProofSuccess} />
          )}
          {selectedWinning.proofUrl && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Submitted Proof</h3>
              <img src={selectedWinning.proofUrl} alt="Submitted proof" className="max-h-64 mx-auto rounded-lg border border-gray-200" />
              {selectedWinning.proofSubmittedAt && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Submitted on {new Date(selectedWinning.proofSubmittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          )}
        </motion.div>
      ) : winnings.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Winnings Yet</h3>
          <p className="text-gray-500">Keep playing and good luck on the next draw!</p>
          <Link to="/draws" className="inline-block mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">View Draw Results</Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {winnings.map((winning, index) => (
            <motion.div key={winning.drawId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="cursor-pointer" onClick={() => setSelectedWinning(winning)}>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center"><Trophy size={24} className="text-emerald-600" /></div>
                    <div>
                      <p className="font-semibold text-gray-800">${winning.prizeAmount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} />{new Date(winning.drawDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={"px-3 py-1 rounded-full text-sm font-medium " + getStatusBadge(winning.status)}>{winning.status === "Awaiting Review" ? "Under Review" : winning.status}</span>
                    <span className="text-sm text-gray-500">{winning.matchCount}/5 matched</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWinnings;
