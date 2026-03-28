const express = require('express');
const router = express.Router();
const { addScore, getScores, updateScore, deleteScore } = require('../controllers/scoreController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { submissionLimiter } = require('../middleware/rateLimiter');
const { addScore: addScoreValidation, updateScore: updateScoreValidation, deleteScore: deleteScoreValidation } = require('../utils/validators');

router.post('/', authenticate, submissionLimiter, addScoreValidation, validateRequest, addScore);
router.get('/', authenticate, getScores);
router.put('/:id', authenticate, updateScoreValidation, validateRequest, updateScore);
router.delete('/:id', authenticate, deleteScoreValidation, validateRequest, deleteScore);

module.exports = router;
