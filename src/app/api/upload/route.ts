import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getUploadsAbsoluteDir } from "@/lib/uploads-dir";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_EXT = /\.(jpe?g|png|gif|webp|pdf|doc|docx|xlsx?|txt|zip)$/i;

function errnoHint(err: unknown): string {
  const code = err && typeof err === "object" && "code" in err ? String((err as NodeJS.ErrnoException).code) : "";
  if (code === "EACCES" || code === "EPERM") return " (permission denied on upload folder — check UPLOAD_DIR or chown)";
  if (code === "ENOSPC") return " (disk full)";
  if (code === "EROFS") return " (read-only filesystem)";
  return "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".bin";
    if (!ALLOWED_EXT.test(ext)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }
    const filename = `${randomUUID()}${ext}`;

    const uploadDir = getUploadsAbsoluteDir();
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      console.error("upload mkdir", uploadDir, e);
      return NextResponse.json(
        { error: `Cannot create upload directory: ${uploadDir}` },
        { status: 500 }
      );
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({
      url,
      filename,
      mime: file.type || "application/octet-stream",
      originalName: file.name.slice(0, 255),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: `Upload failed${errnoHint(error)}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { filename } = (await request.json()) as { filename?: string };
    if (!filename || typeof filename !== "string") {
      return NextResponse.json({ error: "No filename" }, { status: 400 });
    }

    const safeName = path.basename(filename.replace(/\\/g, "/"));
    if (!safeName || safeName.includes("..")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const { unlink } = await import("fs/promises");
    const root = path.resolve(getUploadsAbsoluteDir());
    const filepath = path.join(root, safeName);
    const resolved = path.resolve(filepath);
    if (!resolved.startsWith(root + path.sep)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }
    await unlink(filepath).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
