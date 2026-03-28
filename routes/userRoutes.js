const express = require('express');
const router = express.Router();
const { 
  listUsers, 
  getUser, 
  updateUser, 
  getUserScores,
  updateUserScore,
  deleteUserScore,
  resetUserPassword,
  cancelUserSubscription
} = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.use(authenticate);
router.use(authorizeAdmin);

router.get('/admin', listUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.get('/:id/scores', getUserScores);
router.put('/:id/scores/:scoreId', updateUserScore);
router.delete('/:id/scores/:scoreId', deleteUserScore);
router.post('/:id/reset-password', resetUserPassword);
router.post('/:id/cancel-subscription', cancelUserSubscription);

module.exports = router;
