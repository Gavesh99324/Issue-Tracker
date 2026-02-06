import dotenv from "dotenv";

dotenv.config();

const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: required(process.env.JWT_SECRET, "JWT_SECRET"),
  databaseUrl: required(process.env.DATABASE_URL, "DATABASE_URL"),
  nodeEnv: process.env.NODE_ENV || "development",
};
