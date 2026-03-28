const express = require("express");
const router = express.Router();
const { param } = require("express-validator");
const {
  runSimulation,
  runMultipleSimulations,
  publishDraw,
  getDrawResults,
  getDrawInfo,
  getDrawLogs,
  submitProof,
  uploadProof,
  approveWinner,
  getMyWinnings,
  getAllWinners
} = require("../controllers/drawController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const { validateRequest } = require("../middleware/validateRequest");

const validateDrawId = [
  param('drawId')
    .isMongoId()
    .withMessage('Invalid draw ID format'),
  validateRequest
];

const validateWinnerId = [
  param('winnerId')
    .isMongoId()
    .withMessage('Invalid winner ID format'),
  validateRequest
];

const validateBothIds = [
  param('drawId')
    .isMongoId()
    .withMessage('Invalid draw ID format'),
  param('winnerId')
    .isMongoId()
    .withMessage('Invalid winner ID format'),
  validateRequest
];

router.get("/info", getDrawInfo);
router.get("/results", getDrawResults);
router.get("/simulation", authenticate, authorizeAdmin, runSimulation);
router.post("/simulate", authenticate, authorizeAdmin, runMultipleSimulations);
router.post("/publish", authenticate, authorizeAdmin, publishDraw);
router.get("/logs", authenticate, authorizeAdmin, getDrawLogs);
router.get("/winners/me", authenticate, getMyWinnings);
router.get("/winners", authenticate, authorizeAdmin, getAllWinners);
router.post("/:drawId/winners/:winnerId/proof", authenticate, validateBothIds, submitProof);
router.post("/:drawId/winners/:winnerId/upload", authenticate, validateBothIds, upload.single("file"), uploadProof);
router.put("/:drawId/winners/:winnerId/status", authenticate, authorizeAdmin, validateBothIds, approveWinner);

module.exports = router;
