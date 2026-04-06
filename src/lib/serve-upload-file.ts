import { readFile, stat } from "fs/promises";
import path from "path";
import { getUploadsAbsoluteDir } from "@/lib/uploads-dir";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
  ".zip": "application/zip",
};

/** Serve one file under `UPLOAD_DIR` / `public/uploads` (path traversal–safe). */
export async function serveUploadFileResponse(segments: string[] | undefined): Promise<Response> {
  if (!segments?.length) {
    return new Response("Not found", { status: 404 });
  }
  for (const s of segments) {
    if (s.includes("..") || s.includes("/") || s.includes("\\")) {
      return new Response("Not found", { status: 404 });
    }
  }

  const resolvedRoot = path.resolve(getUploadsAbsoluteDir());
  const resolvedFile = path.resolve(path.join(resolvedRoot, ...segments));
  const prefix = resolvedRoot.endsWith(path.sep) ? resolvedRoot : `${resolvedRoot}${path.sep}`;
  if (resolvedFile !== resolvedRoot && !resolvedFile.startsWith(prefix)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const st = await stat(resolvedFile);
    if (!st.isFile()) {
      return new Response("Not found", { status: 404 });
    }
    const buf = await readFile(resolvedFile);
    const ext = path.extname(resolvedFile).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    return new Response(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
