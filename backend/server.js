// This is the entry point. Running "node server.js" starts everything.
require("dotenv").config();

// Fix for a common Windows/campus-network issue: Node's built-in DNS resolver
// (c-ares) sometimes fails to look up MongoDB's SRV records even when the
// operating system's own DNS works fine. Forcing Node to use Google's public
// DNS servers directly avoids this.
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware: lets our server understand JSON request bodies
app.use(express.json());

// Middleware: allows your React app (running on a different port) to talk to this server
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

// A simple test route to check the server is alive
app.get("/", (req, res) => {
  res.send("SHRI LMS backend is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});