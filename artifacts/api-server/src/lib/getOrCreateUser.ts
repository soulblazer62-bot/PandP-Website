import { clerkClient } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();

async function getClerkEmail(clerkId: string): Promise<string> {
  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const primary = clerkUser.emailAddresses.find(
      (e: { id: string; emailAddress: string }) => e.id === clerkUser.primaryEmailAddressId
    );
    return primary?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";
  } catch {
    return "";
  }
}

export async function getOrCreateUser(clerkId: string, sessionEmail: string) {
  let user = await db.query.usersTable.findFirst({
    where: eq(usersTable.clerkId, clerkId),
  });

  // Use session email first; fall back to Clerk backend if empty (e.g. Google OAuth)
  const email = sessionEmail || (await getClerkEmail(clerkId));
  const isAdminEmail = ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL;

  if (!user) {
    const [created] = await db
      .insert(usersTable)
      .values({ clerkId, email, role: isAdminEmail ? "admin" : "client" })
      .returning();
    user = created;
  } else {
    // Update email if it was missing, and promote to admin if email matches
    const needsEmailUpdate = !user.email && email;
    const needsPromotion = isAdminEmail && user.role !== "admin";

    if (needsEmailUpdate || needsPromotion) {
      const [updated] = await db
        .update(usersTable)
        .set({
          ...(needsEmailUpdate ? { email } : {}),
          ...(needsPromotion ? { role: "admin" } : {}),
        })
        .where(eq(usersTable.id, user.id))
        .returning();
      user = updated;
    }
  }

  return user;
}
