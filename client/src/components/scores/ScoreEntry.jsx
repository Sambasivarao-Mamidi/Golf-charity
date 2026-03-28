import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, X, Check, Pencil } from 'lucide-react';

const NumberBubble = ({ num, selected, onClick, disabled }) => (
  <motion.button
    type="button"
    whileHover={!disabled ? { scale: 1.15 } : {}}
    whileTap={!disabled ? { scale: 0.9 } : {}}
    onClick={() => onClick(num)}
    disabled={disabled}
    className={`
      w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200
      ${selected 
        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-300 scale-110' 
        : 'bg-white/60 text-gray-600 hover:bg-emerald-100 border border-white/50'
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {num}
  </motion.button>
);

const ScoreCard = ({ score, index, onEdit, onDelete, isDeleting }) => {
  const [showAllNumbers, setShowAllNumbers] = useState(false);
  const [editScore, setEditScore] = useState(score.value);
  const [editCourse, setEditCourse] = useState(score.course || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const numbers = showAllNumbers ? Array.from({ length: 45 }, (_, i) => i + 1) : Array.from({ length: 15 }, (_, i) => i + 1);

  const handleSave = () => {
    onEdit(score._id, editScore, editCourse);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditScore(score.value);
    setEditCourse(score.course || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="py-4 px-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-emerald-700">Editing Score</span>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            <button
              onClick={handleSave}
              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <Check size={18} />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Select New Score (1-45)</p>
          <div className="flex flex-wrap gap-1">
            {numbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setEditScore(num)}
                className={`
                  w-8 h-8 rounded-lg font-bold text-xs transition-all
                  ${editScore === num 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-emerald-100'
                  }
                `}
              >
                {num}
              </button>
            ))}
          </div>
          {!showAllNumbers && (
            <button
              type="button"
              onClick={() => setShowAllNumbers(true)}
              className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Show more →
            </button>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Course Name</label>
          <input
            type="text"
            value={editCourse}
            onChange={(e) => setEditCourse(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 outline-none"
            placeholder="Course name"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between py-4 px-5 bg-gradient-to-r from-white/50 to-gray-50/50 rounded-xl border border-white/50 group"
    >
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1, type: 'spring' }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200"
        >
          <span className="text-white font-bold text-lg">{score.value}</span>
        </motion.div>
        <div>
          <p className="font-medium text-gray-800">
            {score.course || 'Unknown Course'}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(score.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-emerald-600 font-semibold">{score.value}</span>
          <p className="text-xs text-gray-400">points</p>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit score"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(score._id)}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete score"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ScoreEntry = ({ scores = [], onSubmit, isLoading }) => {
  const [selectedScore, setSelectedScore] = useState(null);
  const [course, setCourse] = useState('');
  const [error, setError] = useState('');
  const [showAllNumbers, setShowAllNumbers] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const numbers = showAllNumbers ? Array.from({ length: 45 }, (_, i) => i + 1) : Array.from({ length: 15 }, (_, i) => i + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedScore) {
      setError('Please select a score');
      return;
    }

    if (selectedScore < 1 || selectedScore > 45) {
      setError('Score must be between 1 and 45');
      return;
    }

    await onSubmit({ value: selectedScore, course });
    setSelectedScore('');
    setCourse('');
  };

  const handleEdit = async (scoreId, newValue, newCourse) => {
    await onSubmit({ id: scoreId, value: newValue, course: newCourse }, 'edit');
  };

  const handleDelete = async (scoreId) => {
    if (!confirm('Are you sure you want to delete this score?')) return;
    
    setDeletingId(scoreId);
    await onSubmit({ id: scoreId }, 'delete');
    setDeletingId(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 p-6"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Score</h2>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Your Score (1-45)
          </label>
          
          <AnimatePresence>
            {selectedScore && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100"
              >
                <motion.div
                  animate={{ 
                    boxShadow: ['0px 0px 0px rgba(16, 185, 129, 0px)', '0px 0px 20px rgba(16, 185, 129, 0.4)', '0px 0px 0px rgba(16, 185, 129, 0px)']
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center"
                >
                  <span className="text-3xl font-bold text-white">{selectedScore}</span>
                </motion.div>
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Selected Score</p>
                  <p className="text-2xl font-bold text-gray-800">{selectedScore} Points</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedScore(null)}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-2">
            {numbers.map((num) => (
              <NumberBubble
                key={num}
                num={num}
                selected={selectedScore === num}
                onClick={setSelectedScore}
                disabled={isLoading}
              />
            ))}
          </div>
          
          {!showAllNumbers && (
            <button
              type="button"
              onClick={() => setShowAllNumbers(true)}
              className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Show more numbers →
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Name (optional)
          </label>
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
            placeholder="e.g., St Andrews"
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm bg-red-50 p-3 rounded-xl"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={isLoading || !selectedScore}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                Saving...
              </motion.span>
            </span>
          ) : (
            'Add Score'
          )}
        </motion.button>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
          Your Latest 5 Scores
          <span className="ml-2 text-gray-400">({scores.length}/5)</span>
        </h3>
        
        {scores.length === 0 ? (
          <div className="text-center py-8 bg-gray-50/50 rounded-2xl">
            <p className="text-gray-400">No scores recorded yet</p>
            <p className="text-sm text-gray-300 mt-1">Add your first score above!</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {scores.map((score, index) => (
              <ScoreCard
                key={score._id || index}
                score={score}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === score._id}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ScoreEntry;