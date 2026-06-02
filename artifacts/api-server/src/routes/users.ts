import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  UpdateMyProfileBody,
  UpdateUserRoleBody,
  UpdateUserRoleParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { getOrCreateUser } from "../lib/getOrCreateUser";

const router = Router();

router.get("/me", async (req, res) => {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const user = await getOrCreateUser(userId, email);
  return res.json({
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  });
});

router.put("/me", async (req, res) => {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const existing = await getOrCreateUser(userId, email);
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, existing.id))
    .returning();
  return res.json({
    id: updated.id,
    clerkId: updated.clerkId,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    phone: updated.phone,
    role: updated.role,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.get("/", async (req, res) => {
  const { userId, sessionClaims } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const currentUser = await getOrCreateUser(userId, email);
  if (currentUser.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const { role } = req.query;
  let users;
  if (role === "client" || role === "admin") {
    users = await db.query.usersTable.findMany({ where: eq(usersTable.role, role) });
  } else {
    users = await db.query.usersTable.findMany();
  }
  return res.json(
    users.map((u) => ({
      id: u.id,
      clerkId: u.clerkId,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    }))
  );
});

router.patch("/:userId/role", async (req, res) => {
  const { userId: clerkId, sessionClaims } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const email = (sessionClaims?.email as string) ?? "";
  const currentUser = await getOrCreateUser(clerkId, email);
  if (currentUser.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const params = UpdateUserRoleParams.safeParse({ userId: req.params.userId });
  if (!params.success) return res.status(400).json({ error: params.error.message });
  const body = UpdateUserRoleBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });
  const targetUserId = parseInt(req.params.userId, 10);
  const [updated] = await db
    .update(usersTable)
    .set({ role: body.data.role })
    .where(eq(usersTable.id, targetUserId))
    .returning();
  if (!updated) return res.status(404).json({ error: "User not found" });
  return res.json({
    id: updated.id,
    clerkId: updated.clerkId,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    phone: updated.phone,
    role: updated.role,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
