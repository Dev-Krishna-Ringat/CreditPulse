const Transaction = require("../models/Transaction");

// GET FINANCIAL ANALYTICS
const getAnalytics = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            userId: req.user.userId
        }).sort({ date: 1 });

        let totalIncome = 0;
        let totalExpense = 0;

        // Expense by category
        const expenseByCategory = {};

        // Monthly analytics
        const monthlyData = {};

        transactions.forEach((transaction) => {

            const transactionDate = new Date(transaction.date);

            const month = transactionDate.toLocaleString(
                "en-US",
                {
                    month: "short",
                    year: "numeric"
                }
            );

            // Create month if it doesn't exist
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    income: 0,
                    expense: 0
                };
            }

            if (transaction.type === "income") {

                totalIncome += transaction.amount;

                // Monthly income
                monthlyData[month].income += transaction.amount;

            } else if (transaction.type === "expense") {

                totalExpense += transaction.amount;

                // Expense by category
                if (!expenseByCategory[transaction.category]) {
                    expenseByCategory[transaction.category] = 0;
                }

                expenseByCategory[transaction.category] +=
                    transaction.amount;

                // Monthly expense
                monthlyData[month].expense += transaction.amount;
            }
        });

        const balance = totalIncome - totalExpense;

        // =========================
        // ADVANCED ANALYTICS
        // =========================

        const monthsCount = Object.keys(monthlyData).length;

        const averageMonthlyIncome =
            monthsCount > 0
                ? totalIncome / monthsCount
                : 0;

        const averageMonthlyExpense =
            monthsCount > 0
                ? totalExpense / monthsCount
                : 0;

        // Highest spending category
        let highestSpendingCategory = null;
        let highestSpendingAmount = 0;

        Object.entries(expenseByCategory).forEach(
            ([category, amount]) => {

                if (amount > highestSpendingAmount) {
                    highestSpendingCategory = category;
                    highestSpendingAmount = amount;
                }

            }
        );

        // Savings rate
        let savingsRate = 0;

        if (totalIncome > 0) {
            savingsRate =
                (balance / totalIncome) * 100;
        }

        res.status(200).json({
            totalTransactions: transactions.length,

            totalIncome,

            totalExpense,

            balance,

            averageMonthlyIncome: Number(
                averageMonthlyIncome.toFixed(2)
            ),

            averageMonthlyExpense: Number(
                averageMonthlyExpense.toFixed(2)
            ),

            highestSpendingCategory,

            highestSpendingAmount,

            savingsRate: Number(
                savingsRate.toFixed(2)
            ),

            expenseByCategory,

            monthlyData
        });

    } catch (error) {

        console.error(
            "Analytics Error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getAnalytics
};