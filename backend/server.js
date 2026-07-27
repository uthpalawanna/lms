// This is the entry point. Running "node server.js" starts everything.
require("dotenv").config();

// Fix for a common Windows/campus-network issue: Node's built-in DNS resolver
// (c-ares) sometimes fails to look up MongoDB's SRV records even when the
// operating system's own DNS works fine. Forcing Node to use Google's public
// DNS servers directly avoids this.
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const path = require("path");
const fs = require("fs");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const quizRoutes = require("./routes/quizRoutes");
const quizAttemptRoutes = require("./routes/quizAttemptRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const questionRoutes = require("./routes/questionRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware: lets our server understand JSON request bodies
app.use(express.json());

// Middleware: allows your React app (running on a different port) to talk to this server
app.use(cors());

// Basic security headers. Configure to avoid blocking cross-origin
// image requests from the frontend dev server.
app.use(
  helmet({
    // Disable CSP here to keep things simple during development —
    // enable a properly-scoped CSP for production.
    contentSecurityPolicy: false,
    // Allow resources (images) to be requested across origins so the Vite
    // dev server (different port) can embed uploaded thumbnails.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Simple rate limiter to mitigate brute-force/API abuse
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
  })
);

// Connect to MongoDB
connectDB();

// Make sure the uploads folder exists, then serve it so uploaded
// thumbnails/videos are reachable at http://localhost:5000/uploads/<file>
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/admin", adminRoutes);

// A simple test route to check the server is alive
app.get("/", (req, res) => {
  res.send("SHRI LMS backend is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Centralized error handler (must come after routes)
app.use(errorHandler);