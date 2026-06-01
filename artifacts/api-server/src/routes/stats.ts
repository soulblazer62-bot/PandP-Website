import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, legalQueriesTable, documentsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

async function getOrCreateUser(clerkId: string, email: string) {
  let user = await db.query.usersTable.findFirst({
    where: eq(usersTable.clerkId, clerkId),
  });
  if (!user) {
    const [created] = await db
      .insert(usersTable)
      .values({ clerkId, email, role: "client" })
      .returning();
    user = created;
  }
  return user;
}

router.get("/dashboard", async (req, res) => {
  const { userId: clerkId, sessionClaims } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  await getOrCreateUser(clerkId, email);
  const [totalQ] = await db.select({ count: count() }).from(legalQueriesTable);
  const [pending] = await db.select({ count: count() }).from(legalQueriesTable).where(eq(legalQueriesTable.status, "pending"));
  const [inReview] = await db.select({ count: count() }).from(legalQueriesTable).where(eq(legalQueriesTable.status, "in_review"));
  const [resolved] = await db.select({ count: count() }).from(legalQueriesTable).where(eq(legalQueriesTable.status, "resolved"));
  const [totalDocs] = await db.select({ count: count() }).from(documentsTable);
  const [totalClients] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "client"));
  return res.json({
    totalQueries: Number(totalQ?.count ?? 0),
    pendingQueries: Number(pending?.count ?? 0),
    inReviewQueries: Number(inReview?.count ?? 0),
    resolvedQueries: Number(resolved?.count ?? 0),
    totalDocuments: Number(totalDocs?.count ?? 0),
    totalClients: Number(totalClients?.count ?? 0),
  });
});

router.get("/queries-by-category", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const queries = await db.query.legalQueriesTable.findMany();
  const counts: Record<string, number> = {};
  for (const q of queries) {
    counts[q.category] = (counts[q.category] ?? 0) + 1;
  }
  return res.json(
    Object.entries(counts).map(([category, count]) => ({ category, count }))
  );
});

export default router;
