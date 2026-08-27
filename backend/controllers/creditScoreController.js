const Transaction = require("../models/Transaction");
const CreditScoreHistory = require("../models/CreditScoreHistory");


// =========================
// CALCULATE CREDIT SCORE
// =========================

const calculateCreditScore = (transactions) => {

    let income = 0;
    let expense = 0;

    transactions.forEach((transaction) => {
        if (transaction.type === "income") {
            income += transaction.amount;
        } else if (transaction.type === "expense") {
            expense += transaction.amount;
        }
    });


    // 1. Financial Balance
    let balanceScore = 0;

    const expenseRatio =
        income > 0 ? expense / income : 0;

    if (income > 0) {

        if (expenseRatio <= 0.30) {
            balanceScore = 180;
        } else if (expenseRatio <= 0.50) {
            balanceScore = 150;
        } else if (expenseRatio <= 0.70) {
            balanceScore = 120;
        } else if (expenseRatio <= 0.90) {
            balanceScore = 90;
        } else {
            balanceScore = 60;
        }

    } else {
        balanceScore = 40;
    }


    // 2. Transaction Activity
    const transactionCount = transactions.length;

    const activityScore = Math.min(
        transactionCount * 10,
        150
    );


    // 3. Income Stability
    const incomeTransactions = transactions.filter(
        (transaction) => transaction.type === "income"
    );

    const stabilityScore = Math.min(
        incomeTransactions.length * 20,
        120
    );


    // 4. Expense Management
    let managementScore = 0;
    let savingsRatio = 0;

    if (income > 0) {

        const savings = income - expense;

        savingsRatio = savings / income;

        if (savingsRatio >= 0.30) {
            managementScore = 120;
        } else if (savingsRatio >= 0.20) {
            managementScore = 100;
        } else if (savingsRatio >= 0.10) {
            managementScore = 80;
        } else if (savingsRatio >= 0) {
            managementScore = 60;
        } else {
            managementScore = 30;
        }
    }


    // 5. Consistency
    const uniqueDates = new Set(
        transactions.map((transaction) =>
            new Date(transaction.date)
                .toISOString()
                .split("T")[0]
        )
    );

    const consistencyScore = Math.min(
        uniqueDates.size * 8,
        80
    );


    // Final Score
    let score =
        300 +
        balanceScore +
        activityScore +
        stabilityScore +
        managementScore +
        consistencyScore;

    score = Math.min(score, 850);


    // Grade
    let grade;

    if (score >= 750) {
        grade = "Excellent";
    } else if (score >= 700) {
        grade = "Very Good";
    } else if (score >= 650) {
        grade = "Good";
    } else if (score >= 600) {
        grade = "Fair";
    } else {
        grade = "Needs Improvement";
    }


    return {
        score,
        grade,
        income,
        expense,
        expenseRatio,
        savingsRatio,
        transactionCount,
        incomeTransactions
    };
};



// =========================
// GET CREDIT SCORE
// =========================

