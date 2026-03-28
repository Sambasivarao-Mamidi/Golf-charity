const express = require('express');
const router = express.Router();
const { 
  listCharities, 
  getCharity, 
  updateAllocation,
  createCharity,
  updateCharity,
  deleteCharity,
  makeIndependentDonation,
  getAllCharitiesAdmin
} = require('../controllers/charityController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { 
  createCharity: createCharityValidation, 
  updateCharity: updateCharityValidation, 
  getCharity: getCharityValidation, 
  deleteCharity: deleteCharityValidation, 
  makeDonation: makeDonationValidation, 
  updateAllocation: updateAllocationValidation 
} = require('../utils/validators');

router.get('/', listCharities);
router.get('/all', authenticate, authorizeAdmin, getAllCharitiesAdmin);
router.get('/:id', getCharityValidation, validateRequest, getCharity);
router.put('/allocation', authenticate, updateAllocationValidation, validateRequest, updateAllocation);
router.post('/donate', authenticate, makeDonationValidation, validateRequest, makeIndependentDonation);
router.post('/', authenticate, authorizeAdmin, createCharityValidation, validateRequest, createCharity);
router.put('/:id', authenticate, authorizeAdmin, updateCharityValidation, validateRequest, updateCharity);
router.delete('/:id', authenticate, authorizeAdmin, deleteCharityValidation, validateRequest, deleteCharity);

module.exports = router;
