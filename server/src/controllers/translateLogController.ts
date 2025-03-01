import { Request, Response, NextFunction, RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import multer from "multer";
import path from "path";

const upload = multer({ dest: "uploads/" });

// @desc   Transcribe exercise log into structured JSON data w/ Gemini
// @route  POST /api/exercise-log/translate
// @access Public
export const postTranslateLog: RequestHandler[] = [
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      let transcript = "";

      // Handle Text Input
      if (req.body.text) {
        transcript = req.body.text.trim();
        console.log("Text input received:", transcript);
      }

      // Handle Audio File Input
      if (req.file) {
        const filePath = path.join(__dirname, "../../uploads", req.file.filename);

        const fileManager = new GoogleAIFileManager(apiKey);
        const uploadResult = await fileManager.uploadFile(filePath, {
          mimeType: "audio/wav",
          displayName: "Audio sample"
        });

        let file = await fileManager.getFile(uploadResult.file.name);

        // Wait for processing
        while (file.state === FileState.PROCESSING) {
          await new Promise((resolve) => globalThis.setTimeout(resolve, 10_000));
          file = await fileManager.getFile(uploadResult.file.name);
        }

        if (file.state === FileState.FAILED) {
          throw new Error("Audio processing failed.");
        }

        console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`);

        // Request transcript from Gemini
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                { text: "Transcribe this audio file into text." },
                {
                  fileData: {
                    fileUri: uploadResult.file.uri,
                    mimeType: uploadResult.file.mimeType
                  }
                }
              ]
            }
          ]
        });

        transcript = result.response.text().trim();
        console.log("Transcription:", transcript);
      }

      // Error Handling: If No Valid Input is Provided
      if (!transcript) {
        res.status(400).json({ success: false, message: "No valid text or audio input provided." });
        return;
      }

      // Extract Structured JSON Data
      const jsonPrompt = `
        Given this transcript:
        "${transcript}"
        Extract and return a JSON string using this schema:

        Exercises = [
          { "exercise_name": str, "type": "Weight-lifting", "sets": [{ "weight": int, "repetitions": int }] },
          { "exercise_name": str, "type": "Cardio", "time": int }
        ]

        Add reps to each set. Ensure the JSON is correctly formatted.
      `;

      const finalResult = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: jsonPrompt }] }]
      });

      let jsonResponseText = finalResult.response.text().trim();

      jsonResponseText = jsonResponseText
        .replace(/^```json\n/, "")
        .replace(/\n```$/, "")
        .trim();

      console.log("Raw JSON Response:", jsonResponseText);

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(jsonResponseText);
      } catch (error) {
        console.error(error);
        jsonResponse = []; // return empty array if JSON parsing fails
      }

      res.status(200).json({
        success: true,
        message: "Processing successful",
        transcript,
        result: jsonResponse
      });
    } catch (error) {
      next(error);
    }
  }
];
