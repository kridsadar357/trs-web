export type QuotationServiceItem = { id: string; title: string };

export type QuotationMeta = {
  quotation: true;
  services: QuotationServiceItem[];
  phone?: string;
  note?: string;
};

export function buildQuotationMessage(services: QuotationServiceItem[], phone: string, note: string): { body: string; meta: QuotationMeta } {
  const lines = ["📋 ขอใบเสนอราคา", "", "บริการที่สนใจ:"];
  for (const s of services) {
    lines.push(`• ${s.title}`);
  }
  const p = phone.trim();
  const n = note.trim();
  if (p) {
    lines.push("", `เบอร์โทร: ${p}`);
  }
  if (n) {
    lines.push("", `หมายเหตุ: ${n}`);
  }
  return {
    body: lines.join("\n").slice(0, 8000),
    meta: {
      quotation: true,
      services,
      ...(p ? { phone: p } : {}),
      ...(n ? { note: n } : {}),
    },
  };
}
