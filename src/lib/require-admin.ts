import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const role = session?.user && "role" in session.user ? (session.user as { role?: string }).role : undefined;
  if (!session?.user?.email || role !== "admin") {
    return null;
  }
  return session;
}
