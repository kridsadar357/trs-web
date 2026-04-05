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

`next.config.js` sets `output: "standalone"` for a smaller Docker image. The `Dockerfile` copies the standalone server bundle from `.next/standalone`.
