import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export async function getOrCreateUser(clerkId: string, email: string) {
  const isAdminEmail = ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  let user = await db.query.usersTable.findFirst({
    where: eq(usersTable.clerkId, clerkId),
  });

  if (!user) {
    const [created] = await db
      .insert(usersTable)
      .values({ clerkId, email, role: isAdminEmail ? "admin" : "client" })
      .returning();
    user = created;
  } else if (isAdminEmail && user.role !== "admin") {
    // Auto-promote existing user if they match the admin email
    const [promoted] = await db
      .update(usersTable)
      .set({ role: "admin" })
      .where(eq(usersTable.id, user.id))
      .returning();
    user = promoted;
  }

  return user;
}
