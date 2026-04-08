/**
 * Portfolio URLs must encode non-ASCII slugs so proxies and browsers handle them reliably.
 * Lookups normalize Unicode (NFC/NFD) because DB rows may differ in normalization.
 */

export function normalizePortfolioSlugForStorage(s: string): string {
  return s.trim().normalize("NFC");
}

/** Use in <Link href={...}> and router.push for public portfolio detail URLs. */
export function portfolioDetailHref(slug: string): string {
  return `/portfolio/${encodeURIComponent(slug.trim())}`;
}

/** Build unique slug candidates from the dynamic [slug] route param for Prisma lookup. */
export function slugParamCandidates(raw: string): string[] {
  const t = raw.trim();
  const variants = new Set<string>();
  let base = t;
  if (/%[0-9A-Fa-f]{2}/.test(t)) {
    try {
      base = decodeURIComponent(t);
    } catch {
      base = t;
    }
  }
  variants.add(base);
  variants.add(base.normalize("NFC"));
  variants.add(base.normalize("NFD"));
  return [...variants];
}
