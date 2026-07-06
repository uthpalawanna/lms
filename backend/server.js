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
const courseRoutes = require("./routes/courseRoutes");
const announcementRoutes = require("./routes/Announcementroutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const reviewRoutes = require("./routes/ReviewRoutes");
const quizRoutes = require("./routes/QuizRoutes");
const quizAttemptRoutes = require("./routes/QuizAttemptRoutes");

const app = express();

// Middleware: lets our server understand JSON request bodies
app.use(express.json());

// Middleware: allows your React app (running on a different port) to talk to this server
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);

// A simple test route to check the server is alive
app.get("/", (req, res) => {
  res.send("SHRI LMS backend is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});