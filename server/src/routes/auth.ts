import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { signToken } from "../utils/tokens";
import { requireAuth } from "../middleware/auth";

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2).max(80),
});

router.post("/register", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.flatten() });
    return;
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true },
  });

  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  res.status(201).json({ token, user });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const safeUser = { id: user.id, email: user.email, name: user.name };
  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  res.json({ token, user: safeUser });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
