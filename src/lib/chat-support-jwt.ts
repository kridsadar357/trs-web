import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "trs_chat_support";

function getSecret(): Uint8Array {
  const s = process.env.CHAT_SUPPORT_JWT_SECRET || process.env.NEXTAUTH_SECRET || "dev-only-change-me";
  return new TextEncoder().encode(s);
}

export { COOKIE_NAME };

export async function signSupportAgentToken(agentId: string): Promise<string> {
  return new SignJWT({ sub: agentId, typ: "chat_support" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySupportAgentToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.typ !== "chat_support" || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}
