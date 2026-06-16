#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createInvoiceShape, type CreateInvoiceInput } from "./schema.js";
import { buildInvoiceData, encodeDeepLink, MAX_ENCODED_LENGTH, APP_URL } from "./invoice.js";
import { templates } from "./templates-data.js";

const server = new McpServer({
  name: "blank-invoice-maker",
  version: "1.0.0",
});

server.registerTool(
  "list_templates",
  {
    title: "List invoice templates",
    description:
      "List the industry-specific invoice templates available on Blank Invoice Maker (https://blankinvoicemaker.com). Returns each template's slug, name, description, and page URL. Use this to discover templates; build a custom invoice with create_invoice.",
    inputSchema: {},
  },
  async () => {
    const list = templates.map((t) => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
      url: `${APP_URL}/templates/${t.slug}`,
    }));
    return { content: [{ type: "text", text: JSON.stringify(list, null, 2) }] };
  },
);

server.registerTool(
  "create_invoice",
  {
    title: "Create an invoice",
    description:
      "Create a professional invoice and return a link that opens it — fully pre-filled — in the free Blank Invoice Maker editor (https://blankinvoicemaker.com). No signup, no watermark. The user opens the link to review and download the PDF; all invoice data stays in their browser (it travels in the link's URL fragment and is never sent to a server).",
    inputSchema: createInvoiceShape,
  },
  async (input: CreateInvoiceInput) => {
    const data = buildInvoiceData(input);
    const { url, length } = encodeDeepLink(data);

    if (length > MAX_ENCODED_LENGTH) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `This invoice is too large to encode into a link (${length} characters, maximum ${MAX_ENCODED_LENGTH}). Reduce the number of line items or shorten long text fields and try again.`,
          },
        ],
      };
    }

    const itemCount = data.items.length;
    const client = data.customer.name || "your client";
    const text =
      `Invoice ready for ${client} — ${itemCount} line item${itemCount === 1 ? "" : "s"}, ` +
      `${data.currency}, ${data.info.paymentTerms}.\n\n` +
      `Open this link to review and download the PDF (free, no signup, no watermark):\n${url}`;

    return { content: [{ type: "text", text }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
