import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import paymentRoutes from "./routes/payment.routes";
import bountyRoutes from "./routes/bounty.routes";
import submissionRoutes from "./routes/submission.routes";
import { response } from "./utils/response";
import { config } from "./config/env";

const app: Application = express();

// Core middleware
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));

// Routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/bounty", bountyRoutes);
app.use("/api/v1/submission", submissionRoutes);

// 404 fallback for unmatched routes
app.use((req: Request, res: Response) => {
  response(res, 404, false, `Route not found: ${req.method} ${req.originalUrl}`);
});

export default app;