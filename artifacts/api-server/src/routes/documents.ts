import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, documentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UploadDocumentBody, DeleteDocumentParams } from "@workspace/api-zod";

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

router.get("/", async (req, res) => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const { category } = req.query;
  let docs;
  if (category) {
    docs = await db.query.documentsTable.findMany({ where: eq(documentsTable.category, category as string) });
  } else {
    docs = await db.query.documentsTable.findMany();
  }
  return res.json(
    docs.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      category: d.category,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      fileSize: d.fileSize,
      uploadedAt: d.uploadedAt.toISOString(),
    }))
  );
});

router.post("/", async (req, res) => {
  const { userId: clerkId, sessionClaims } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const user = await getOrCreateUser(clerkId, email);
  if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const parsed = UploadDocumentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const [created] = await db.insert(documentsTable).values(parsed.data).returning();
  return res.status(201).json({
    id: created.id,
    title: created.title,
    description: created.description,
    category: created.category,
    fileUrl: created.fileUrl,
    fileName: created.fileName,
    fileSize: created.fileSize,
    uploadedAt: created.uploadedAt.toISOString(),
  });
});

router.delete("/:documentId", async (req, res) => {
  const { userId: clerkId, sessionClaims } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const user = await getOrCreateUser(clerkId, email);
  if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const params = DeleteDocumentParams.safeParse({ documentId: parseInt(req.params.documentId, 10) });
  if (!params.success) return res.status(400).json({ error: params.error.message });
  await db.delete(documentsTable).where(eq(documentsTable.id, params.data.documentId));
  return res.status(204).send();
});

export default router;
