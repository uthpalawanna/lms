require("dotenv").config();


const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const User = require("../models/User");

async function run() {
  const [, , email, role] = process.argv;

  if (!email || !role) {
    console.log("Usage: node scripts/promoteUser.js <email> <student|instructor|admin>");
    process.exit(1);
  }
  if (!["student", "instructor", "admin"].includes(role)) {
    console.log(`Invalid role "${role}". Must be one of: student, instructor, admin.`);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const user = await User.findOne({ email });
  if (!user) {
    console.log(`No user found with email "${email}". Register the account first, then run this again.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const previousRole = user.role;
  user.role = role;
  await user.save();

  console.log(`Updated ${user.email}: ${previousRole} -> ${role}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});