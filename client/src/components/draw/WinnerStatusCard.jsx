import { motion } from "framer-motion";
import { Trophy, Clock, CheckCircle, XCircle, AlertCircle, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const statusConfig = {
  pending: { label: "Pending Submission", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, bgGradient: "from-amber-50 to-orange-50" },
  "Awaiting Review": { label: "Under Review", color: "bg-blue-100 text-blue-700 border-blue-200", icon: AlertCircle, bgGradient: "from-blue-50 to-indigo-50" },
  Approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle, bgGradient: "from-emerald-50 to-teal-50" },
  Rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, bgGradient: "from-red-50 to-rose-50" }
};

const WinnerStatusCard = ({ winning, compact = false }) => {
  const config = statusConfig[winning.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const drawDate = new Date(winning.drawDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const prizeAmount = winning.prizeAmount?.toFixed(2);

  if (compact) {
    return (
      <Link to="/my-winnings" className="block">
        <motion.div whileHover={{ scale: 1.02 }} className={`bg-gradient-to-r ${config.bgGradient} rounded-xl p-3 border ${config.color.split(" ")[1]} border-opacity-50 flex items-center gap-3`}>
          <Trophy size={16} className={config.color.split(" ")[0].replace("bg-", "text-")} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">You won ${prizeAmount}!</p>
            <p className="text-xs opacity-70">{config.label}</p>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-gradient-to-r ${config.bgGradient} rounded-2xl p-6 border ${config.color.split(" ")[1].replace("text-", "border-")} border-opacity-30`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
          <StatusIcon size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-gray-800">Congratulations!</h3>
              <p className="text-sm text-gray-600">Draw on {drawDate}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>{config.label}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your Prize</p>
              <p className="text-2xl font-bold text-emerald-600">${prizeAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Match Count</p>
              <p className="text-lg font-semibold">{winning.matchCount} of 5 numbers</p>
            </div>
          </div>
          {winning.status === "Rejected" && winning.rejectionReason && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700"><strong>Reason:</strong> {winning.rejectionReason}</p>
            </div>
          )}
          {(winning.status === "pending" || winning.status === "Awaiting Review") && (
            <Link to="/my-winnings" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
              <Upload size={16} />
              {winning.status === "pending" ? "Submit Proof Now" : "View Submission"}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WinnerStatusCard;