const getCreditScore = async (req, res) => {

    try {

        const transactions = await Transaction.find({
            userId: req.user.userId
        }).sort({ date: 1 });


        // No transaction history
        if (transactions.length === 0) {

            return res.status(200).json({
                score: null,
                grade: "No Data",

                message:
                    "Add transactions to calculate your credit score.",

                insights: [
                    {
                        type: "info",

                        title:
                            "Start your CreditPulse journey",

                        message:
                            "Add your income and expense transactions so CreditPulse can analyze your financial activity."
                    }
                ]
            });
        }


        // Calculate score
        const {
            score,
            grade,
            income,
            expense,
            expenseRatio,
            savingsRatio,
            transactionCount,
            incomeTransactions
        } = calculateCreditScore(transactions);



        // =========================
        // CREDIT SCORE INSIGHTS
        // =========================

        const insights = [];


        // Expense insight
        if (income === 0) {

            insights.push({
                type: "warning",

                title:
                    "Add income transactions",

                message:
                    "Recording regular income will help CreditPulse understand your financial stability."
            });

        } else if (expenseRatio > 0.90) {

            insights.push({
                type: "warning",

                title:
                    "Expenses are very high",

                message:
                    "Your expenses are taking more than 90% of your income. Try reducing unnecessary spending."
            });

        } else if (expenseRatio > 0.70) {

            insights.push({
                type: "warning",

                title:
                    "Watch your spending",

                message:
                    "Your expenses are more than 70% of your income. Try to maintain a healthier income-to-expense balance."
            });

        } else if (expenseRatio <= 0.50) {

            insights.push({
                type: "positive",

                title:
                    "Good expense control",

                message:
                    "Your expenses are within 50% of your income. Keep maintaining this healthy balance."
            });
        }



        // Savings insight
        if (savingsRatio < 0) {

            insights.push({
                type: "warning",

                title:
                    "Build positive savings",

                message:
                    "Your expenses are currently higher than your income. Focus on reducing expenses and building positive monthly savings."
            });

        } else if (savingsRatio < 0.10) {

            insights.push({
                type: "info",

                title:
                    "Increase your savings",

                message:
                    "Try to save at least 10% of your income consistently to strengthen your financial profile."
            });

        } else {

            insights.push({
                type: "positive",

                title:
                    "Healthy savings",

                message:
                    "You are maintaining positive savings. Keep this habit consistent."
            });
        }



        // Transaction activity insight
        if (transactionCount < 5) {

            insights.push({
                type: "info",

                title:
                    "Build transaction history",

                message:
                    "Keep recording your regular financial transactions so CreditPulse has more activity to analyze."
            });

        } else {

            insights.push({
                type: "positive",

                title:
                    "Good transaction activity",

                message:
                    "Your transaction history gives CreditPulse more data to understand your financial behavior."
            });
        }



        // Income stability insight
        if (incomeTransactions.length < 3) {

            insights.push({
                type: "info",

                title:
                    "Improve income consistency",

                message:
                    "Regularly recording your income can help demonstrate a more consistent financial pattern."
            });
        }



        // =========================
        // SEND RESPONSE
        // =========================

        res.status(200).json({

            score,

            grade,

            summary: {

                totalTransactions:
                    transactions.length,

                totalIncome:
                    income,

                totalExpense:
                    expense,

                balance:
                    income - expense
            },

            insights
        });


    } catch (error) {

        console.error(
            "Credit Score Error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};



// =========================
// SAVE CREDIT SCORE HISTORY
// =========================
// This function will be called ONLY
// after Add / Edit / Delete transaction.

const saveCreditScoreHistory = async (userId) => {

    try {

        const transactions =
            await Transaction.find({
                userId
            }).sort({ date: 1 });


        // No transactions
        if (transactions.length === 0) {
            return;
        }


        // Calculate current score
        const {
            score,
            grade
        } = calculateCreditScore(transactions);


        // Get latest history
        const latestHistory =
            await CreditScoreHistory.findOne({
                userId
            }).sort({
                createdAt: -1
            });


        // Save ONLY when score changes
        if (
            !latestHistory ||
            latestHistory.score !== score ||
            latestHistory.grade !== grade
        ) {

            await CreditScoreHistory.create({

                userId,

                score,

                grade
            });


            console.log(
                `Credit Score History Saved: ${score} (${grade})`
            );

        } else {

            console.log(
                `Credit Score unchanged: ${score} (${grade})`
            );
        }


    } catch (error) {

        console.error(
            "Save Credit Score History Error:",
            error.message
        );
    }
};



// =========================
// GET CREDIT SCORE HISTORY
// =========================

const getCreditScoreHistory = async (req, res) => {
    try {

        const history = await CreditScoreHistory.find({
            userId: req.user.userId
        }).sort({
            createdAt: -1
        });

        // Remove consecutive duplicate scores
        const cleanHistory = [];

        for (const record of history) {

            const lastRecord =
                cleanHistory[cleanHistory.length - 1];

            if (
                !lastRecord ||
                lastRecord.score !== record.score ||
                lastRecord.grade !== record.grade
            ) {
                cleanHistory.push(record);
            }
        }

        res.status(200).json({
            count: cleanHistory.length,
            history: cleanHistory
        });

    } catch (error) {

        console.error(
            "Credit Score History Error:",
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

    getCreditScore,

    getCreditScoreHistory,

    saveCreditScoreHistory

};