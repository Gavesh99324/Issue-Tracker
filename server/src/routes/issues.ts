import { IssueStatus, Priority, Severity } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

const createIssueSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  severity: z.nativeEnum(Severity).optional(),
  status: z.nativeEnum(IssueStatus).optional(),
  assignee: z.string().min(2).max(120).optional(),
  labels: z.array(z.string().min(1)).max(10).optional(),
});

const updateIssueSchema = createIssueSchema.partial();

const parsePagination = (query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize) || 10, 1), 50);
  return { page, pageSize };
};

const buildFilters = (query: Record<string, unknown>) => {
  const { status, priority, severity, search, assignee } = query;
  const where: Record<string, unknown> = {};

  if (status && typeof status === "string") {
    where.status = status as IssueStatus;
  }
  if (priority && typeof priority === "string") {
    where.priority = priority as Priority;
  }
  if (severity && typeof severity === "string") {
    where.severity = severity as Severity;
  }
  if (assignee && typeof assignee === "string") {
    where.assignee = { contains: assignee, mode: "insensitive" };
  }
  if (search && typeof search === "string" && search.trim().length > 0) {
    const labelTerms = search.split(/[, ]+/).filter(Boolean);
    const or: unknown[] = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
    if (labelTerms.length) {
      or.push({ labels: { array_contains: labelTerms } });
    }
    where.OR = or;
  }

  return where;
};

router.get("/export", requireAuth, async (req, res) => {
  const format = (req.query.format as string) || "csv";
  const where = buildFilters(req.query);

  const issues = await prisma.issue.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (format === "json") {
    res.json({ issues });
    return;
  }

  const header = [
    "id",
    "title",
    "description",
    "status",
    "priority",
    "severity",
    "assignee",
    "labels",
    "createdAt",
    "updatedAt",
  ];

  const rows = issues.map((issue) => {
    const labels = Array.isArray(issue.labels) ? issue.labels.map(String) : [];
    return [
      issue.id,
      issue.title,
      issue.description.replace(/\n/g, " ").replace(/"/g, "'"),
      issue.status,
      issue.priority,
      issue.severity ?? "",
      issue.assignee ?? "",
      labels.join("|"),
      issue.createdAt.toISOString(),
      issue.updatedAt.toISOString(),
    ]
      .map((cell) => `"${cell}"`)
      .join(",");
  });

  res.header("Content-Type", "text/csv");
  res.attachment("issues.csv");
  res.send([header.join(","), ...rows].join("\n"));
});

router.get("/", requireAuth, async (req, res) => {
  const { page, pageSize } = parsePagination(req.query);
  const where = buildFilters(req.query);

  const [items, total, statusCounts] = await Promise.all([
    prisma.issue.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.issue.count({ where }),
    prisma.issue.groupBy({
      by: ["status"],
      _count: { _all: true },
      where,
    }),
  ]);

  const counts: Record<IssueStatus, number> = {
    OPEN: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
  };
  statusCounts.forEach((c) => {
    counts[c.status] = c._count._all;
  });

  res.json({
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    counts,
  });
});

router.get("/:id", requireAuth, async (req, res) => {
  const issue = await prisma.issue.findUnique({
    where: { id: req.params.id },
    include: { createdBy: { select: { id: true, email: true, name: true } } },
  });

  if (!issue) {
    res.status(404).json({ message: "Issue not found" });
    return;
  }

  res.json(issue);
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createIssueSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.flatten() });
    return;
  }

  const issue = await prisma.issue.create({
    data: {
      ...parsed.data,
      userId: req.user!.id,
    },
  });

  res.status(201).json(issue);
});

router.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateIssueSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.flatten() });
    return;
  }

  try {
    const issue = await prisma.issue.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(issue);
  } catch {
    res.status(404).json({ message: "Issue not found" });
  }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  const status = req.body?.status as IssueStatus | undefined;
  if (!status || !Object.values(IssueStatus).includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  try {
    const issue = await prisma.issue.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(issue);
  } catch {
    res.status(404).json({ message: "Issue not found" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.issue.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: "Issue not found" });
  }
});

export default router;
