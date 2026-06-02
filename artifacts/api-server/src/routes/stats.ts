import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, legalQueriesTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";
import { getOrCreateUser } from "../lib/getOrCreateUser";

const router = Router();

router.get("/dashboard", async (req, res) => {
  const { userId: clerkId, sessionClaims } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const user = await getOrCreateUser(clerkId, email);

  const isAdmin = user.role === "admin";

  if (isAdmin) {
    const [totalQ] = await db.select({ count: count() }).from(legalQueriesTable);
    const [pending] = await db.select({ count: count() }).from(legalQueriesTable).where(eq(legalQueriesTable.status, "pending"));
    const [inReview] = await db.select({ count: count() }).from(legalQueriesTable).where(eq(legalQueriesTable.status, "in_review"));
    const [resolved] = await db.select({ count: count() }).from(legalQueriesTable).where(eq(legalQueriesTable.status, "resolved"));
    const [totalClients] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "client"));
    return res.json({
      totalQueries: Number(totalQ?.count ?? 0),
      pendingQueries: Number(pending?.count ?? 0),
      inReviewQueries: Number(inReview?.count ?? 0),
      resolvedQueries: Number(resolved?.count ?? 0),
      totalDocuments: 0,
      totalClients: Number(totalClients?.count ?? 0),
    });
  } else {
    const uid = user.id;
    const [totalQ] = await db.select({ count: count() }).from(legalQueriesTable).where(eq(legalQueriesTable.userId, uid));
    const [pending] = await db.select({ count: count() }).from(legalQueriesTable).where(and(eq(legalQueriesTable.userId, uid), eq(legalQueriesTable.status, "pending")));
    const [inReview] = await db.select({ count: count() }).from(legalQueriesTable).where(and(eq(legalQueriesTable.userId, uid), eq(legalQueriesTable.status, "in_review")));
    const [resolved] = await db.select({ count: count() }).from(legalQueriesTable).where(and(eq(legalQueriesTable.userId, uid), eq(legalQueriesTable.status, "resolved")));
    return res.json({
      totalQueries: Number(totalQ?.count ?? 0),
      pendingQueries: Number(pending?.count ?? 0),
      inReviewQueries: Number(inReview?.count ?? 0),
      resolvedQueries: Number(resolved?.count ?? 0),
      totalDocuments: 0,
      totalClients: 0,
    });
  }
});

router.get("/queries-by-category", async (req, res) => {
  const { userId: clerkId, sessionClaims } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const user = await getOrCreateUser(clerkId, email);

  const queries = user.role === "admin"
    ? await db.query.legalQueriesTable.findMany()
    : await db.query.legalQueriesTable.findMany({ where: eq(legalQueriesTable.userId, user.id) });

  const counts: Record<string, number> = {};
  for (const q of queries) {
    counts[q.category] = (counts[q.category] ?? 0) + 1;
  }
  return res.json(
    Object.entries(counts).map(([category, count]) => ({ category, count }))
  );
});

export default router;
