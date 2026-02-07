import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { disconnectPrisma } from "./db";
import authRoutes from "./routes/auth";
import issueRoutes from "./routes/issues";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [
      "https://isstra.netlify.app",
      "http://localhost:5173",
      "http://localhost:4173",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
  }),
);
// Explicitly handle preflight for all routes
app.options("*", cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/issues", issueRoutes);

app.use(errorHandler);

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${config.port}`);
});

const shutdown = async () => {
  server.close();
  await disconnectPrisma();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
