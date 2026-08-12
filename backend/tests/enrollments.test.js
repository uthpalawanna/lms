const request = require("supertest");
const app = require("../app");
const { createUser, createCourse } = require("./helpers");
const Enrollment = require("../models/Enrollment");

describe("POST /api/enrollments (self-enroll)", () => {
  it("rejects unauthenticated requests", async () => {
    const course = await createCourse({ price: 0 });
    const res = await request(app).post("/api/enrollments").send({ course: course._id });
    expect(res.status).toBe(401);
  });

  it("enrolls a student instantly (active) in a free course", async () => {
    const { token } = await createUser({ role: "student" });
    const course = await createCourse({ price: 0 });
    const res = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({ course: course._id });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("active");
  });

  it("refuses to self-enroll in a paid course — must go through checkout", async () => {
    const { token } = await createUser({ role: "student" });
    const course = await createCourse({ price: 5000 });
    const res = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({ course: course._id });

    expect(res.status).toBe(402);
    const stillNone = await Enrollment.findOne({ course: course._id });
    expect(stillNone).toBeNull();
  });

  it("blocks re-enrolling after a rejected request with a specific message", async () => {
    const { user, token } = await createUser({ role: "student" });
    const course = await createCourse({ price: 0 });
    await Enrollment.create({ student: user._id, course: course._id, status: "rejected" });

    const res = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({ course: course._id });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/rejected/i);
  });
});

describe("Admin enrollment-approval endpoints", () => {
  async function pendingEnrollment() {
    const { user: student } = await createUser({ role: "student" });
    const course = await createCourse({ price: 5000 });
    const enrollment = await Enrollment.create({
      student: student._id,
      course: course._id,
      status: "pending",
      pricePaid: 5000,
    });
    return { student, course, enrollment };
  }

  it("rejects non-admins from every admin enrollment route", async () => {
    const { token } = await createUser({ role: "instructor" });
    const { enrollment } = await pendingEnrollment();

    const list = await request(app).get("/api/enrollments/pending").set("Authorization", `Bearer ${token}`);
    const approve = await request(app)
      .put(`/api/enrollments/${enrollment._id}/approve`)
      .set("Authorization", `Bearer ${token}`);

    expect(list.status).toBe(403);
    expect(approve.status).toBe(403);
  });

  it("lists pending requests for admins", async () => {
    const { token: adminToken } = await createUser({ role: "admin" });
    await pendingEnrollment();

    const res = await request(app).get("/api/enrollments/pending").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].status).toBe("pending");
  });

  it("approves a pending request and records who reviewed it", async () => {
    const { user: admin, token: adminToken } = await createUser({ role: "admin" });
    const { enrollment } = await pendingEnrollment();

    const res = await request(app)
      .put(`/api/enrollments/${enrollment._id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("active");
    const saved = await Enrollment.findById(enrollment._id);
    expect(saved.reviewedBy.toString()).toBe(admin._id.toString());
    expect(saved.reviewedAt).toBeTruthy();
  });

  it("rejects a pending request with a reason", async () => {
    const { token: adminToken } = await createUser({ role: "admin" });
    const { enrollment } = await pendingEnrollment();

    const res = await request(app)
      .put(`/api/enrollments/${enrollment._id}/reject`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Payment could not be verified." });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("rejected");
    expect(res.body.rejectionReason).toBe("Payment could not be verified.");
  });

  it("won't re-review an already-decided request", async () => {
    const { token: adminToken } = await createUser({ role: "admin" });
    const { enrollment } = await pendingEnrollment();
    await request(app)
      .put(`/api/enrollments/${enrollment._id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    const res = await request(app)
      .put(`/api/enrollments/${enrollment._id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });

  it("lets an admin manually enroll a student at no charge", async () => {
    const { token: adminToken } = await createUser({ role: "admin" });
    const { user: student } = await createUser({ role: "student" });
    const course = await createCourse({ price: 5000 });

    const res = await request(app)
      .post("/api/enrollments/admin-enroll")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ student: student._id, course: course._id });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("active");
    expect(res.body.pricePaid).toBe(0);
  });

  it("admin-enroll approves an existing pending request in place instead of duplicating it", async () => {
    const { token: adminToken } = await createUser({ role: "admin" });
    const { student, course } = await pendingEnrollment();

    const res = await request(app)
      .post("/api/enrollments/admin-enroll")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ student: student._id, course: course._id });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("active");
    const count = await Enrollment.countDocuments({ student: student._id, course: course._id });
    expect(count).toBe(1);
  });
});

describe("Lesson completion respects enrollment status", () => {
  it("blocks lesson-complete toggling while a paid enrollment is still pending", async () => {
    const { user: student, token } = await createUser({ role: "student" });
    const course = await createCourse({ price: 5000 });
    const enrollment = await Enrollment.create({
      student: student._id,
      course: course._id,
      status: "pending",
      pricePaid: 5000,
    });

    const res = await request(app)
      .put(`/api/enrollments/${enrollment._id}/lesson`)
      .set("Authorization", `Bearer ${token}`)
      .send({ lessonKey: "lesson-1", completed: true });

    expect(res.status).toBe(403);
  });
});