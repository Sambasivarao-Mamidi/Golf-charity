const Score = require('../models/Score');
const User = require('../models/User');

const addScore = async (req, res) => {
  try {
    const { value, course } = req.body;
    const userId = req.user._id;

    if (!value || value < 1 || value > 45) {
      return res.status(400).json({
        success: false,
        error: 'Score must be between 1 and 45 (Stableford format)'
      });
    }

    const score = new Score({
      user: userId,
      value: parseInt(value),
      course: course || 'Unknown Course'
    });

    await score.save();

    const scores = await Score.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    res.status(201).json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Add Score Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding score'
    });
  }
};

const getScores = async (req, res) => {
  try {
    const userId = req.user._id;

    const scores = await Score.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Get Scores Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching scores'
    });
  }
};

const updateScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { value, course } = req.body;

    const score = await Score.findOne({ _id: id, user: userId });
    
    if (!score) {
      return res.status(404).json({
        success: false,
        error: 'Score not found'
      });
    }

    if (value !== undefined) {
      if (value < 1 || value > 45) {
        return res.status(400).json({
          success: false,
          error: 'Score must be between 1 and 45 (Stableford format)'
        });
      }
      score.value = parseInt(value);
    }

    if (course !== undefined) {
      score.course = course || 'Unknown Course';
    }

    await score.save();

    const scores = await Score.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Update Score Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating score'
    });
  }
};

const deleteScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const score = await Score.findOneAndDelete({ _id: id, user: userId });
    
    if (!score) {
      return res.status(404).json({
        success: false,
        error: 'Score not found'
      });
    }

    const scores = await Score.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('Delete Score Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting score'
    });
  }
};

module.exports = { addScore, getScores, updateScore, deleteScore };