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

// CORS allowlist for Netlify, Railway, and local dev
const allowedOrigins = [
  "https://isstra.netlify.app",
  "https://issue-tracker-production-cda0.up.railway.app",
  "http://localhost:5173",
  "http://localhost:4000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow same-origin/server-to-server
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
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
