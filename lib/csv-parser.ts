import Papa from "papaparse";

export interface BuyerRow {
  email: string;
  firstName: string;
  lastName: string;
  tier: string;
  qty: number;
}

export interface ParseResult {
  rows: BuyerRow[];
  errors: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseBuyerList(input: string): ParseResult {
  const looksTab = input.includes("\t");
  const result = Papa.parse<Record<string, string>>(input.trim(), {
    header: true,
    delimiter: looksTab ? "\t" : ",",
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const rows: BuyerRow[] = [];
  const errors: string[] = [];

  result.data.forEach((raw, i) => {
    const email = (raw.email ?? "").trim();
    const firstName = (raw.firstName ?? "").trim();
    const lastName = (raw.lastName ?? "").trim();
    const tier = (raw.tier ?? "").trim();
    const qtyRaw = (raw.qty ?? "1").trim();
    const qty = parseInt(qtyRaw, 10) || 1;

    if (!EMAIL_RE.test(email)) {
      errors.push(`Ligne ${i + 2} : email invalide "${email}"`);
      return;
    }
    if (!firstName || !lastName) {
      errors.push(`Ligne ${i + 2} : prénom ou nom manquant`);
      return;
    }
    if (!tier) {
      errors.push(`Ligne ${i + 2} : tier manquant`);
      return;
    }

    rows.push({ email, firstName, lastName, tier, qty });
  });

  return { rows, errors };
}
