// One-off script — creates N test student accounts and enrolls some of them
// (with randomized progress) in your existing published courses, so pages
// like your instructor dashboard have real numbers to show instead of just
// your own account.
//
// Usage:
//   node scripts/seedStudents.js            (creates 10 students)
//   node scripts/seedStudents.js 25          (creates 25 students)
//
// All seeded accounts share the password below so you can log in and test
// as any of them. Safe to run multiple times — it just adds more students
// each time rather than touching existing data.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const SEED_PASSWORD = "student1234";

const FIRST_NAMES = [
  "Amaya", "Dilshan", "Kavindi", "Ruwan", "Ishara", "Tharindu", "Nadeesha",
  "Chamara", "Sanduni", "Kasun", "Piumi", "Nuwan", "Hansini", "Roshan",
  "Dilini", "Chathura", "Sachini", "Malith", "Vindya", "Anjana",
];
const LAST_NAMES = [
  "Fernando", "Perera", "Silva", "Bandara", "Wickramasinghe", "Jayasuriya",
  "Gunawardena", "Rathnayake", "Wijesekara", "Karunaratne",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function totalLessons(course) {
  return (course.curriculum || []).reduce((sum, t) => sum + (t.lessons?.length || 0), 0);
}

async function run() {
  const count = Number(process.argv[2]) || 10;

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
  const courses = await Course.find({ status: "publish" });

  if (courses.length === 0) {
    console.log("No published courses found — students will be created but not enrolled in anything.");
  }

  const createdStudents = [];

  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const suffix = Math.random().toString(36).slice(2, 6);
    const username = `${firstName}${lastName}${suffix}`.toLowerCase();
    const email = `${username}@example.com`;

    const student = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role: "student",
    });
    createdStudents.push(student);

    // Enroll each seeded student in 1-3 random published courses, with
    // randomized progress so enrollment/completion numbers look realistic.
    const enrollIn = courses
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);

    for (const course of enrollIn) {
      const total = totalLessons(course);
      const completedCount = total > 0 ? Math.floor(Math.random() * (total + 1)) : 0;
      const completedLessons = [];
      let remaining = completedCount;
      outer: for (let t = 0; t < (course.curriculum || []).length; t++) {
        for (let l = 0; l < course.curriculum[t].lessons.length; l++) {
          if (remaining <= 0) break outer;
          completedLessons.push(`${t}-${l}`);
          remaining--;
        }
      }
      const progress = total > 0 ? Math.round((completedLessons.length / total) * 100) : 0;

      await Enrollment.create({
        student: student._id,
        course: course._id,
        pricePaid: course.price || 0,
        progress,
        completedLessons,
        status: progress >= 100 ? "completed" : "active",
      });
    }
  }

  console.log(`\nCreated ${createdStudents.length} student accounts (password for all: "${SEED_PASSWORD}"):\n`);
  createdStudents.forEach((s) => console.log(`  ${s.email}`));
  console.log("\nDone. Log in as any of these to see the student side.");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
