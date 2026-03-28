const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getWinnerReport, 
  getCharityReport, 
  getUserGrowthReport 
} = require('../controllers/reportController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/stats', authenticate, authorizeAdmin, getDashboardStats);
router.get('/winners', authenticate, authorizeAdmin, getWinnerReport);
router.get('/charities', authenticate, authorizeAdmin, getCharityReport);
router.get('/users', authenticate, authorizeAdmin, getUserGrowthReport);

module.exports = router;
