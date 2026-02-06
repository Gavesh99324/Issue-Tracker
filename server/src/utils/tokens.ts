import jwt from "jsonwebtoken";
import { config } from "../config";

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
};

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};
