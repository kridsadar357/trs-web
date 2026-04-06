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
