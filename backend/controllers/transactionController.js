const Transaction = require("../models/Transaction");
const {
    saveCreditScoreHistory
} = require("./creditScoreController");


// =========================
// ADD TRANSACTION
// =========================

const addTransaction = async (req, res) => {
    try {
        const {
            type,
            amount,
            category,
            description,
            date
        } = req.body;

        // Check required fields
        if (!type || !amount || !category || !date) {
            return res.status(400).json({
                message:
                    "Type, amount, category and date are required"
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


        // Save credit score history
        await saveCreditScoreHistory(
            req.user.userId
        );


        res.status(201).json({
            message:
                "Transaction added successfully",
            transaction
        });

    } catch (error) {

        console.error(
            "Add Transaction Error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};



// =========================
// GET USER TRANSACTIONS
// =========================

const getTransactions = async (req, res) => {
    try {

        const transactions =
            await Transaction.find({
                userId: req.user.userId
            }).sort({ date: -1 });


        res.status(200).json({
            count: transactions.length,
            transactions
        });

    } catch (error) {

        console.error(
            "Get Transactions Error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};



// =========================
// DELETE TRANSACTION
// =========================

const deleteTransaction = async (req, res) => {
    try {

        const transaction =
            await Transaction.findOne({
                _id: req.params.id,
                userId: req.user.userId
            });


        // Transaction not found
        if (!transaction) {
            return res.status(404).json({
                message:
                    "Transaction not found"
            });
        }


        await Transaction.deleteOne({
            _id: req.params.id
        });


        // Save updated credit score history
        await saveCreditScoreHistory(
            req.user.userId
        );


        res.status(200).json({
            message:
                "Transaction deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete Transaction Error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};



// =========================
// UPDATE TRANSACTION
// =========================

const updateTransaction = async (req, res) => {
    try {

        const {
            type,
            amount,
            category,
            description,
            date
        } = req.body;


        // Check required fields
        if (!type || !amount || !category || !date) {
            return res.status(400).json({
                message:
                    "Type, amount, category and date are required"
            });
        }


        // Find transaction belonging to logged-in user
        const transaction =
            await Transaction.findOne({
                _id: req.params.id,
                userId: req.user.userId
            });


        // Transaction not found
        if (!transaction) {
            return res.status(404).json({
                message:
                    "Transaction not found"
            });
        }


        // Update transaction fields
        transaction.type = type;
        transaction.amount = amount;
        transaction.category = category;
        transaction.description =
            description || "";
        transaction.date = date;


        await transaction.save();


        // Save updated credit score history
        await saveCreditScoreHistory(
            req.user.userId
        );


        res.status(200).json({
            message:
                "Transaction updated successfully",
            transaction
        });

    } catch (error) {

        console.error(
            "Update Transaction Error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};



// =========================
// EXPORT CONTROLLERS
// =========================

module.exports = {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction
};