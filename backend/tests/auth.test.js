const request = require("supertest");
const app = require("../app");
const { createUser } = require("./helpers");

describe("POST /api/auth/register", () => {
  it("creates a new student account and returns a token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        username: "testuser1",
        email: "testuser1@example.com",
        password: "Password123!",
      });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it("rejects a password shorter than 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        username: "testuser2",
        email: "testuser2@example.com",
        password: "short",
      });
    expect(res.status).toBe(400);
  });

  it("rejects a duplicate email", async () => {
    await createUser({ email: "dupe@example.com" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        username: "testuser3",
        email: "dupe@example.com",
        password: "Password123!",
      });
    expect(res.status).toBe(400);
  });

  it("never lets the client set its own role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Test",
        lastName: "User",
        username: "testuser4",
        email: "testuser4@example.com",
        password: "Password123!",
        role: "admin",
      });
    expect(res.status).toBe(201);
    expect(res.body.user?.role || res.body.role).not.toBe("admin");
  });
});

describe("POST /api/auth/login", () => {
  it("rejects a missing password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "someone@example.com" });
    expect(res.status).toBe(400);
  });

  it("rejects wrong credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "wrongpass" });
    expect(res.status).toBe(401);
  });
});