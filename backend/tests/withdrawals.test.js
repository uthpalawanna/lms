const request = require("supertest");
const app = require("../app");
const { createUser, createCourse } = require("./helpers");
const Enrollment = require("../models/Enrollment");
const Withdrawal = require("../models/Withdrawal");

async function giveInstructorRevenue(instructorId, revenue) {
  const course = await createCourse({ instructor: instructorId, price: revenue });
  const { user: student } = await createUser({ role: "student" });
  await Enrollment.create({
    student: student._id,
    course: course._id,
    status: "active",
    pricePaid: revenue,
  });
}

describe("GET /api/withdrawals/balance", () => {
  it("reports 0 available with no revenue", async () => {
    const { user: instructor, token } = await createUser({ role: "instructor" });
    const res = await request(app).get("/api/withdrawals/balance").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.available).toBe(0);
  });

  it("reserves pending withdrawal amounts out of the available balance", async () => {
    const { user: instructor, token } = await createUser({ role: "instructor" });
    await giveInstructorRevenue(instructor._id, 10000);
    await Withdrawal.create({ instructor: instructor._id, amount: 4000, status: "pending" });

    const res = await request(app).get("/api/withdrawals/balance").set("Authorization", `Bearer ${token}`);
    expect(res.body.available).toBe(6000);
  });
});

describe("POST /api/withdrawals (request)", () => {
  it("rejects a request that exceeds available balance", async () => {
    const { user: instructor, token } = await createUser({ role: "instructor" });
    await giveInstructorRevenue(instructor._id, 5000);

    const res = await request(app)
      .post("/api/withdrawals")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 6000, method: "bank" });

    expect(res.status).toBe(400);
    const count = await Withdrawal.countDocuments({ instructor: instructor._id });
    expect(count).toBe(0);
  });
});

describe("Admin withdrawal approval re-validates balance", () => {
  it("approves a single pending withdrawal within balance", async () => {
    const { user: instructor } = await createUser({ role: "instructor" });
    const { token: adminToken } = await createUser({ role: "admin" });
    await giveInstructorRevenue(instructor._id, 10000);
    const w = await Withdrawal.create({ instructor: instructor._id, amount: 10000, status: "pending" });

    const res = await request(app)
      .put(`/api/admin/withdrawals/${w._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "approved" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
  });

  it("blocks approval when overlapping pending requests collectively exceed revenue", async () => {
    const { user: instructor } = await createUser({ role: "instructor" });
    const { token: adminToken } = await createUser({ role: "admin" });
    await giveInstructorRevenue(instructor._id, 10000);
    const w1 = await Withdrawal.create({ instructor: instructor._id, amount: 6000, status: "pending" });
    await Withdrawal.create({ instructor: instructor._id, amount: 6000, status: "pending" });

    const res = await request(app)
      .put(`/api/admin/withdrawals/${w1._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "approved" });

    expect(res.status).toBe(400);
    const saved = await Withdrawal.findById(w1._id);
    expect(saved.status).toBe("pending");
  });

  it("allows approval again once the conflicting request is rejected", async () => {
    const { user: instructor } = await createUser({ role: "instructor" });
    const { token: adminToken } = await createUser({ role: "admin" });
    await giveInstructorRevenue(instructor._id, 10000);
    const w1 = await Withdrawal.create({ instructor: instructor._id, amount: 6000, status: "pending" });
    const w2 = await Withdrawal.create({ instructor: instructor._id, amount: 6000, status: "pending" });

    await request(app)
      .put(`/api/admin/withdrawals/${w2._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "rejected" });

    const res = await request(app)
      .put(`/api/admin/withdrawals/${w1._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "approved" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
  });

  it("rejects non-admins", async () => {
    const { user: instructor, token: instructorToken } = await createUser({ role: "instructor" });
    await giveInstructorRevenue(instructor._id, 10000);
    const w = await Withdrawal.create({ instructor: instructor._id, amount: 5000, status: "pending" });

    const res = await request(app)
      .put(`/api/admin/withdrawals/${w._id}/status`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({ status: "approved" });

    expect(res.status).toBe(403);
  });
});