import request from "supertest";
import app from "../app";

describe("Global Error Handler", () => {
  it("should catch errors and return 500 status", async () => {
    const res = await request(app).get("/api/test/error");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Boom!");
  });

  it("should default to 500 and 'Internal Server Error' when no error fields are set", async () => {
    const res = await request(app).get("/api/test/generic-error");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Internal Server Error");
  });
});
