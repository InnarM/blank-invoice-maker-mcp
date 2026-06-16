import { randomUUID } from "node:crypto";
import lzString from "lz-string";
import type { InvoiceData, InvoiceItem, TaxEntry, Address } from "./types.js";
import type { CreateInvoiceInput, Party } from "./schema.js";

// lz-string is CommonJS; import the default and destructure so this works
// under native Node ESM (named imports from CJS are not supported there).
const { compressToEncodedURIComponent } = lzString;

export const APP_URL = "https://blankinvoicemaker.com";
export const INVOICE_HASH_PREFIX = "#invoice=";
export const DEFAULT_COLOR = "#3b82f6";

/**
 * Max length of the encoded payload. Typical invoices encode to a few hundred
 * chars; this generous ceiling guards against URLs that exceed browser limits.
 * Mirrors MAX_ENCODED_LENGTH on the web app.
 */
export const MAX_ENCODED_LENGTH = 12000;

function parseNetDays(terms: string): number | null {
  const m = terms.match(/net\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

function addDays(isoDate: string, days: number): string {
  const [y, mo, d] = isoDate.split("-").map(Number);
  if (!y || !mo || !d) return isoDate;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildAddress(party: Party): Address {
  return {
    name: party.name,
    addressLine: party.address ?? "",
    postcode: party.postcode ?? "",
    city: party.city ?? "",
    state: party.state ?? "",
    country: party.country ?? "",
    contactName: party.contactName ?? "",
    email: party.email ?? "",
    taxId: party.taxId ?? "",
    taxIdLabel: party.taxIdLabel ?? "",
    registrationNumber: party.registrationNumber ?? "",
  };
}

/**
 * Map the friendly tool input into a complete, valid InvoiceData object,
 * filling sensible defaults for everything the caller omitted.
 */
export function buildInvoiceData(input: CreateInvoiceInput): InvoiceData {
  const invoiceDate = input.invoiceDate ?? today();
  const paymentTerms = input.paymentTerms ?? "Net 30";
  const netDays = parseNetDays(paymentTerms);
  const dueDate = input.dueDate ?? (netDays !== null ? addDays(invoiceDate, netDays) : "");

  const items: InvoiceItem[] = input.items.map((it) => ({
    id: randomUUID(),
    name: it.description,
    quantity: it.quantity,
    unit: it.unit ?? "unit",
    unitPrice: it.unitPrice,
    discount: it.discount ?? "",
  }));

  const taxes: TaxEntry[] = (input.taxes ?? []).map((t) => ({
    id: randomUUID(),
    label: t.label,
    rate: t.rate,
    type: "percentage",
    isInclusive: t.isInclusive ?? false,
  }));

  return {
    invoicer: buildAddress(input.business),
    customer: buildAddress(input.client),
    info: {
      invoiceNumber: input.invoiceNumber ?? "INV-001",
      invoiceDate,
      paymentTerms,
      dueDate,
      autoDue: input.dueDate ? false : netDays !== null,
    },
    items,
    taxes,
    currency: input.currency ?? "USD",
    discountRate: input.discountRate ?? "",
    bank: {
      bankName: input.bank?.bankName ?? "",
      bankAddress: input.bank?.bankAddress ?? "",
      iban: input.bank?.iban ?? "",
      swift: input.bank?.swift ?? "",
    },
    notes: input.notes ?? "",
    labels: {
      documentTitle: input.documentTitle ?? "Invoice",
      invoiceNumber: "Invoice Number",
      taxId: "Tax ID",
      registrationNumber: "Registration Number",
    },
    color: input.color ?? DEFAULT_COLOR,
  };
}

/** Encode an invoice into a blankinvoicemaker.com deep link. */
export function encodeDeepLink(data: InvoiceData): { url: string; length: number } {
  const encoded = compressToEncodedURIComponent(JSON.stringify(data));
  return { url: `${APP_URL}/${INVOICE_HASH_PREFIX}${encoded}`, length: encoded.length };
}
