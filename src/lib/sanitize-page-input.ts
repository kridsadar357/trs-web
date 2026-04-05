import { Prisma } from "@prisma/client";

export type PageUpdateInput = {
  slug: string;
  title: string;
  content: Prisma.InputJsonValue | typeof Prisma.JsonNull;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroImage: string | null;
  metaDescription: string | null;
  published: boolean;
  order: number;
};

function trimOrNull(s: unknown, max: number): string | null {
  if (s == null) return null;
  const t = String(s).trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max) : t;
}

function trimRequired(s: unknown, max: number, field: string): string {
  const t = s == null ? "" : String(s).trim();
  if (!t) throw new Error(`${field} is required`);
  return t.length > max ? t.slice(0, max) : t;
}

export function contentHtmlFromJson(content: unknown): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object" && content !== null && "html" in content) {
    const h = (content as { html: unknown }).html;
    return typeof h === "string" ? h : "";
  }
  return "";
}

export function toPageContentJson(html: string): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  const t = html.trim();
  if (!t) return Prisma.JsonNull;
  return { html: t } as Prisma.InputJsonValue;
}

export function parsePageCreateBody(raw: unknown): PageUpdateInput {
  if (!raw || typeof raw !== "object") throw new Error("Invalid body");
  const o = raw as Record<string, unknown>;
  return {
    slug: trimRequired(o.slug, 255, "slug").replace(/^\/+/, ""),
    title: trimRequired(o.title, 255, "title"),
    content: toPageContentJson(typeof o.contentHtml === "string" ? o.contentHtml : ""),
    heroTitle: trimOrNull(o.heroTitle, 255),
    heroSubtitle: trimOrNull(o.heroSubtitle, 255),
    heroImage: trimOrNull(o.heroImage, 500),
    metaDescription: trimOrNull(o.metaDescription, 20000),
    published: Boolean(o.published),
    order: typeof o.order === "number" && Number.isFinite(o.order) ? Math.floor(o.order) : 0,
  };
}

export function parsePageUpdateBody(raw: unknown): Partial<PageUpdateInput> {
  if (!raw || typeof raw !== "object") throw new Error("Invalid body");
  const o = raw as Record<string, unknown>;
  const out: Partial<PageUpdateInput> = {};
  if ("slug" in o) out.slug = trimRequired(o.slug, 255, "slug").replace(/^\/+/, "");
  if ("title" in o) out.title = trimRequired(o.title, 255, "title");
  if ("contentHtml" in o && typeof o.contentHtml === "string") out.content = toPageContentJson(o.contentHtml);
  if ("heroTitle" in o) out.heroTitle = trimOrNull(o.heroTitle, 255);
  if ("heroSubtitle" in o) out.heroSubtitle = trimOrNull(o.heroSubtitle, 255);
  if ("heroImage" in o) out.heroImage = trimOrNull(o.heroImage, 500);
  if ("metaDescription" in o) out.metaDescription = trimOrNull(o.metaDescription, 20000);
  if ("published" in o) out.published = Boolean(o.published);
  if ("order" in o && typeof o.order === "number" && Number.isFinite(o.order)) out.order = Math.floor(o.order);
  return out;
}
