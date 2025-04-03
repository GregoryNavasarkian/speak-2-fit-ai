import request from "supertest";
import app from "../app";
import ExerciseLog from "../models/exerciseLogModel";
import mongoose from "mongoose";

describe("Exercise Log API", () => {
  it("should create a new exercise log", async () => {
    const res = await request(app)
      .post("/api/exercise-log")
      .send({ exercises: [{ name: "Squat", weight: 250, reps: 5 }] });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Exercise log created successfully");
    expect(res.body.log).toHaveProperty("_id");
  });

  it("should retrieve all exercise logs", async () => {
    await ExerciseLog.create({ log: [{ name: "Bench Press", weight: 200, reps: 8 }] });
    const res = await request(app).get("/api/exercise-log");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("should retrieve a single exercise log by ID", async () => {
    const newLog = await ExerciseLog.create({ log: [{ name: "Deadlift", weight: 300, reps: 5 }] });
    const createdId = (newLog._id as mongoose.Types.ObjectId).toString();
    const res = await request(app).get(`/api/exercise-log/${createdId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id", createdId);
  });

  it("should update an exercise log by ID", async () => {
    const existingLog = await ExerciseLog.create({ log: [{ name: "OHP", weight: 135, reps: 8 }] });
    const updatedExercises = [{ name: "OHP", weight: 155, reps: 6 }];
    const res = await request(app).patch(`/api/exercise-log/${existingLog._id}`).send(updatedExercises);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Exercise log updated successfully");

    const updatedLog = await ExerciseLog.findById(existingLog._id);
    expect(updatedLog?.log).toEqual(updatedExercises);
  });

  it("should delete an exercise log by ID", async () => {
    const logToDelete = await ExerciseLog.create({ log: [{ name: "Pull-ups", reps: 10 }] });
    const res = await request(app).delete(`/api/exercise-log/${logToDelete._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Exercise log deleted successfully");

    const deletedLog = await ExerciseLog.findById(logToDelete._id);
    expect(deletedLog).toBeNull();
  });

  it("should return 400 for invalid exercise log data", async () => {
    const res = await request(app).post("/api/exercise-log").send({ invalidField: "invalidData" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid exercise data");
  });

  it("should return 404 when a valid but non-existent ID is requested", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/exercise-log/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Exercise log not found");
  });

  it("should return 400 for malformed ObjectId", async () => {
    const res = await request(app).get("/api/exercise-log/not-a-valid-id");
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false); // because errorHandler kicks in
    expect(res.body).toHaveProperty("message");
  });
});
