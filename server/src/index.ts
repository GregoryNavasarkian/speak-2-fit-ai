import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";

//import routes
import testRoutes from "./routes/testRoutes";
import exerciseLogRoutes from "./routes/exerciseLogRoutes";

// Load environment variables from .env file in root directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PORT = process.env.PORT || 3000;

const app: Express = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "client")));

// routes
app.use("/api/test", testRoutes);
app.use("/api/exercise-log", exerciseLogRoutes);

// error handler middleware (should be last middleware)
app.use(errorHandler);

app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
