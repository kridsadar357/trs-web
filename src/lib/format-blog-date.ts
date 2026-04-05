import { format, parseISO } from "date-fns";
import { enUS, th } from "date-fns/locale";

export function formatBlogDate(isoDate: string, lang: string) {
  const locale = lang.startsWith("th") ? th : enUS;
  try {
    return format(parseISO(isoDate), "PPP", { locale });
  } catch {
    return isoDate;
  }
}
