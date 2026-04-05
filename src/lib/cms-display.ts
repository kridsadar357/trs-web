/** Shared visuals / helpers for CMS-driven public sections */

export const CMS_CARD_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
] as const;

export function stringArrayFromJson(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

export function gradientAt(index: number): string {
  return CMS_CARD_GRADIENTS[index % CMS_CARD_GRADIENTS.length]!;
}

export function estimateReadMinutes(content: string | null | undefined): number {
  const text = (content ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export function excerptFromPost(excerpt: string | null | undefined, content: string | null | undefined): string {
  const e = excerpt?.trim();
  if (e) return e;
  const text = (content ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}
