import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";

//import routes
import testRoutes from "./routes/testRoutes";

// Load environment variables from .env file in root directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PORT = process.env.PORT || 3000;

const app: Express = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "client")));

app.use("/api/test", testRoutes);

app.use(errorHandler);

app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
