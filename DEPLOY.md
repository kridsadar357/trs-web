# Deploy TRS Web (GitHub + Docker on VPS)

## 1. What was exported locally

In **`exports/`** (re-run anytime):

| Artifact | Description |
|----------|-------------|
| `trs_web_full_dump.sql` | Full MySQL dump (`schema + data`). |
| `public_media.zip` | `public/hero` and `public/uploads`. |

Regenerate:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/export-for-vps.ps1
```

**Security:** Do not push `*.sql` or `*.zip` from `exports/` to a **public** GitHub repo. They are listed in `.gitignore`. Use a private repo or transfer via `scp` only.

## 2. Push code to GitHub

```bash
git remote add origin https://github.com/kridsadar357/trs-web.git
git add .
git commit -m "Initial deploy setup"
git push -u origin main
```

On the VPS:

```bash
git clone https://github.com/kridsadar357/trs-web.git
cd trs-web
```

## 3. Copy database and files to the VPS

From your PC (example):

```bash
scp exports/trs_web_full_dump.sql user@YOUR_VPS:/opt/trs-web/
scp exports/public_media.zip user@YOUR_VPS:/opt/trs-web/
```

On the server, extract media next to the app (or into a bind-mount path):

```bash
cd /opt/trs-web
unzip -o public_media.zip -d public_extract
mkdir -p public
mv public_extract/hero public/ 2>/dev/null || true
mv public_extract/uploads public/ 2>/dev/null || true
```

## 4. Run with Docker Compose

Create a **`.env`** next to `docker-compose.yml` on the VPS (never commit real secrets):

```env
MYSQL_ROOT_PASSWORD=your-strong-root-password
MYSQL_USER=trs
MYSQL_PASSWORD=your-strong-app-password
DATABASE_URL=mysql://trs:your-strong-app-password@db:3306/trs_web
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

Start MySQL, import dump, then start the app:

```bash
docker compose up -d db
sleep 15
docker exec -i trs-mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" trs_web < trs_web_full_dump.sql
docker compose up -d --build app
```

Adjust `DATABASE_URL` user/password if your dump used different credentials. If the dump expects `root` with no password, import as root then align app `DATABASE_URL` with the user you grant.

## 5. Production notes

- Point **NEXTAUTH_URL** at your public HTTPS URL.
- Put the app behind **nginx** or **Caddy** with TLS.
- **Uploads:** mount `public/uploads` as a volume so files survive image rebuilds (see commented `volumes` in `docker-compose.yml`).
- **Prisma:** This project often uses `prisma db push` / migrations in dev; production can rely on your SQL dump or run `npx prisma migrate deploy` if you use migrations.

## 6. Next.js standalone

`next.config.js` sets `output: "standalone"` for a smaller Docker image. The `Dockerfile` copies the standalone server bundle from `.next/standalone`, plus `.next/static` and **`public/`** (favicons, PWA assets, uploads path).

### PM2 on the VPS (no Docker)

From the repo root after `npm run build`:

1. Copy static assets next to the standalone server (paths match `ecosystem.config.cjs` — nested `trs-web` vs flat `standalone`):

   ```bash
   # If .next/standalone/trs-web/server.js exists:
   cp -r public .next/standalone/trs-web/public
   cp -r .next/static .next/standalone/trs-web/.next/static

   # Else if .next/standalone/server.js exists:
   cp -r public .next/standalone/public
   cp -r .next/static .next/standalone/.next/static
   ```

