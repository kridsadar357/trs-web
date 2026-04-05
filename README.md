# TRS Web — Full-Stack Website + CMS

A modern, full-stack website with a built-in admin CMS built with **Next.js 15**, **Tailwind CSS**, **shadcn/ui components**, **Prisma**, and **MySQL**.

## Features

### Public Website
- **Home** — Hero, Services preview, Portfolio showcase, Testimonials, Stats, CTA
- **About** — Company story, values, timeline
- **Services** — Full service listing with features
- **Portfolio** — Project gallery with categories and tech tags
- **Team** — Team member profiles with specialties
- **Blog** — Blog listing and detail pages with categories
- **Contact** — Contact form with info sidebar

### Admin CMS Dashboard
- **Dashboard** — Overview with stats and quick actions
- **Pages** — Manage site pages
- **Services** — CRUD for services
- **Portfolio** — CRUD for portfolio items
- **Blog** — CRUD for blog posts
- **Team** — CRUD for team members
- **Testimonials** — CRUD for client testimonials
- **Contacts** — View contact form submissions
- **Settings** — Site configuration

### Technical Features
- Dark mode toggle with system preference detection
- Fully responsive (mobile, tablet, desktop)
- Admin authentication (NextAuth.js)
- SEO-optimized with metadata
- MySQL database with Prisma ORM
- Type-safe with TypeScript
- Modern UI with custom shadcn/ui components

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| UI Components | Custom shadcn/ui-style |
| Database | MySQL |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials) |
| Icons | Lucide React |
| Deployment | Vercel (recommended) |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database (5.7+ or 8.0+)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and update with your MySQL credentials:

```env
DATABASE_URL="mysql://root:password@localhost:3306/trs_web"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
ADMIN_EMAIL="admin@trs.com"
ADMIN_PASSWORD="admin123"
```

### 3. Set up the database

```bash
npx prisma db push
npx prisma generate
npx prisma db seed
```

### 4. Start the development server

```bash
npm run dev
```

Visit:
- **Website**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

### Default Admin Credentials
- **Email**: admin@trs.com
- **Password**: admin123

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles + CSS variables
│   ├── about/page.tsx              # About page
│   ├── services/page.tsx           # Services page
│   ├── portfolio/page.tsx          # Portfolio page
│   ├── team/page.tsx               # Team page
│   ├── blog/
│   │   ├── page.tsx                # Blog listing
│   │   └── [slug]/page.tsx         # Blog post detail
│   ├── contact/page.tsx            # Contact page
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout with auth guard
│   │   ├── page.tsx                # Dashboard
│   │   ├── login/page.tsx          # Login page
│   │   ├── pages/page.tsx          # Pages management
│   │   ├── services/page.tsx       # Services management
│   │   ├── portfolio/page.tsx      # Portfolio management
│   │   ├── blog/page.tsx           # Blog management
│   │   ├── team/page.tsx           # Team management
│   │   ├── testimonials/page.tsx   # Testimonials management
│   │   ├── contacts/page.tsx       # Contact submissions
│   │   └── settings/page.tsx       # Site settings
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── contact/route.ts
│       ├── services/route.ts
│       ├── blog/route.ts
│       ├── portfolio/route.ts
│       ├── team/route.ts
│       └── testimonials/route.ts
├── components/
│   ├── ui/                         # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   └── badge.tsx
│   ├── layout/
│   │   ├── header.tsx              # Main site header
│   │   ├── footer.tsx              # Main site footer
│   │   └── site-chrome.tsx         # Conditional site chrome wrapper
│   ├── admin/
│   │   └── admin-layout.tsx        # Admin sidebar + topbar
│   ├── sections/                   # Homepage sections
│   │   ├── hero-section.tsx
│   │   ├── services-section.tsx
│   │   ├── portfolio-section.tsx
│   │   ├── testimonials-section.tsx
│   │   └── cta-section.tsx
│   ├── providers/
│   │   └── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # NextAuth configuration
│   └── utils.ts                    # Utility functions (cn)
prisma/
├── schema.prisma                   # Database schema (MySQL)
└── seed.ts                         # Database seed data
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual

```bash
npm run build
npm start
```

## Customization

### Brand Colors
Edit CSS variables in `src/app/globals.css` under `:root` and `.dark`:
- `--primary`: Main brand color (default: indigo)
- `--secondary`: Accent color (default: amber)
- All other colors derive from these

### Adding Content
Use the admin dashboard at `/admin` or Prisma Studio:
```bash
npx prisma studio
```

## License

MIT
