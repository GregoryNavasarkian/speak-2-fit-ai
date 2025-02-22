import { Request, Response, NextFunction } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server"
import multer from "multer";
import path from "path";

const upload = multer({ dest: "uploads/" });

// POST /api/excersise-log/translate
// @desc Receive audio file and forward to Google Gemini API
// @access Public
export const postTranslateLog = [
    upload.single("file"),
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            if (!_req.file) {
                res.status(400).send("No file uploaded.");
                return
            }

            const filePath = path.join(__dirname, "../../uploads", _req.file.filename);

            const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY as string);

            const uploadResult = await fileManager.uploadFile(
                `${filePath}`,
                {
                    mimeType: "audio/wav",
                    displayName: "Audio sample",
                },
            );

            let file = await fileManager.getFile(uploadResult.file.name);

            while (file.state === FileState.PROCESSING) {
                // Sleep for 10 seconds
                await new Promise((resolve) => setTimeout(resolve, 10_000));
                // Fetch the file from the API again
                file = await fileManager.getFile(uploadResult.file.name);
            }

            if (file.state === FileState.FAILED) {
                throw new Error("Audio processing failed.");
            }

            // View the response.
            console.log(
                `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
            );


            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent([
                "Generate a transcript of the speech.",
                {
                    fileData: {
                        fileUri: uploadResult.file.uri,
                        mimeType: uploadResult.file.mimeType,
                    },
                },
            ]);
            console.log(result.response.text());

            const prompt = `${result.response.text()}, Return a JSON string, Use this JSON schema:

            Exercises = ['Weight-lifting': { 'exercise_name': str, 'sets': list[{ weight: int, repetitions: int }] },
                'Cardio': { 'exercise_name': str, 'time': int }
            ]
            Return: Array<Exercises>`;

            const finalResult = await model.generateContent(prompt);

            const trimFront = finalResult.response.text().slice(7);
            const trimmedJSON = trimFront.slice(0, -3);
            const jsonResponse = JSON.parse(trimmedJSON);

            res.status(200).json({ message: "Audio file sent successfully", result: jsonResponse });
        } catch (error) {
            next(error);
        }
    }
]