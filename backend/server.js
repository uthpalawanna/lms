// This is the entry point. Running "node server.js" starts everything.
require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import your route files
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes"); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes); 

// A simple test route
app.get("/", (req, res) => {
  res.send("SHRI LMS backend is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});