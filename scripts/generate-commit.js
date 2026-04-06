#!/usr/bin/env node
const { execSync } = require("child_process");

function run(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" }).trim();
}

function parsePorcelain() {
  const out = run("git status --porcelain");
  if (!out) return [];
  return out
    .split(/\r?\n/)
    .map((line) => {
      const code = line.slice(0, 2).trim();
      const afterCode = line.slice(2);
      const fileStart = afterCode.search(/\S/);
      const file = fileStart >= 0 ? afterCode.slice(fileStart) : "";
      return { code, file: file.trim() };
    })
    .filter((x) => x.file.length > 0);
}

function pickType(files) {
  const names = files.map((f) => f.toLowerCase());
  if (names.every((f) => f.endsWith(".md"))) return "docs";
  if (names.some((f) => f.includes("test") || f.includes("__tests__"))) return "test";
  if (names.some((f) => f.includes("fix") || f.includes("bug"))) return "fix";
  if (names.some((f) => f.includes("scripts/") || f.endsWith(".bat") || f.endsWith(".ps1"))) return "chore";
  return "feat";
}

function buildScope(files) {
  const topDirs = new Set(
    files
      .map((f) => f.split(/[\\/]/)[0])
      .filter((d) => d && d !== ".")
  );
  if (topDirs.size === 1) return Array.from(topDirs)[0].toLowerCase();
  if (topDirs.has("src")) return "app";
  return "";
}

function summarize(files) {
  const priority = [
    [/manifest/i, "manifest handling"],
    [/deploy|vps|pm2/i, "VPS deploy flow"],
    [/hero|logo|image|upload/i, "image assets"],
    [/chat/i, "chat app"],
  ];
  for (const [re, label] of priority) {
    if (files.some((f) => re.test(f))) return label;
  }
  const first = files[0] || "project updates";
  return first.includes("/") || first.includes("\\") ? first.split(/[\\/]/).slice(-1)[0] : first;
}

function main() {
  const apply = process.argv.includes("--apply");
  const changed = parsePorcelain();

  if (changed.length === 0) {
    console.log("No changes to commit.");
    process.exit(0);
  }

  const files = changed.map((x) => x.file);
  const type = pickType(files);
  const scope = buildScope(files);
  const subject = summarize(files);
  const message = `${type}${scope ? `(${scope})` : ""}: update ${subject}`;

  console.log(`Suggested commit message:\n${message}\n`);
  console.log("Changed files:");
  for (const f of files) console.log(`- ${f}`);

  if (!apply) {
    console.log("\nDry run only. Use --apply to stage all and commit.");
    return;
  }

  run("git add -A");
  run(`git commit -m "${message.replace(/"/g, '\\"')}"`);
  console.log("\nCommitted successfully.");
}

main();
