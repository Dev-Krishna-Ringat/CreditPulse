import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");

  // =========================
  // TRANSACTIONS
  // =========================
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionData, setTransactionData] = useState({
    type: "income",
    amount: "",
    category: "Salary",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [transactions, setTransactions] = useState([]);
  const [transactionSearch, setTransactionSearch] = useState("");
    const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
    const [transactionCategoryFilter, setTransactionCategoryFilter] = useState("all");
  const [transactionLoading, setTransactionLoading] = useState(false);
    const filteredTransactions = transactions.filter((transaction) => {
    const searchText = transactionSearch.toLowerCase();

    const matchesSearch =
        transaction.category?.toLowerCase().includes(searchText) ||
        transaction.description?.toLowerCase().includes(searchText);

    const matchesType =
        transactionTypeFilter === "all" ||
        transaction.type === transactionTypeFilter;

    const matchesCategory =
        transactionCategoryFilter === "all" ||
        transaction.category === transactionCategoryFilter;

    return matchesSearch && matchesType && matchesCategory;
});
  const [editingTransactionId, setEditingTransactionId] = useState(null);

  // =========================
  // CREDIT SCORE
  // =========================
  const [creditScore, setCreditScore] = useState(null);
  const [creditGrade, setCreditGrade] = useState("No Data");
  const [creditInsights, setCreditInsights] = useState([]);
  const [creditScoreHistory, setCreditScoreHistory] = useState([]);

  // =========================
  // FINANCIAL ANALYTICS
  // =========================
  const [analytics, setAnalytics] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    savingsRate: 0,

    // Advanced analytics
    averageMonthlyIncome: 0,
    averageMonthlyExpense: 0,
    highestSpendingCategory: null,
    highestSpendingAmount: 0,

    expenseByCategory: {},
    monthlyData: {},
});

  const transactionCategories = [
    "Salary", "Food", "Shopping", "Travel", "Bills",
    "Rent", "Education", "Healthcare", "Entertainment", "Other",
  ];

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("creditpulse_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {

  if (user) {

    loadTransactions();

    loadCreditScore();
    loadCreditScoreHistory();

    loadAnalytics();

  } else {

    setTransactions([]);

    setCreditScore(null);

    setCreditGrade("No Data");

  }

}, [user]);

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("creditpulse_token", data.token);
      localStorage.setItem(
        "creditpulse_user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
      setMessage("Login successful! 🎉");
    } catch (error) {
      setMessage(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REGISTER
  // =========================
  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage(
        "Registration successful! Please login. 🎉"
      );

      setRegisterData({
        name: "",
        email: "",
        password: "",
      });

      setShowLogin(true);
    } catch (error) {
      setMessage(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORGOT PASSWORD
  // =========================
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Password reset failed");
        return;
      }

      // Save reset token temporarily for development testing
      setResetToken(data.resetToken);

      setMessage(
        "Reset token generated successfully! 🔐"
      );

      // Move to reset password screen
      setShowForgotPassword(false);
      setShowResetPassword(true);
    } catch (error) {
      setMessage(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET PASSWORD
  // =========================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    setMessage("");

    if (newPassword.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    if (!resetToken) {
      setMessage(
        "Reset token is missing. Please request a new reset."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/reset-password/${resetToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Password reset failed"
        );
        return;
      }

      setMessage(
        "Password reset successful! You can now login. 🎉"
      );

      // Clear reset data
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");

      // Go back to login
      setShowResetPassword(false);
      setShowForgotPassword(false);
      setShowLogin(true);

      setLoginData({
        email: forgotEmail,
        password: "",
      });
    } catch (error) {
      setMessage(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD TRANSACTIONS
  // =========================
  const loadTransactions = async () => {
    const token = localStorage.getItem("creditpulse_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Load Transactions Error:", error);
    }
  };

  // =========================
  // LOAD CREDIT SCORE
  // =========================
  const loadCreditScore = async () => {
    const token = localStorage.getItem("creditpulse_token");

    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/credit-score`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCreditScore(data.score ?? null);
        setCreditGrade(data.grade || "No Data");

        const backendInsights = (data.insights || []).map(
          (insight) => ({
            icon:
              insight.type === "positive"
                ? "✅"
                : insight.type === "warning"
                ? "⚠️"
                : "💡",
            title: insight.title,
            text: insight.message,
          })
        );

        setCreditInsights(backendInsights);
      } else {
        console.error(
          "Credit Score Error:",
          data.message
        );

        setCreditInsights([]);
      }
    } catch (error) {
      console.error(
        "Load Credit Score Error:",
        error
      );

      setCreditInsights([]);
    }
  };

  const loadCreditScoreHistory = async () => {
    const token = localStorage.getItem("creditpulse_token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/credit-score/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCreditScoreHistory(data.history || []);
      } else {
        console.error(
          "Credit Score History Error:",
          data.message
        );
      }
    } catch (error) {
      console.error(
        "Load Credit Score History Error:",
        error
      );
    }
  };

  // =========================
  // LOAD FINANCIAL ANALYTICS
  // =========================
  const loadAnalytics = async () => {
    const token = localStorage.getItem("creditpulse_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAnalytics(data);
      } else {
        console.error("Analytics Error:", data.message);
      }
    } catch (error) {
      console.error("Load Analytics Error:", error);
    }
  };

  // =========================
  // ADD TRANSACTION
  // =========================
  const handleAddTransaction = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("creditpulse_token");

    if (!token) {
      setMessage("Please login again.");
      return;
    }

    if (Number(transactionData.amount) <= 0) {
      setMessage("Amount must be greater than 0.");
      return;
    }

    setTransactionLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...transactionData,
          amount: Number(transactionData.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not add transaction.");
        return;
      }

      setTransactions((current) => [data.transaction, ...current]);

      // Refresh analytics and credit score after adding a transaction
      await loadAnalytics();
      await loadCreditScore();
      await loadCreditScoreHistory();

      setTransactionData({
        type: "income",
        amount: "",
        category: "Salary",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });

      setShowAddTransaction(false);
      setMessage("Transaction added successfully! 🎉");
    } catch (error) {
      setMessage(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setTransactionLoading(false);
    }
  };

  // =========================
  // UPDATE TRANSACTION
  // =========================
  const handleUpdateTransaction = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("creditpulse_token");

    if (!token) {
      setMessage("Please login again.");
      return;
    }

    if (!editingTransactionId) {
      setMessage("No transaction selected for editing.");
      return;
    }

    if (Number(transactionData.amount) <= 0) {
      setMessage("Amount must be greater than 0.");
      return;
    }

    setTransactionLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/transactions/${editingTransactionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...transactionData,
            amount: Number(transactionData.amount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not update transaction.");
        return;
      }

      setTransactions((current) =>
        current.map((transaction) =>
          transaction._id === editingTransactionId
            ? data.transaction
            : transaction
        )
      );

      await loadAnalytics();
      await loadCreditScore();
      await loadCreditScoreHistory();

      setEditingTransactionId(null);
      setTransactionData({
        type: "income",
        amount: "",
        category: "Salary",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });

      setMessage("Transaction updated successfully! ✏️");
    } catch (error) {
      setMessage(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransactionId(transaction._id);

    setTransactionData({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description || "",
      date: new Date(transaction.date).toISOString().split("T")[0],
    });

    setShowAddTransaction(true);
    setMessage("");

      // =========================
// TRANSACTION FILTERING
// =========================
const filteredTransactions = transactions.filter((transaction) => {
    const search = transactionSearch.toLowerCase().trim();

    const matchesSearch =
        !search ||
        transaction.category?.toLowerCase().includes(search) ||
        transaction.description?.toLowerCase().includes(search);

    const matchesType =
        transactionTypeFilter === "all" ||
        transaction.type === transactionTypeFilter;

    const matchesCategory =
        transactionCategoryFilter === "all" ||
        transaction.category === transactionCategoryFilter;

    return (
        matchesSearch &&
        matchesType &&
        matchesCategory
    );
});

    // Scroll directly to the Edit Transaction form
    setTimeout(() => {
      document
        .querySelector(".transaction-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  };

  // =========================
  // DELETE TRANSACTION
  // =========================
  const handleDeleteTransaction = async (transactionId) => {
    const token = localStorage.getItem("creditpulse_token");

    if (!token) {
      setMessage("Please login again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/transactions/${transactionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Could not delete transaction."
        );
        return;
      }

      setTransactions((current) =>
        current.filter(
          (transaction) => transaction._id !== transactionId
        )
      );

      await loadAnalytics();
      await loadCreditScore();
      await loadCreditScoreHistory();

      setMessage("Transaction deleted successfully! 🗑️");
    } catch (error) {
      setMessage(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("creditpulse_token");
    localStorage.removeItem("creditpulse_user");

    setUser(null);

    setLoginData({
      email: "",
      password: "",
    });

    setMessage("");
  };

  // =========================
  // DASHBOARD
  // =========================
  if (user) {
    return (
      <div className="creditpulse-app">
        <nav className="navbar">
          <div className="logo">
            <span>💳</span> CreditPulse
          </div>

          <button
            className="active"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>

        <main className="dashboard">
          <div className="dashboard-header">
            <p className="badge">
              CREDITPULSE DASHBOARD
            </p>

            <h1>
              Welcome, <span>{user.name}</span> 👋
            </h1>

            <p className="description">
              Your financial journey starts here.
            </p>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-icon">👤</div>

              <h3>Profile</h3>

              <p>{user.email}</p>
            </div>

            <div className="dashboard-card credit-score-card">

  <div className="credit-score-top">
    <div className="card-icon">💳</div>

    <span className="score-label">
      CREDIT HEALTH
    </span>
  </div>

  <h3>Credit Score</h3>

  <div className="score-display">
    <strong>
      {creditScore ?? "--"}
    </strong>

    {creditScore !== null && (
      <span>/ 850</span>
    )}
  </div>

  {creditScore !== null && (
    <div className="score-bar">
      <div
        className="score-bar-fill"
        style={{
          width: `${(creditScore / 850) * 100}%`
        }}
      ></div>
    </div>
  )}

  <div className="score-status">
    {creditScore !== null
      ? creditGrade
      : "No Data"}
  </div>

  <p className="score-description">
    {creditScore !== null
      ? "Based on your financial activity"
      : "Add transactions to calculate your score."}
  </p>

</div>

            <div className="dashboard-card">
              <div className="card-icon">📊</div>

              <h3>Transactions</h3>

              <strong className="score">{transactions.length}</strong>

              <p>
                Track your financial activity.
              </p>
            </div>
          </div>

          {/* =========================
              FINANCIAL ANALYTICS
          ========================= */}
          <section
            style={{
              marginTop: "28px",
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "16px",
              width: "100%",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(20, 35, 65, 0.65)",
              }}
            >
              <div style={{ fontSize: "28px" }}>💰</div>
              <p style={{ margin: "10px 0 4px", opacity: 0.75 }}>
                Total Income
              </p>
              <strong style={{ fontSize: "24px" }}>
                ₹{Number(analytics.totalIncome).toLocaleString("en-IN")}
              </strong>
            </div>

            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(20, 35, 65, 0.65)",
              }}
            >
              <div style={{ fontSize: "28px" }}>💸</div>
              <p style={{ margin: "10px 0 4px", opacity: 0.75 }}>
                Total Expense
              </p>
              <strong style={{ fontSize: "24px" }}>
                ₹{Number(analytics.totalExpense).toLocaleString("en-IN")}
              </strong>
            </div>

            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(20, 35, 65, 0.65)",
              }}
            >
              <div style={{ fontSize: "28px" }}>💵</div>
              <p style={{ margin: "10px 0 4px", opacity: 0.75 }}>
                Current Balance
              </p>
              <strong style={{ fontSize: "24px" }}>
                ₹{Number(analytics.balance).toLocaleString("en-IN")}
              </strong>
            </div>

           <div
  style={{
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(20, 35, 65, 0.65)",
  }}
>
  <div style={{ fontSize: "28px" }}>📊</div>
  <p style={{ margin: "10px 0 4px", opacity: 0.75 }}>
    Avg. Monthly Income
  </p>
  <strong style={{ fontSize: "24px" }}>
    ₹{Number(
      analytics.averageMonthlyIncome || 0
    ).toLocaleString("en-IN")}
  </strong>
</div>

<div
  style={{
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(20, 35, 65, 0.65)",
  }}
>
  <div style={{ fontSize: "28px" }}>💸</div>
  <p style={{ margin: "10px 0 4px", opacity: 0.75 }}>
    Avg. Monthly Expense
  </p>
  <strong style={{ fontSize: "24px" }}>
    ₹{Number(
      analytics.averageMonthlyExpense || 0
    ).toLocaleString("en-IN")}
  </strong>
</div>

<div
  style={{
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(20, 35, 65, 0.65)",
  }}
>
  <div style={{ fontSize: "28px" }}>🏆</div>
  <p style={{ margin: "10px 0 4px", opacity: 0.75 }}>
    Top Spending Category
  </p>
  <strong style={{ fontSize: "22px" }}>
    {analytics.highestSpendingCategory || "No Data"}
  </strong>
  <div style={{ marginTop: "6px", opacity: 0.7 }}>
    ₹{Number(
      analytics.highestSpendingAmount || 0
    ).toLocaleString("en-IN")}
  </div>
</div>
          </section>

          {/* =========================
              EXPENSE BREAKDOWN
          ========================= */}
          {Object.keys(analytics.expenseByCategory || {}).length > 0 && (
            <section
              style={{
                marginTop: "28px",
                padding: "24px",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(20, 35, 65, 0.65)",
              }}
            >
              <h2 style={{ margin: "0 0 8px" }}>
                Expense Breakdown
              </h2>

              <p style={{ margin: "0 0 20px", opacity: 0.75 }}>
                See where your money is being spent.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {Object.entries(analytics.expenseByCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const percentage =
                      analytics.totalExpense > 0
                        ? (amount / analytics.totalExpense) * 100
                        : 0;

                    return (
                      <div key={category}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "16px",
                            marginBottom: "7px",
                          }}
                        >
                          <strong>{category}</strong>

                          <strong>
                            ₹{Number(amount).toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div
                          style={{
                            height: "9px",
                            borderRadius: "999px",
                            background: "rgba(255,255,255,0.10)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              height: "100%",
                              borderRadius: "999px",
                              background:
                                "linear-gradient(90deg, #3478f6, #48d6a8)",
                            }}
                          />
                        </div>

                        <small style={{ opacity: 0.65 }}>
                          {percentage.toFixed(1)}% of total expenses
                        </small>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {/* =========================
              MONTHLY FINANCIAL TREND
          ========================= */}
          {Object.keys(analytics.monthlyData || {}).length > 0 && (
            <section
              style={{
                marginTop: "28px",
                padding: "24px",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(20, 35, 65, 0.65)",
              }}
            >
              <h2 style={{ margin: "0 0 8px" }}>
                Monthly Financial Trend
              </h2>

              <p style={{ margin: "0 0 22px", opacity: 0.75 }}>
                Compare your income and expenses month by month.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "18px",
                }}
              >
                {Object.entries(analytics.monthlyData).map(
                  ([month, data]) => {
                    const maxValue = Math.max(
                      Number(data.income) || 0,
                      Number(data.expense) || 0,
                      1
                    );

                    const incomeWidth =
                      ((Number(data.income) || 0) / maxValue) * 100;

                    const expenseWidth =
                      ((Number(data.expense) || 0) / maxValue) * 100;

                    return (
                      <div key={month}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <strong>{month}</strong>

                          <span style={{ opacity: 0.7 }}>
                            Balance: ₹
                            {(
                              (Number(data.income) || 0) -
                              (Number(data.expense) || 0)
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div style={{ marginBottom: "9px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                              fontSize: "13px",
                            }}
                          >
                            <span>Income</span>
                            <span>
                              ₹
                              {Number(data.income || 0).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>

                          <div
                            style={{
                              height: "8px",
                              borderRadius: "999px",
                              background: "rgba(255,255,255,0.10)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${incomeWidth}%`,
                                height: "100%",
                                borderRadius: "999px",
                                background:
                                  "linear-gradient(90deg, #3478f6, #48d6a8)",
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                              fontSize: "13px",
                            }}
                          >
                            <span>Expense</span>
                            <span>
                              ₹
                              {Number(data.expense || 0).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>

                          <div
                            style={{
                              height: "8px",
                              borderRadius: "999px",
                              background: "rgba(255,255,255,0.10)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${expenseWidth}%`,
                                height: "100%",
                                borderRadius: "999px",
                                background:
                                  "linear-gradient(90deg, #ff8a65, #ff5252)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* =========================
              CREDIT SCORE HISTORY
          ========================= */}
          {creditScoreHistory.length > 0 && (
            <section
              style={{
                marginTop: "28px",
                padding: "24px",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(20, 35, 65, 0.65)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "22px",
                }}
              >
                <div>
                  <h2 style={{ margin: "0 0 8px" }}>
                    📈 Credit Score History
                  </h2>

                  <p style={{ margin: 0, opacity: 0.75 }}>
                    Track how your CreditPulse score changes over time.
                  </p>
                </div>

                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    background: "rgba(52, 120, 246, 0.12)",
                    border: "1px solid rgba(52, 120, 246, 0.25)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <strong>{creditScoreHistory.length}</strong>{" "}
                  records
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {creditScoreHistory.slice(0, 10).map((item, index) => {
                  const score = Number(item.score) || 0;

                  return (
                    <div
                      key={item._id || index}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "80px 1fr auto",
                        alignItems: "center",
                        gap: "16px",
                        padding: "14px 16px",
                        borderRadius: "14px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            fontSize: "22px",
                          }}
                        >
                          {score}
                        </strong>
                        <span
                          style={{
                            display: "block",
                            fontSize: "11px",
                            opacity: 0.55,
                          }}
                        >
                          / 850
                        </span>
                      </div>

                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "7px",
                            gap: "10px",
                          }}
                        >
                          <strong>{item.grade}</strong>

                          <span
                            style={{
                              fontSize: "12px",
                              opacity: 0.6,
                            }}
                          >
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString(
                                  "en-IN"
                                )
                              : "Recent"}
                          </span>
                        </div>

                        <div
                          style={{
                            height: "7px",
                            borderRadius: "999px",
                            background: "rgba(255,255,255,0.10)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(
                                (score / 850) * 100,
                                100
                              )}%`,
                              height: "100%",
                              borderRadius: "999px",
                              background:
                                "linear-gradient(90deg, #3478f6, #48d6a8)",
                            }}
                          />
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: "13px",
                          opacity: 0.6,
                        }}
                      >
                        #{index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* =========================
              CREDIT SCORE INSIGHTS
          ========================= */}
          {creditInsights.length > 0 && (
            <section
              style={{
                marginTop: "28px",
                padding: "24px",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(20, 35, 65, 0.65)",
              }}
            >
              <h2 style={{ margin: "0 0 8px" }}>
                🧠 Credit Score Insights
              </h2>

              <p style={{ margin: "0 0 20px", opacity: 0.75 }}>
                Personalized insights based on your financial activity.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {creditInsights.map((insight, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "16px",
                      alignItems: "flex-start",
                      padding: "16px",
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div style={{ fontSize: "28px" }}>
                      {insight.icon}
                    </div>

                    <div>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "17px",
                          marginBottom: "5px",
                        }}
                      >
                        {insight.title}
                      </strong>

                      <p
                        style={{
                          margin: 0,
                          opacity: 0.75,
                          lineHeight: 1.5,
                        }}
                      >
                        {insight.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="dashboard-welcome">
            <h2>Your CreditPulse journey</h2>

            <p>
              Add your financial transactions and CreditPulse
              will analyze your activity to help build your
              alternative credit profile.
            </p>

            <button
              className="submit-btn"
              onClick={() => {
                setShowAddTransaction((current) => !current);
                setMessage("");
              }}
            >
              {showAddTransaction
                ? "Close Transaction Form"
                : "Add Your First Transaction"}
            </button>

            {message && (
              <p className="form-message">{message}</p>
            )}

            {showAddTransaction && (
              <form
                onSubmit={
                  editingTransactionId
                    ? handleUpdateTransaction
                    : handleAddTransaction
                }
                className="transaction-form"
              >
                <div className="transaction-form-header">
                  <div className="transaction-header-icon">{editingTransactionId ? "✏️" : "＋"}</div>

                  <div>
                    <h3>{editingTransactionId ? "Edit Transaction" : "Add New Transaction"}</h3>
                    <p>{editingTransactionId ? "Update your transaction details" : "Track your income and expenses"}</p>
                  </div>

                  <div className="transaction-wallet-icon">💳</div>
                </div>

                <div className="transaction-field">
                  <div className="field-icon type-icon">↕</div>
                  <div className="field-content">
                    <label>Transaction Type</label>
                    <select
                      value={transactionData.type}
                      onChange={(e) =>
                        setTransactionData({
                          ...transactionData,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                </div>

                <div className="transaction-field">
                  <div className="field-icon amount-icon">₹</div>
                  <div className="field-content">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Enter amount"
                      value={transactionData.amount}
                      onChange={(e) =>
                        setTransactionData({
                          ...transactionData,
                          amount: e.target.value,
                        })
                      }
                      required
                    />
                    <small>Enter the amount in INR (Rupees)</small>
                  </div>
                </div>

                <div className="transaction-field">
                  <div className="field-icon category-icon">◆</div>
                  <div className="field-content">
                    <label>Category</label>
                    <select
                      value={transactionData.category}
                      onChange={(e) =>
                        setTransactionData({
                          ...transactionData,
                          category: e.target.value,
                        })
                      }
                    >
                      {transactionCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <small>Select the category of this transaction</small>
                  </div>
                </div>

                <div className="transaction-field">
                  <div className="field-icon description-icon">▤</div>
                  <div className="field-content">
                    <label>Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Monthly salary"
                      value={transactionData.description}
                      onChange={(e) =>
                        setTransactionData({
                          ...transactionData,
                          description: e.target.value,
                        })
                      }
                    />
                    <small>Add a short description (optional)</small>
                  </div>
                </div>

                <div className="transaction-field">
                  <div className="field-icon date-icon">▣</div>
                  <div className="field-content">
                    <label>Date</label>
                    <input
                      type="date"
                      value={transactionData.date}
                      onChange={(e) =>
                        setTransactionData({
                          ...transactionData,
                          date: e.target.value,
                        })
                      }
                      required
                    />
                    <small>Select the transaction date</small>
                  </div>
                </div>

                <button
                  type="submit"
                  className="transaction-submit-btn"
                  disabled={transactionLoading}
                >
                  {transactionLoading
                    ? editingTransactionId
                      ? "Updating..."
                      : "Saving..."
                    : editingTransactionId
                    ? "✏️  Update Transaction"
                    : "➤  Add Transaction"}
                </button>
                {editingTransactionId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTransactionId(null);
                      setTransactionData({
                        type: "income",
                        amount: "",
                        category: "Salary",
                        description: "",
                        date: new Date().toISOString().split("T")[0],
                      });
                      setMessage("");
                    }}
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.06)",
                      color: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Cancel Edit
                  </button>
                )}

                <p className="transaction-security">
                  🔒 Your data is secure and encrypted
                </p>
              </form>
            )}
          </section>

          {transactions.length > 0 && (
            <section
              className="dashboard-welcome"
              style={{ marginTop: "24px" }}
            >
              <div className="transaction-filters">

    <input
        type="text"
        placeholder="Search transactions..."
        value={transactionSearch}
        onChange={(e) => setTransactionSearch(e.target.value)}
    />

    <select
        value={transactionTypeFilter}
        onChange={(e) => setTransactionTypeFilter(e.target.value)}
    >
        <option value="all">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
    </select>

    <select
        value={transactionCategoryFilter}
        onChange={(e) =>
            setTransactionCategoryFilter(e.target.value)
        }
    >
        <option value="all">All Categories</option>

      <option value="Salary">Salary</option>
<option value="Food">Food</option>
<option value="Shopping">Shopping</option>
<option value="Travel">Travel</option>
<option value="Bills">Bills</option>
<option value="Rent">Rent</option>
<option value="Education">Education</option>
<option value="Healthcare">Healthcare</option>
<option value="Entertainment">Entertainment</option>
<option value="Other">Other</option>
       </select>

    <button
        type="button"
        className="clear-filters-btn"
        onClick={() => {
            setTransactionSearch("");
            setTransactionTypeFilter("all");
            setTransactionCategoryFilter("all");
        }}
    >
        Clear Filters
    </button>

</div>
              <h2>Recent Transactions</h2>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                {filteredTransactions.length === 0 && (
    <div className="no-transactions-found">
        <div className="no-transactions-icon">🔍</div>
        <h3>No transactions found</h3>
        <p>Try changing your search or filters.</p>
    </div>
)}
    {filteredTransactions.length > 0 && (
    <div className="transaction-result-count">
        Showing {filteredTransactions.length} of {transactions.length} transactions
    </div>
)}
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <div>
                      <strong>{transaction.category}</strong>

                      <p style={{ margin: "5px 0 0", opacity: 0.75 }}>
                        {transaction.description || "No description"} ·{" "}
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>

                    <strong>
                      {transaction.type === "income" ? "+" : "-"} ₹
                      {Number(transaction.amount).toLocaleString("en-IN")}
                    </strong>

                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      style={{
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        background: "rgba(52, 120, 246, 0.15)",
                        color: "#6ea8fe",
                      }}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteTransaction(transaction._id)
                      }
                      style={{
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        background: "rgba(255, 80, 80, 0.15)",
                        color: "#ff6b6b",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <footer>
          © 2026 CreditPulse · Smart Alternative Credit Scoring
        </footer>
      </div>
    );
  }

  return (
    <div className="creditpulse-app">
      <nav className="navbar">
        <div className="logo">
          <span>💳</span> CreditPulse
        </div>

        <div className="nav-buttons">
          <button
            className={
              showLogin && !showForgotPassword && !showResetPassword
                ? "active"
                : ""
            }
            onClick={() => {
              setShowLogin(true);
              setShowForgotPassword(false);
              setShowResetPassword(false);
              setMessage("");
            }}
          >
            Login
          </button>

          <button
            className={!showLogin ? "active" : ""}
            onClick={() => {
              setShowLogin(false);
              setShowForgotPassword(false);
              setShowResetPassword(false);
              setMessage("");
            }}
          >
            Register
          </button>
        </div>
      </nav>

      <main className="auth-container">

        {/* LEFT SIDE */}
        <section className="intro">
          <p className="badge">
            SMART CREDIT SCORING
          </p>

          <h1>
            Build your <span>financial future</span> with
            CreditPulse.
          </h1>

          <p className="description">
            An alternative credit scoring platform designed
            to help individuals build financial credibility
            through their real financial activity.
          </p>

          <div className="features">
            <div>
              <strong>📊 Smart Analysis</strong>
              <small>
                Understand your financial behavior.
              </small>
            </div>

            <div>
              <strong>🔐 Secure</strong>
              <small>
                Your financial data stays protected.
              </small>
            </div>

            <div>
              <strong>⚡ Simple</strong>
              <small>
                Track transactions and build your score.
              </small>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="auth-card">

          {/* =========================
              RESET PASSWORD
          ========================= */}
          {showResetPassword ? (
            <>
              <h2>Reset Password</h2>

              <p className="card-subtitle">
                Create a new password for your account.
              </p>

              <form onSubmit={handleResetPassword}>

                <label>New Password</label>

                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  required
                />

                <label>Confirm Password</label>

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Updating..."
                    : "Reset Password"}
                </button>
              </form>

              {message && (
                <p className="form-message">
                  {message}
                </p>
              )}

              <p className="switch-text">
                Remember your password?{" "}
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setShowLogin(true);
                    setMessage("");
                  }}
                >
                  Back to Login
                </button>
              </p>
            </>

          ) : showForgotPassword ? (

            /* =========================
               FORGOT PASSWORD
            ========================= */
            <>
              <h2>Forgot Password?</h2>

              <p className="card-subtitle">
                Enter your registered email to reset your
                password.
              </p>

              <form onSubmit={handleForgotPassword}>

                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) =>
                    setForgotEmail(e.target.value)
                  }
                  required
                />

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : "Send Reset Link"}
                </button>
              </form>

              {message && (
                <p className="form-message">
                  {message}
                </p>
              )}

              <p className="switch-text">
                Remember your password?{" "}
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setMessage("");
                  }}
                >
                  Back to Login
                </button>
              </p>
            </>

          ) : showLogin ? (

            /* =========================
               LOGIN
            ========================= */
            <>
              <h2>Welcome back</h2>

              <p className="card-subtitle">
                Login to continue to CreditPulse
              </p>

              <form onSubmit={handleLogin}>

                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      email: e.target.value,
                    })
                  }
                  required
                />

                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({
                      ...loginData,
                      password: e.target.value,
                    })
                  }
                  required
                />

                <div className="forgot-password">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setMessage("");
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Logging in..."
                    : "Login"}
                </button>
              </form>

              {message && (
                <p className="form-message">
                  {message}
                </p>
              )}

              <p className="switch-text">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setShowLogin(false);
                    setMessage("");
                  }}
                >
                  Create account
                </button>
              </p>
            </>

          ) : (

            /* =========================
               REGISTER
            ========================= */
            <>
              <h2>Create account</h2>

              <p className="card-subtitle">
                Start your CreditPulse journey
              </p>

              <form onSubmit={handleRegister}>

                <label>Full Name</label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      name: e.target.value,
                    })
                  }
                  required
                />

                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value,
                    })
                  }
                  required
                />

                <label>Password</label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  required
                />

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Creating..."
                    : "Register"}
                </button>
              </form>

              {message && (
                <p className="form-message">
                  {message}
                </p>
              )}

              <p className="switch-text">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setMessage("");
                  }}
                >
                  Login
                </button>
              </p>
            </>
          )}
        </section>
      </main>

      <footer>
        © 2026 CreditPulse · Smart Alternative Credit Scoring
      </footer>
    </div>
  );
}

export default App;