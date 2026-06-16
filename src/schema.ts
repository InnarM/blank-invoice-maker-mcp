import { z } from "zod";

/** A billing party (your business, or the client). */
const partyShape = {
  name: z.string().min(1).describe("Business or person name"),
  address: z.string().optional().describe("Street address line"),
  city: z.string().optional(),
  postcode: z.string().optional(),
  state: z.string().optional().describe("State / province / region"),
  country: z.string().optional(),
  contactName: z.string().optional().describe("Contact person"),
  email: z.string().optional(),
  taxId: z.string().optional().describe("VAT number / EIN / ABN, etc."),
  taxIdLabel: z.string().optional().describe('Label for the tax id, e.g. "VAT Number"'),
  registrationNumber: z.string().optional().describe("Company registration number"),
};
export const partySchema = z.object(partyShape);
export type Party = z.infer<typeof partySchema>;

const itemSchema = z.object({
  description: z.string().min(1).describe("What is being billed"),
  quantity: z.union([z.number(), z.string()]).describe("Quantity"),
  unitPrice: z.union([z.number(), z.string()]).describe("Price per unit"),
  unit: z.string().optional().describe('Unit, e.g. "hours", "item", "day". Default "unit"'),
  discount: z.union([z.number(), z.string()]).optional().describe("Per-line discount in percent"),
});

const taxSchema = z.object({
  label: z.string().describe('Tax label, e.g. "VAT", "GST", "Sales Tax"'),
  rate: z.union([z.number(), z.string()]).describe("Tax rate in percent"),
  isInclusive: z.boolean().optional().describe("Whether the tax is included in the prices"),
});

const bankSchema = z.object({
  bankName: z.string().optional(),
  bankAddress: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
});

/** Raw shape passed to the MCP tool registration (the create_invoice arguments). */
export const createInvoiceShape = {
  business: partySchema.describe("Your business — the sender / payee"),
  client: partySchema.describe("The client being billed"),
  items: z.array(itemSchema).min(1).describe("Line items (at least one)"),
  currency: z.string().optional().describe('ISO currency code, e.g. "USD", "EUR", "GBP". Default "USD"'),
  invoiceNumber: z.string().optional().describe('Default "INV-001"'),
  invoiceDate: z.string().optional().describe("YYYY-MM-DD. Default: today"),
  paymentTerms: z.string().optional().describe('e.g. "Net 30", "Due on receipt". Default "Net 30"'),
  dueDate: z.string().optional().describe("YYYY-MM-DD. Default: derived from payment terms"),
  taxes: z.array(taxSchema).optional().describe("Tax lines. Omit for a tax-free invoice"),
  discountRate: z.union([z.number(), z.string()]).optional().describe("Invoice-wide discount in percent"),
  notes: z.string().optional().describe("Footer notes / payment instructions"),
  documentTitle: z.string().optional().describe('Document title, e.g. "Invoice", "Proforma Invoice"'),
  color: z.string().optional().describe("Accent colour as a hex code. Default #3b82f6"),
  bank: bankSchema.optional().describe("Bank / payment details"),
};

export const createInvoiceSchema = z.object(createInvoiceShape);
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
