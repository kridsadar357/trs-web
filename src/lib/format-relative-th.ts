import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

export function formatRelativeTh(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true, locale: th });
}
