import path from "path";

/**
 * Directory for chat / site uploads.
 * Default: `public/uploads` under the Node process cwd (standalone = `.next/standalone`).
 *
 * For PM2 standalone, set `UPLOAD_DIR` to a path **outside** `.next` (e.g. `/var/lib/trs-web/uploads`)
 * so `cp -r public .next/standalone/public` does not wipe files on each deploy.
 */
export function getUploadsAbsoluteDir(): string {
  const fromEnv = process.env.UPLOAD_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(process.cwd(), "public", "uploads");
}
