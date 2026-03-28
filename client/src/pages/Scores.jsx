import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import ScoreEntry from '../components/scores/ScoreEntry';
import { CardSkeleton } from '../components/common/Skeleton';

const Scores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await api.get('/api/scores');
      if (response.data.success) {
        setScores(response.data.data);
      }
    } catch (error) {
      console.error('Fetch scores error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (scoreData, action = 'add') => {
    setSubmitting(true);
    try {
      let response;
      
      if (action === 'edit') {
        response = await api.put(`/api/scores/${scoreData.id}`, {
          value: scoreData.value,
          course: scoreData.course
        });
      } else if (action === 'delete') {
        response = await api.delete(`/api/scores/${scoreData.id}`);
      } else {
        response = await api.post('/api/scores', scoreData);
      }
      
      if (response.data.success) {
        setScores(response.data.data);
      }
    } catch (error) {
      console.error('Score operation error:', error);
      alert(error.response?.data?.error || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Scores</h1>
          <p className="text-gray-500 mt-1">Track your golf scores in Stableford format</p>
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Scores</h1>
        <p className="text-gray-500 mt-1">Track your golf scores in Stableford format</p>
      </div>

      <ScoreEntry 
        scores={scores} 
        onSubmit={handleSubmit} 
        isLoading={submitting}
      />
    </motion.div>
  );
};

export default Scores;