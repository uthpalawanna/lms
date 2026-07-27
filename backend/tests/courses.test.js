const request = require("supertest");
const app = require("../app");
const { createUser } = require("./helpers");

describe("GET /api/courses/:id", () => {
  it("returns 400 for a malformed id instead of a 500", async () => {
    const res = await request(app).get("/api/courses/not-a-valid-id");
    expect(res.status).toBe(400);
  });

  it("returns 404 for a well-formed id that doesn't exist", async () => {
    const res = await request(app).get("/api/courses/507f1f77bcf86cd799439011");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/courses", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).post("/api/courses").send({ title: "New Course" });
    expect(res.status).toBe(401);
  });

  it("rejects students (instructor-only)", async () => {
    const { token } = await createUser({ role: "student" });
    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New Course" });
    expect(res.status).toBe(403);
  });

  it("rejects a missing title", async () => {
    const { token } = await createUser({ role: "instructor" });
    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "no title here" });
    expect(res.status).toBe(400);
  });

  it("lets an instructor create a course", async () => {
    const { token } = await createUser({ role: "instructor" });
    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Intro to Testing", price: 0 });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Intro to Testing");
  });

  it("rejects a negative price", async () => {
    const { token } = await createUser({ role: "instructor" });
    const res = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Bad Course", price: -10 });
    expect(res.status).toBe(400);
  });
});
