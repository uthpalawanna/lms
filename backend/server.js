// This is the entry point. Running "node server.js" starts everything.
require("dotenv").config();

// Fix for a common Windows/campus-network issue: Node's built-in DNS resolver
// (c-ares) sometimes fails to look up MongoDB's SRV records even when the
// operating system's own DNS works fine. Forcing Node to use Google's public
// DNS servers directly avoids this.
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = require("./app");
const connectDB = require("./config/db");

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
