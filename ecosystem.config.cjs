/**
 * PM2 config: loads repo-root `.env` so DATABASE_URL exists (standalone cwd has no .env).
 * Usage on VPS from repo root:
 *   pm2 delete trs-next 2>/dev/null
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *
 * Deploy must copy `public` next to the same `server.js` PM2 uses (flat or nested under
 * `trs-web/`). See `scripts/deploy-vps.bat`.
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;

function parseEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const envFromFile = parseEnvFile(path.join(root, ".env"));

const nestedServer = path.join(root, ".next/standalone/trs-web/server.js");
const flatServer = path.join(root, ".next/standalone/server.js");
let cwd;
if (fs.existsSync(nestedServer)) {
  cwd = path.dirname(nestedServer);
} else if (fs.existsSync(flatServer)) {
  cwd = path.dirname(flatServer);
} else {
  cwd = path.join(root, ".next/standalone/trs-web");
}

module.exports = {
  apps: [
    {
      name: "trs-next",
      cwd,
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        ...envFromFile,
      },
    },
  ],
};