2. Ensure repo-root **`.env`** includes at least `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and (recommended) **`CHAT_SUPPORT_JWT_SECRET`** for the support agent PWA.

3. `pm2 start ecosystem.config.cjs` && `pm2 save`

**Uploads (chat + admin):** Nginx’s default **`client_max_body_size`** is **1m** — larger images return **413** and look like “upload failed”. In your `server` (or `location /`) block set e.g. **`client_max_body_size 15m;`**. Prefer a persistent **`UPLOAD_DIR`** outside `.next` (see `.env.example`) so `cp -r public .next/standalone/public` does not delete `public/uploads` on each deploy. Do **not** point `location /uploads/` at an empty folder unless that folder is the same as **`UPLOAD_DIR`**; otherwise proxy **`/`** to Node and let the app serve `/uploads/*`.

## 7. Support chat PWA (`chats.*` subdomain)

The **TRS Support Chat** lives under `src/app/chat-app` (on the main site it is mounted at `/chat-app/*`; on a host whose name starts with `chats.` the same routes appear at `/`, `/inbox`, `/thread/...` — see `src/lib/chat-app-routes.ts`).

| Topic | Notes |
|--------|--------|
| **DNS** | Point `chats.yourdomain.com` (A/AAAA) to the same VPS as the main app, or use a reverse-proxy `server_name` block. |
| **TLS** | Same certificate (SAN) or a separate cert for `chats.*`. |
| **Reverse proxy** | Proxy to the same Node process as the main site (one Next.js app). Enable **WebSocket/SSE**: `proxy_buffering off`, reasonable `proxy_read_timeout` for `/api/chat-support/subscribe`. |
| **Database** | Prisma models `SupportAgent`, `ChatThread`, `ChatMessage`, and **`SupportPushSubscription`** must exist (`npx prisma db push` or your migration/dump). Seed or create support agents via your admin flow. |
| **Env** | `CHAT_SUPPORT_JWT_SECRET` — long random string (defaults to `NEXTAUTH_SECRET` if unset; a dedicated secret is better). |
| **Web Push** | Optional: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` (e.g. `mailto:support@yourdomain.com`). Generate keys: `npx web-push generate-vapid-keys`. Without these, the PWA still installs; agents simply will not receive **system push** for new visitor messages. **HTTPS** is required in production for push and for a smooth install flow. |
| **Scaling** | Chat SSE uses in-memory pub/sub (`src/lib/chat-bus.ts`). Use **one Node instance** (or one PM2 fork) for real-time until you replace the bus with Redis pub/sub. |
| **PWA** | `src/app/chat-app/manifest.ts` + generated **`/chat-app/icon`** / **`/chat-app/apple-icon`**; static `public/sw-support.js` handles push notifications. Add **`public/android-chrome-192x192.png`** (and 512) for richer launcher icons if you have branded assets. |

Example **nginx** fragment for SSE (adjust upstream):

```nginx
location /api/chat-support/subscribe {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 86400s;
}
```

## 8. Full flow after DB is ready (PM2 on VPS, e.g. `~/web/trs-web`)

Use this when you have a **good** `trs_web_full_dump.sql` (ideally from local after `npx prisma db push`) and want the site + chat working end-to-end.

### A. On your PC (before `scp`)

1. Sync schema locally: `npx prisma db push` (and fix any errors).
2. Export DB + media: `powershell -ExecutionPolicy Bypass -File scripts\export-for-vps.ps1`
3. Copy to the server, e.g.  
   `scp exports/trs_web_full_dump.sql exports/public_media.zip root@VPS:~/web/trs-web/`

### B. On the VPS — database

```bash
# Backup current DB (optional)
mysqldump -u root -p trs_web > ~/trs_web_backup_$(date +%F).sql

mysql -u root -p -e "DROP DATABASE IF EXISTS trs_web; CREATE DATABASE trs_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p trs_web < ~/web/trs-web/trs_web_full_dump.sql
```

Use the same MySQL user as in `DATABASE_URL` if you do not use `root`.

### C. On the VPS — media under `public/`

```bash
cd ~/web/trs-web
unzip -o public_media.zip -d public_tmp
mkdir -p public
mv public_tmp/hero public/ 2>/dev/null || true
mv public_tmp/uploads public/ 2>/dev/null || true
rm -rf public_tmp
```

### D. On the VPS — app code and build

If `git pull` complains about **untracked** `exports/trs_export.tgz` or `trs_export.tgz`, move them out of the repo (`mkdir -p ~/backup-trs && mv … ~/backup-trs/`), then pull.

```bash
cd ~/web/trs-web
git pull origin main
npm ci
```

**Prisma CLI:** use the project’s version (Prisma **6**), not bare `npx prisma` (which can install Prisma **7** and break `schema.prisma`):

```bash
npm exec prisma generate
# Only if the dump might be older than schema.prisma; skip if dump is fresh from local push:
# npm exec prisma db push
npm run build
```

### E. Standalone assets + PM2

Flat standalone (when `pm2` shows `cwd` = `.next/standalone`):

```bash
cd ~/web/trs-web
cp -r public .next/standalone/public
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
pm2 restart trs-next
```

Nested standalone (when `server.js` is under `.next/standalone/trs-web/`):

```bash
cp -r public .next/standalone/trs-web/public
mkdir -p .next/standalone/trs-web/.next
cp -r .next/static .next/standalone/trs-web/.next/static
pm2 restart trs-next
```

### F. Smoke checks

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/api/health
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/chat-app/login
# After “เริ่มแชท”, POST /api/chat/thread should not be 500 if chat tables exist
```

Then test in the browser (hard refresh or private window).

---

## 9. MariaDB / MySQL: `Duplicate key name '…_key'` on `prisma db push`

Older databases often have **PascalCase** Prisma index names (`User_email_key`, `Page_slug_key`). This project’s Prisma **6** + `@@map("lowercase")` expects **lowercase** names (`user_email_key`, `page_slug_key`). On MariaDB, adding the lowercase name can conflict with the old name (**1061** / Prisma **Duplicate key name**).

**Preferred fix:** export a full dump from **local** after `npx prisma db push` succeeds, then **replace** the VPS database (section **8.B**) so you do not rename indexes by hand.

**Manual fix pattern:** `SHOW CREATE TABLE \`tablename\`\G` → `ALTER TABLE … DROP INDEX \`OldPascalCase_key\`` → `ALTER TABLE … ADD UNIQUE KEY \`lowercase_key\` (…)` → `npm exec prisma db push` again. Repeat for each table Prisma names until push completes.

**`account` + `account_provider_providerAccountId_key` (RedefineIndex / 1061):** Prisma is trying to (re)create the composite unique on `(provider, providerAccountId)` but MySQL/MariaDB already has an index with that **name** (or a **case-variant** that your server treats as the same name). Inspect and leave **exactly one** unique on those columns named **`account_provider_providerAccountId_key`**.

```bash
mysql -u root -p trs_web -e "SHOW CREATE TABLE \`account\`\G"
mysql -u root -p trs_web -e "SHOW INDEX FROM \`account\`;"
```

- If you see **`Account_provider_providerAccountId_key`** (PascalCase) **and** **`account_provider_providerAccountId_key`**, drop the PascalCase one first:  
  `ALTER TABLE \`account\` DROP INDEX \`Account_provider_providerAccountId_key\`;`
- If the error persists, the safe sequence is: drop **every** unique that covers only `provider` + `providerAccountId` (copy the exact `Key_name` from `SHOW INDEX`), then add the one Prisma expects:

```sql
ALTER TABLE `account` ADD UNIQUE KEY `account_provider_providerAccountId_key` (`provider`,`providerAccountId`);
```

(Only if no duplicate `(provider, providerAccountId)` rows exist.) Then `npm exec prisma db push` again.
