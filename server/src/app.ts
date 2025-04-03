import express, { Express, Request, Response } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";

// Import routes
import testRoutes from "./routes/testRoutes";
import exerciseLogRoutes from "./routes/exerciseLogRoutes";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "client")));

// Routes
app.use("/api/test", testRoutes);
app.use("/api/exercise-log", exerciseLogRoutes);

// Error handler middleware (should be last piece of middleware)
app.use(errorHandler);

app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

export default app;
