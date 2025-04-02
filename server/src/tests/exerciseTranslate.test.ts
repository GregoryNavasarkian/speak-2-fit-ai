import request from "supertest";
import app from "../app";
import { Request, Response, NextFunction } from "express";
import { Buffer } from "buffer";
import { Readable } from "stream";

// Mocking multer to skip actual file handling
jest.mock("multer", () => {
  return () => ({
    single: () => (req: Request, _res: Response, next: NextFunction) => {
      if (req.headers["content-type"]?.includes("multipart/form-data")) {
        req.file = {
          fieldname: "file",
          originalname: "dummy-audio.wav",
          encoding: "7bit",
          mimetype: "audio/wav",
          destination: "uploads/",
          filename: "dummy-audio.wav",
          path: "uploads/dummy-audio.wav",
          size: 1024,
          stream: Readable.from(["dummy data"]),
          buffer: Buffer.from("dummy data")
        };
      } else {
        req.file = undefined;
      }
      next();
    }
  });
});

const mockGenerateContent = jest.fn(({ contents }) => {
  const userText = contents[0]?.parts[0]?.text;

  if (userText.includes("Transcribe")) {
    // Mock transcription response
    return Promise.resolve({
      response: {
        text: () => "Squats 225 pounds for 5 reps"
      }
    });
  }

  if (userText.includes("Extract and return a JSON")) {
    // Mock JSON extraction response
    return Promise.resolve({
      response: {
        text: () =>
          JSON.stringify([
            {
              exercise_name: "Squat",
              type: "Weight-lifting",
              sets: [{ weight: 225, repetitions: 5 }]
            }
          ])
      }
    });
  }

  return Promise.resolve({
    response: { text: () => "" }
  });
});

// Mock GoogleGenerativeAI separately
jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: () => ({
      generateContent: mockGenerateContent
    })
  }))
}));

// Mock GoogleAIFileManager separately
jest.mock("@google/generative-ai/server", () => ({
  GoogleAIFileManager: jest.fn(() => ({
    uploadFile: jest.fn().mockResolvedValue({
      file: { name: "dummy-file", displayName: "dummy-audio.wav", uri: "dummy-uri", mimeType: "audio/wav" }
    }),
    getFile: jest.fn().mockResolvedValue({ state: "READY" })
  })),
  FileState: { READY: "READY", PROCESSING: "PROCESSING", FAILED: "FAILED" }
}));

describe("Exercise Translate API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should process text input and return structured JSON data", async () => {
    const inputText = "Squats 225 pounds for 5 reps";
    const res = await request(app).post("/api/exercise-log/translate").send({ text: inputText });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transcript).toBe(inputText);
    expect(res.body.result).toEqual([
      {
        exercise_name: "Squat",
        type: "Weight-lifting",
        sets: [{ weight: 225, repetitions: 5 }]
      }
    ]);
  });

  it("should return 400 if no input is provided", async () => {
    const res = await request(app).post("/api/exercise-log/translate").send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/No valid text or audio input provided/);
  });

  it("should process audio input and return structured JSON data", async () => {
    const res = await request(app)
      .post("/api/exercise-log/translate")
      .attach("file", Buffer.from("dummy audio"), "dummy-audio.wav");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transcript).toBe("Squats 225 pounds for 5 reps");
    expect(res.body.result).toEqual([
      {
        exercise_name: "Squat",
        type: "Weight-lifting",
        sets: [{ weight: 225, repetitions: 5 }]
      }
    ]);
  });

  it("should return 500 if GEMINI_API_KEY is missing", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const res = await request(app).post("/api/exercise-log/translate").send({ text: "Test" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/key not found/i);

    process.env.GEMINI_API_KEY = originalKey;
  });
});
