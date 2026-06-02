import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, legalQueriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  CreateQueryBody,
  UpdateQueryBody,
  UpdateQueryParams,
  DeleteQueryParams,
} from "@workspace/api-zod";
import { getOrCreateUser } from "../lib/getOrCreateUser";

const router = Router();

function formatQuery(q: typeof legalQueriesTable.$inferSelect, user?: typeof usersTable.$inferSelect) {
  return {
    id: q.id,
    userId: q.userId,
    clientName: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null : null,
    clientEmail: user?.email ?? null,
    subject: q.subject,
    description: q.description,
    category: q.category,
    status: q.status,
    adminNotes: q.adminNotes,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { userId: clerkId, sessionClaims } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const user = await getOrCreateUser(clerkId, email);
  const { status, category } = req.query;
  let conditions: ReturnType<typeof eq>[] = [];
  if (user.role !== "admin") {
    conditions.push(eq(legalQueriesTable.userId, user.id));
  }
  if (status) conditions.push(eq(legalQueriesTable.status, status as typeof legalQueriesTable.$inferSelect["status"]));
  if (category) conditions.push(eq(legalQueriesTable.category, category as typeof legalQueriesTable.$inferSelect["category"]));
  const queryCondition = conditions.length > 1 ? and(...conditions) : conditions[0];
  const queries = queryCondition
    ? await db.query.legalQueriesTable.findMany({ where: queryCondition })
    : await db.query.legalQueriesTable.findMany();
  const allUsers = await db.query.usersTable.findMany();
  const userMap = Object.fromEntries(allUsers.map((u) => [u.id, u]));
  return res.json(queries.map((q) => formatQuery(q, userMap[q.userId])));
});

router.post("/", async (req, res) => {
  const { userId: clerkId, sessionClaims } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const user = await getOrCreateUser(clerkId, email);
  const parsed = CreateQueryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const [created] = await db
    .insert(legalQueriesTable)
    .values({ ...parsed.data, userId: user.id })
    .returning();
  return res.status(201).json(formatQuery(created, user));
});

router.get("/:queryId", async (req, res) => {
  const { userId: clerkId, sessionClaims } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const user = await getOrCreateUser(clerkId, email);
  const queryId = parseInt(req.params.queryId, 10);
  const query = await db.query.legalQueriesTable.findFirst({ where: eq(legalQueriesTable.id, queryId) });
  if (!query) return res.status(404).json({ error: "Query not found" });
  if (user.role !== "admin" && query.userId !== user.id) return res.status(403).json({ error: "Forbidden" });
  const queryUser = await db.query.usersTable.findFirst({ where: eq(usersTable.id, query.userId) });
  return res.json(formatQuery(query, queryUser));
});

router.patch("/:queryId", async (req, res) => {
  const { userId: clerkId, sessionClaims } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const user = await getOrCreateUser(clerkId, email);
  if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const params = UpdateQueryParams.safeParse({ queryId: parseInt(req.params.queryId, 10) });
  if (!params.success) return res.status(400).json({ error: params.error.message });
  const body = UpdateQueryBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });
  const [updated] = await db
    .update(legalQueriesTable)
    .set(body.data)
    .where(eq(legalQueriesTable.id, params.data.queryId))
    .returning();
  if (!updated) return res.status(404).json({ error: "Query not found" });
  const queryUser = await db.query.usersTable.findFirst({ where: eq(usersTable.id, updated.userId) });
  return res.json(formatQuery(updated, queryUser));
});

router.delete("/:queryId", async (req, res) => {
  const { userId: clerkId, sessionClaims } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const user = await getOrCreateUser(clerkId, email);
  if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const params = DeleteQueryParams.safeParse({ queryId: parseInt(req.params.queryId, 10) });
  if (!params.success) return res.status(400).json({ error: params.error.message });
  await db.delete(legalQueriesTable).where(eq(legalQueriesTable.id, params.data.queryId));
  return res.status(204).send();
});

export default router;
