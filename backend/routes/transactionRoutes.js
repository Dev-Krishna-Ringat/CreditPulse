const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction
} = require("../controllers/transactionController");

// Add transaction
router.post("/", protect, addTransaction);

// Get logged-in user's transactions
router.get("/", protect, getTransactions);

// Delete transaction
router.delete("/:id", protect, deleteTransaction);

// Update transaction
router.put("/:id", protect, updateTransaction);

module.exports = router;