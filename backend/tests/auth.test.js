const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("POST /api/auth/register", () => {
  const validBody = {
    firstName: "Ada",
    lastName: "Lovelace",
    username: "ada",
    email: "ada@example.com",
    password: "Password123!",
  };

  it("creates a new student account and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("student");
    expect(res.body.user.email).toBe(validBody.email);
  });

  it("rejects a password shorter than 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validBody, password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("rejects a duplicate email", async () => {
    await request(app).post("/api/auth/register").send(validBody);
    const res = await request(app).post("/api/auth/register").send(validBody);
    expect(res.status).toBe(400);
  });

  it("never lets the client set its own role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validBody, email: "hacker@example.com", username: "hacker", role: "admin" });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("student");
    const stored = await User.findOne({ email: "hacker@example.com" });
    expect(stored.role).toBe("student");
  });
});

describe("POST /api/auth/login", () => {
  it("rejects a missing password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "ada@example.com" });
    expect(res.status).toBe(400);
  });

  it("rejects wrong credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "wrongpass" });
    expect(res.status).toBe(400);
  });
});
