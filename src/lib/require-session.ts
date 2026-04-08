import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Any authenticated user (admin panel credentials). */
export async function requireSignedInSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return session;
}
