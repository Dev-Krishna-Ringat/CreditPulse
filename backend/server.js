const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = 5000;

// Middleware
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const transactionRoutes = require("./routes/transactionRoutes");
app.use("/api/transactions", transactionRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("CreditPulse Backend is Running!");
});

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");

        app.listen(PORT, () => {
            console.log(`CreditPulse server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
    });