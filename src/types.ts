/**
 * InvoiceData — mirrors the shape consumed by blankinvoicemaker.com's
 * deep-link hydration (validated there with zod). Kept in sync manually;
 * see README "Keeping in sync".
 */

export interface Address {
  name: string;
  addressLine: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  contactName?: string;
  email?: string;
  taxId?: string;
  taxIdLabel?: string;
  registrationNumber?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: string | number;
  unit: string;
  unitPrice: string | number;
  discount: string | number;
}

export interface InvoiceInfo {
  invoiceNumber: string;
  invoiceDate: string;
  paymentTerms: string;
  dueDate: string;
  autoDue?: boolean;
}

export interface BankDetails {
  bankName: string;
  bankAddress: string;
  iban: string;
  swift: string;
}

export interface TaxEntry {
  id: string;
  label: string;
  rate: string | number;
  type: "percentage";
  isInclusive: boolean;
}

export interface InvoiceLabels {
  documentTitle?: string;
  invoiceNumber?: string;
  taxId?: string;
  registrationNumber?: string;
}

export interface InvoiceData {
  invoicer: Address;
  customer: Address;
  info: InvoiceInfo;
  logoBase64?: string;
  items: InvoiceItem[];
  taxes: TaxEntry[];
  currency: string;
  discountRate: string | number;
  bank: BankDetails;
  notes?: string;
  labels?: InvoiceLabels;
  color: string;
}
