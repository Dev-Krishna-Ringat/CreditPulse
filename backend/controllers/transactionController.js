const Transaction = require("../models/Transaction");

// ADD TRANSACTION
const addTransaction = async (req, res) => {
    try {
        const { type, amount, category, description, date } = req.body;

        // Check required fields
        if (!type || !amount || !category || !date) {
            return res.status(400).json({
                message: "Type, amount, category and date are required"
            });
        }

        // Create transaction
        const transaction = await Transaction.create({
            userId: req.user.userId,
            type,
            amount,
            category,
            description: description || "",
            date
        });

        res.status(201).json({
            message: "Transaction added successfully",
            transaction
        });

    } catch (error) {
        console.error("Add Transaction Error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// GET USER TRANSACTIONS
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            userId: req.user.userId
        }).sort({ date: -1 });

        res.status(200).json({
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error("Get Transactions Error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    addTransaction,
    getTransactions
};