const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getCreditScore,
    getCreditScoreHistory
} = require("../controllers/creditScoreController");

// Get logged-in user's credit score
router.get("/", protect, getCreditScore);

// Get logged-in user's credit score history
router.get("/history", protect, getCreditScoreHistory);

module.exports = router;