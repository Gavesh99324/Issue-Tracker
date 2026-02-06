import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/tokens";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authorization header missing" });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
