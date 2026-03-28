const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const scoreRoutes = require('./scoreRoutes');
const drawRoutes = require('./drawRoutes');
const charityRoutes = require('./charityRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const userRoutes = require('./userRoutes');
const reportRoutes = require('./reportRoutes');

router.use('/auth', authRoutes);
router.use('/scores', scoreRoutes);
router.use('/draws', drawRoutes);
router.use('/charities', charityRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
