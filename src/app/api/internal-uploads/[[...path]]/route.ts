import type { NextRequest } from "next/server";
import { serveUploadFileResponse } from "@/lib/serve-upload-file";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Internal target for `beforeFiles` rewrite from `/uploads/*` so files are always read from disk
 * (including `UPLOAD_DIR`), not short-circuited by a missing `public/` entry.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: segments } = await context.params;
  return serveUploadFileResponse(segments);
}
