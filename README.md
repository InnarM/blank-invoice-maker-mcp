# Blank Invoice Maker — MCP Server

An [MCP](https://modelcontextprotocol.io) server that lets any AI assistant (Claude, and other MCP clients) create invoices with **[Blank Invoice Maker](https://blankinvoicemaker.com)** — the free, no-signup, no-watermark invoice generator.

Ask your assistant to make an invoice, and it returns a link that opens **[blankinvoicemaker.com](https://blankinvoicemaker.com)** with the invoice fully pre-filled, ready to review and download as a PDF.

> **Privacy by design.** The invoice data travels inside the link's URL fragment (`#invoice=…`) and is decoded entirely in your browser. Nothing is uploaded — consistent with Blank Invoice Maker's no-account, no-server-storage model.

## Tools

| Tool | What it does |
| --- | --- |
| `list_templates` | Lists the industry invoice templates available at [blankinvoicemaker.com/templates](https://blankinvoicemaker.com/templates) (slug, name, description, URL). |
| `create_invoice` | Builds an invoice from your details and returns a pre-filled [blankinvoicemaker.com](https://blankinvoicemaker.com) link to review and download. |

### `create_invoice` example

> *"Invoice Globex LLC for 10 hours of design at $90/hr and one $120 hosting setup, net 14, in GBP."*

The assistant calls `create_invoice` with:

```json
{
  "business": { "name": "Acme Studio", "email": "hi@acme.studio" },
  "client": { "name": "Globex LLC", "email": "ap@globex.com" },
  "items": [
    { "description": "Design work", "quantity": 10, "unitPrice": 90, "unit": "hours" },
    { "description": "Hosting setup", "quantity": 1, "unitPrice": 120 }
  ],
  "currency": "GBP",
  "paymentTerms": "Net 14"
}
```

…and returns a `https://blankinvoicemaker.com/#invoice=…` link that opens the editor pre-filled.

## Installation

Requires Node.js 18+.

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "blank-invoice-maker": {
      "command": "npx",
      "args": ["-y", "blank-invoice-maker-mcp"]
    }
  }
}
```

### Other MCP clients

Run the server over stdio:

```bash
npx -y blank-invoice-maker-mcp
```

## How it works

`create_invoice` maps your input into the invoice structure used by [blankinvoicemaker.com](https://blankinvoicemaker.com), compresses it with [`lz-string`](https://github.com/pieroxy/lz-string), and appends it to the site URL as a `#invoice=` fragment. Opening the link hydrates the editor in your browser — no signup, no watermark, no data leaving your machine.

## Development

```bash
npm install
npm run build       # compile TypeScript to dist/
npm test            # build + run the unit tests
npm start           # run the server over stdio
```

### Keeping templates in sync

`src/templates-data.ts` is generated from the Blank Invoice Maker template registry:

```bash
BIM_APP_DIR=/path/to/blank-invoice-maker npm run generate:templates
```

## Links

- **App:** https://blankinvoicemaker.com
- **Templates:** https://blankinvoicemaker.com/templates
- **Model Context Protocol:** https://modelcontextprotocol.io

## License

[MIT](./LICENSE) © [Blank Invoice Maker](https://blankinvoicemaker.com)
