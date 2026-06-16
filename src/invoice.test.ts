import { test } from "node:test";
import assert from "node:assert/strict";
import lzString from "lz-string";
import { buildInvoiceData, encodeDeepLink, INVOICE_HASH_PREFIX, APP_URL } from "./invoice.js";
import type { CreateInvoiceInput } from "./schema.js";

const { decompressFromEncodedURIComponent } = lzString;

const sample: CreateInvoiceInput = {
  business: { name: "Acme Studio", email: "hi@acme.test" },
  client: { name: "Globex LLC", email: "ap@globex.test" },
  items: [
    { description: "Design work", quantity: 10, unitPrice: 90, unit: "hours" },
    { description: "Hosting", quantity: 1, unitPrice: 120 },
  ],
  currency: "GBP",
  paymentTerms: "Net 14",
};

test("buildInvoiceData fills required fields and defaults", () => {
  const inv = buildInvoiceData(sample);
  assert.equal(inv.invoicer.name, "Acme Studio");
  assert.equal(inv.customer.name, "Globex LLC");
  assert.equal(inv.currency, "GBP");
  assert.equal(inv.items.length, 2);
  assert.ok(inv.items[0].id, "items get generated ids");
  assert.notEqual(inv.items[0].id, inv.items[1].id, "ids are unique");
  assert.equal(inv.items[1].unit, "unit", "missing unit defaults to 'unit'");
  assert.equal(inv.info.paymentTerms, "Net 14");
  assert.match(inv.info.dueDate, /^\d{4}-\d{2}-\d{2}$/, "due date derived from terms");
  assert.equal(inv.labels?.documentTitle, "Invoice");
  assert.equal(inv.color, "#3b82f6");
  assert.deepEqual(inv.taxes, [], "no taxes by default");
});

test("encodeDeepLink round-trips through lz-string", () => {
  const inv = buildInvoiceData(sample);
  const { url, length } = encodeDeepLink(inv);
  const prefix = `${APP_URL}/${INVOICE_HASH_PREFIX}`;
  assert.ok(url.startsWith(prefix), "url has the invoice deep-link prefix");
  assert.ok(length > 0 && length < 2000, "typical invoice stays small");

  const payload = url.slice(prefix.length);
  const json = decompressFromEncodedURIComponent(payload);
  const back = JSON.parse(json);
  assert.equal(back.customer.name, "Globex LLC");
  assert.equal(back.items[0].name, "Design work");
  assert.equal(back.items[1].unit, "unit");
  assert.equal(back.currency, "GBP");
});

test("taxes and bank details map through when provided", () => {
  const inv = buildInvoiceData({
    ...sample,
    taxes: [{ label: "VAT", rate: 20, isInclusive: false }],
    bank: { iban: "GB00 0000 0000", swift: "ABCDGB2L" },
  });
  assert.equal(inv.taxes.length, 1);
  assert.equal(inv.taxes[0].label, "VAT");
  assert.equal(inv.taxes[0].type, "percentage");
  assert.ok(inv.taxes[0].id);
  assert.equal(inv.bank.iban, "GB00 0000 0000");
});
