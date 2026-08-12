const request = require("supertest");
const app = require("../app");
const { createUser } = require("./helpers");


describe("POST /api/uploads", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app)
      .post("/api/uploads")
      .attach("file", Buffer.from("fake image bytes"), {
        filename: "photo.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(401);
  });

  it("ignores a spoofed originalname and derives the extension from the verified MIME type", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post("/api/uploads")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("<script>alert(1)</script>"), {
        filename: "evil.html",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/\.png$/);
    expect(res.body.url).not.toMatch(/\.html$/);
  });

  it("rejects a disallowed MIME type outright", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post("/api/uploads")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("<script>alert(1)</script>"), {
        filename: "evil.html",
        contentType: "text/html",
      });

    expect(res.status).toBe(400);
  });

  it("maps each allowed MIME type to its own fixed extension, never the client's", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post("/api/uploads")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("fake pdf bytes"), {
        filename: "whatever.exe",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/\.pdf$/);
  });
});