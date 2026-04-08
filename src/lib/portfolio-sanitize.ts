import type { Prisma } from "@prisma/client";

function normalizeTechnologies(raw: unknown): string[] | undefined {
  if (raw == null) return undefined;
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (Array.isArray(raw)) {
    return raw.filter((t): t is string => typeof t === "string").map((t) => t.trim()).filter(Boolean);
  }
  return undefined;
}

function normalizeGallery(raw: unknown): string[] | undefined {
  if (raw == null) return undefined;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((u): u is string => typeof u === "string")
        : undefined;
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(raw)) {
    return raw.filter((u): u is string => typeof u === "string");
  }
  return undefined;
}

function normalizeCompletedAt(raw: unknown): Date | null | undefined {
  if (raw === "" || raw === null || raw === undefined) return null;
  if (typeof raw !== "string") return undefined;
  const d = new Date(raw.length === 10 ? `${raw}T12:00:00.000Z` : raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Build Prisma-safe portfolio payload from client JSON (avoids unknown keys / bad JSON). */
export function sanitizePortfolioBody(raw: unknown): Prisma.PortfolioItemUncheckedCreateInput {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid request body");
  }
  const b = raw as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  const slug = typeof b.slug === "string" ? b.slug.trim() : "";
  const description = typeof b.description === "string" ? b.description : "";
  if (!title) throw new Error("Title is required");
  if (!slug) throw new Error("Slug is required");
  if (!description) throw new Error("Description is required");

  const technologies = normalizeTechnologies(b.technologies);
  const gallery = normalizeGallery(b.gallery);

  const data: Prisma.PortfolioItemUncheckedCreateInput = {
    title,
    slug,
    description,
    content: typeof b.content === "string" ? b.content : null,
    client: typeof b.client === "string" ? b.client : null,
    category: typeof b.category === "string" ? b.category : null,
    imageUrl: typeof b.imageUrl === "string" ? b.imageUrl : null,
    technologies: technologies ?? [],
    gallery: gallery ?? [],
    featured: typeof b.featured === "boolean" ? b.featured : false,
    published: typeof b.published === "boolean" ? b.published : true,
  };

  const completedAt = normalizeCompletedAt(b.completedAt);
  data.completedAt = completedAt === undefined ? null : completedAt;

  return data;
}
