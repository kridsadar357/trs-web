import type { Prisma } from "@prisma/client";

function optionalStr(v: unknown): string | null {
  if (v == null || v === "") return null;
  return String(v);
}

function stringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function numberField(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? 0 : n;
}

/** Safe payload for prisma.service.create — ignores unknown JSON keys */
export function parseServiceCreateBody(body: unknown): Prisma.ServiceCreateInput {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  return {
    title: String(b.title ?? "").trim() || "Untitled",
    slug: String(b.slug ?? "").trim() || "untitled",
    description: String(b.description ?? "").trim() || "",
    coverImage: optionalStr(b.coverImage),
    detailContent: optionalStr(b.detailContent),
    icon: optionalStr(b.icon),
    features: stringArray(b.features),
    order: numberField(b.order),
    published: typeof b.published === "boolean" ? b.published : true,
  };
}

/** Safe payload for prisma.service.update — only known fields */
export function parseServiceUpdateBody(body: unknown): Prisma.ServiceUpdateInput {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const out: Prisma.ServiceUpdateInput = {};
  if (typeof b.title === "string") out.title = b.title;
  if (typeof b.slug === "string") out.slug = b.slug;
  if (typeof b.description === "string") out.description = b.description;
  if ("coverImage" in b) out.coverImage = optionalStr(b.coverImage);
  if ("detailContent" in b) out.detailContent = optionalStr(b.detailContent);
  if ("icon" in b) out.icon = optionalStr(b.icon);
  if ("features" in b) out.features = stringArray(b.features);
  if ("order" in b) out.order = numberField(b.order);
  if (typeof b.published === "boolean") out.published = b.published;
  return out;
}
