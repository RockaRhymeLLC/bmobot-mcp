#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = process.env.BMOBOT_API_BASE || "https://{service}.bmobot.ai";

function serviceUrl(service: string, path: string): string {
  return BASE.replace("{service}", service) + path;
}

async function post(service: string, path: string, body: unknown): Promise<unknown> {
  const url = serviceUrl(service, path);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function get(service: string, path: string, params?: Record<string, string | number | undefined>): Promise<unknown> {
  let url = serviceUrl(service, path);
  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) qs.set(k, String(v));
    }
    const str = qs.toString();
    if (str) url += (url.includes("?") ? "&" : "?") + str;
  }
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

function text(data: unknown): { content: Array<{ type: "text"; text: string }> } {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

// --- Create server ---

const server = new McpServer({
  name: "bmobot",
  version: "1.0.0",
});

// ============================================================
// HASH & ENCODE
// ============================================================

server.tool(
  "hash",
  "Hash text using MD5, SHA-1, SHA-256, SHA-512, or other algorithms",
  {
    text: z.string().describe("Text to hash"),
    algorithm: z.enum(["md5", "sha1", "sha256", "sha384", "sha512"]).default("sha256").describe("Hash algorithm"),
  },
  async ({ text: input, algorithm }) => {
    const data = await post("hash", "/hash", { text: input, algorithm });
    return text(data);
  }
);

server.tool(
  "hmac",
  "Generate HMAC signature for text with a secret key",
  {
    text: z.string().describe("Text to sign"),
    secret: z.string().describe("Secret key"),
    algorithm: z.enum(["sha256", "sha384", "sha512"]).default("sha256"),
  },
  async ({ text: input, secret, algorithm }) => {
    const data = await post("hash", "/hmac", { text: input, secret, algorithm });
    return text(data);
  }
);

server.tool(
  "encode",
  "Encode/decode text: base64, URL, hex, HTML entity encoding",
  {
    text: z.string().describe("Text to encode/decode"),
    format: z.enum(["base64", "url", "hex", "html"]).describe("Encoding format"),
    decode: z.boolean().default(false).describe("Decode instead of encode"),
  },
  async ({ text: input, format, decode }) => {
    const data = await post("hash", decode ? "/decode" : "/encode", { text: input, format });
    return text(data);
  }
);

// ============================================================
// TEXT TOOLS
// ============================================================

server.tool(
  "convert_case",
  "Convert text between camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, Title Case, and more",
  {
    text: z.string().describe("Text to convert"),
    to: z.enum(["camel", "snake", "kebab", "pascal", "constant", "title", "sentence", "upper", "lower", "dot", "path"]).describe("Target case format"),
  },
  async ({ text: input, to }) => {
    const data = await post("text", "/case", { text: input, to });
    return text(data);
  }
);

server.tool(
  "slugify",
  "Convert text to a URL-safe slug",
  {
    text: z.string().describe("Text to slugify"),
  },
  async ({ text: input }) => {
    const data = await post("text", "/slug", { text: input });
    return text(data);
  }
);

server.tool(
  "count_words",
  "Count words, characters, sentences, and estimate reading time",
  {
    text: z.string().describe("Text to analyze"),
  },
  async ({ text: input }) => {
    const data = await post("text", "/count", { text: input });
    return text(data);
  }
);

server.tool(
  "extract_from_text",
  "Extract emails, URLs, numbers, hashtags, mentions, or phone numbers from text",
  {
    text: z.string().describe("Text to extract from"),
    type: z.enum(["emails", "urls", "numbers", "hashtags", "mentions", "phones"]).default("emails").describe("What to extract"),
  },
  async ({ text: input, type }) => {
    const data = await post("text", "/extract", { text: input, type });
    return text(data);
  }
);

// ============================================================
// JSON TOOLS
// ============================================================

server.tool(
  "format_json",
  "Format, validate, and pretty-print JSON",
  {
    json: z.string().describe("JSON string to format"),
    indent: z.number().default(2).describe("Indentation spaces"),
  },
  async ({ json, indent }) => {
    const data = await post("json", "/format", { json, indent });
    return text(data);
  }
);

server.tool(
  "json_diff",
  "Compare two JSON objects and show differences",
  {
    a: z.string().describe("First JSON string"),
    b: z.string().describe("Second JSON string"),
  },
  async ({ a, b }) => {
    const data = await post("json", "/diff", { a, b });
    return text(data);
  }
);

server.tool(
  "json_query",
  "Query JSON with dot-notation path (e.g. 'users.0.name')",
  {
    json: z.string().describe("JSON string to query"),
    path: z.string().describe("Dot-notation path (e.g. 'users.0.name')"),
  },
  async ({ json, path }) => {
    const data = await post("json", "/query", { json, path });
    return text(data);
  }
);

// ============================================================
// REGEX TOOLS
// ============================================================

server.tool(
  "test_regex",
  "Test a regular expression against text and see matches",
  {
    pattern: z.string().describe("Regex pattern (without delimiters)"),
    text: z.string().describe("Text to test against"),
    flags: z.string().default("g").describe("Regex flags (g, i, m, etc.)"),
  },
  async ({ pattern, text: input, flags }) => {
    const data = await post("regex", "/test", { pattern, text: input, flags });
    return text(data);
  }
);

server.tool(
  "explain_regex",
  "Explain a regular expression in plain English",
  {
    pattern: z.string().describe("Regex pattern to explain"),
  },
  async ({ pattern }) => {
    const data = await post("regex", "/explain", { pattern });
    return text(data);
  }
);

// ============================================================
// SQL TOOLS
// ============================================================

server.tool(
  "format_sql",
  "Format and pretty-print SQL queries",
  {
    sql: z.string().describe("SQL query to format"),
    dialect: z.enum(["mysql", "postgresql", "sqlite"]).default("postgresql").describe("SQL dialect"),
    indent: z.number().default(2),
  },
  async ({ sql, dialect, indent }) => {
    const data = await post("sql", "/format", { sql, dialect, indent });
    return text(data);
  }
);

server.tool(
  "analyze_sql",
  "Extract tables, columns, JOINs, and structure from a SQL query",
  {
    sql: z.string().describe("SQL query to analyze"),
  },
  async ({ sql }) => {
    const data = await post("sql", "/extract", { sql });
    return text(data);
  }
);

// ============================================================
// CRON TOOLS
// ============================================================

server.tool(
  "parse_cron",
  "Parse a cron expression into human-readable description and compute next run times",
  {
    expression: z.string().describe("Cron expression (e.g. '0 8 * * 1-5')"),
    count: z.number().default(5).describe("Number of next run times to compute"),
  },
  async ({ expression, count }) => {
    const data = await post("cron", "/parse", { expression, count });
    return text(data);
  }
);

// ============================================================
// JWT TOOLS
// ============================================================

server.tool(
  "decode_jwt",
  "Decode a JWT token to see its header, payload, and expiration",
  {
    token: z.string().describe("JWT token to decode"),
  },
  async ({ token }) => {
    const data = await post("jwt", "/decode", { token });
    return text(data);
  }
);

// ============================================================
// SEMVER TOOLS
// ============================================================

server.tool(
  "parse_semver",
  "Parse, compare, or check if a version satisfies a range (npm-style ^, ~, >=, etc.)",
  {
    version: z.string().describe("Semver version string"),
    range: z.string().optional().describe("Optional range to check against (e.g. '^1.2.0')"),
  },
  async ({ version, range }) => {
    if (range) {
      const data = await post("semver", "/satisfies", { version, range });
      return text(data);
    }
    const data = await post("semver", "/parse", { version });
    return text(data);
  }
);

// ============================================================
// HTTP STATUS
// ============================================================

server.tool(
  "http_status",
  "Look up HTTP status code meaning, category, and usage guidance",
  {
    code: z.number().describe("HTTP status code (e.g. 404, 502)"),
  },
  async ({ code }) => {
    const data = await get("status", `/status/${code}`);
    return text(data);
  }
);

// ============================================================
// DIFF TOOLS
// ============================================================

server.tool(
  "diff_text",
  "Compare two texts and show a unified diff",
  {
    a: z.string().describe("Original text"),
    b: z.string().describe("Modified text"),
  },
  async ({ a, b }) => {
    const data = await post("diff", "/diff", { a, b });
    return text(data);
  }
);

// ============================================================
// DATA FORMAT CONVERSION
// ============================================================

server.tool(
  "csv_to_json",
  "Convert CSV data to JSON array",
  {
    csv: z.string().describe("CSV text with headers"),
  },
  async ({ csv }) => {
    const data = await post("csv", "/to-json", { csv });
    return text(data);
  }
);

server.tool(
  "yaml_to_json",
  "Convert YAML to JSON",
  {
    yaml: z.string().describe("YAML text"),
  },
  async ({ yaml }) => {
    const data = await post("yaml", "/yaml/to-json", { yaml });
    return text(data);
  }
);

server.tool(
  "json_to_yaml",
  "Convert JSON to YAML",
  {
    json: z.string().describe("JSON string"),
  },
  async ({ json }) => {
    const data = await post("yaml", "/json/to-yaml", { json });
    return text(data);
  }
);

// ============================================================
// GENERATORS
// ============================================================

server.tool(
  "generate_uuid",
  "Generate UUID (v4 or v7) or ULID identifiers",
  {
    version: z.enum(["4", "7"]).default("4").describe("UUID version"),
    count: z.number().min(1).max(100).default(1).describe("How many to generate"),
  },
  async ({ version, count }) => {
    const data = await post("uuid", "/generate", { version, count });
    return text(data);
  }
);

server.tool(
  "generate_password",
  "Generate secure random passwords or passphrases",
  {
    type: z.enum(["password", "passphrase", "pin"]).default("password"),
    length: z.number().default(16).describe("Length for password/PIN, or word count for passphrase"),
  },
  async ({ type, length }) => {
    const data = await get("password", `/${type}`, { length });
    return text(data);
  }
);

server.tool(
  "generate_lorem",
  "Generate lorem ipsum placeholder text",
  {
    type: z.enum(["paragraphs", "sentences", "words"]).default("paragraphs"),
    count: z.number().min(1).max(50).default(3),
  },
  async ({ type, count }) => {
    const data = await get("lorem", `/${type}`, { count });
    return text(data);
  }
);

server.tool(
  "generate_fake_data",
  "Generate realistic fake data for testing — people, addresses, companies, etc.",
  {
    type: z.enum(["person", "address", "company", "text", "internet", "finance"]).describe("Data category"),
    count: z.number().min(1).max(50).default(1),
    seed: z.number().optional().describe("Seed for reproducible results"),
  },
  async ({ type, count, seed }) => {
    const body: Record<string, unknown> = { count };
    if (seed !== undefined) body.seed = seed;
    const data = await post("faker", `/${type}`, body);
    return text(data);
  }
);

// ============================================================
// QR CODE
// ============================================================

server.tool(
  "generate_qr",
  "Generate a QR code from text or URL (returns base64 PNG or SVG)",
  {
    text: z.string().describe("Text or URL to encode"),
    format: z.enum(["base64", "svg", "terminal"]).default("base64").describe("Output format"),
    size: z.number().min(100).max(1000).default(300).describe("Image size in pixels"),
  },
  async ({ text: input, format, size }) => {
    const data = await post("qr", "/generate", { text: input, format, size });
    return text(data);
  }
);

// ============================================================
// EMAIL VALIDATION
// ============================================================

server.tool(
  "validate_email",
  "Validate an email address — syntax, MX records, disposable detection, typo suggestions",
  {
    email: z.string().describe("Email address to validate"),
  },
  async ({ email }) => {
    const data = await post("email", "/validate", { email });
    return text(data);
  }
);

// ============================================================
// COLOR TOOLS
// ============================================================

server.tool(
  "color_palette",
  "Generate color palettes — complementary, analogous, triadic, split-complementary, and more",
  {
    color: z.string().describe("Base color (hex like #FF5733, or CSS name like 'red')"),
    type: z.enum(["complementary", "analogous", "triadic", "split-complementary", "tetradic", "monochromatic", "shades"]).default("analogous"),
  },
  async ({ color, type }) => {
    const data = await post("color", "/palette", { color, type });
    return text(data);
  }
);

server.tool(
  "check_contrast",
  "Check WCAG color contrast ratio between foreground and background colors",
  {
    foreground: z.string().describe("Foreground color (hex)"),
    background: z.string().describe("Background color (hex)"),
  },
  async ({ foreground, background }) => {
    const data = await post("color", "/contrast", { foreground, background });
    return text(data);
  }
);

// ============================================================
// GLOB TOOLS
// ============================================================

server.tool(
  "test_glob",
  "Test if a file path matches a glob pattern (supports *, **, ?, character classes, brace expansion)",
  {
    pattern: z.string().describe("Glob pattern (e.g. 'src/**/*.ts')"),
    path: z.string().describe("File path to test"),
  },
  async ({ pattern, path }) => {
    const data = await post("glob", "/test", { pattern, path });
    return text(data);
  }
);

// ============================================================
// DATETIME
// ============================================================

server.tool(
  "datetime_now",
  "Get current time in any timezone with various format options",
  {
    timezone: z.string().default("UTC").describe("Timezone (e.g. 'America/New_York', 'UTC')"),
  },
  async ({ timezone }) => {
    const data = await get("time", "/now", { timezone });
    return text(data);
  }
);

server.tool(
  "datetime_diff",
  "Calculate the difference between two dates/times",
  {
    from: z.string().describe("Start date (ISO 8601 or common formats)"),
    to: z.string().describe("End date (ISO 8601 or common formats)"),
  },
  async ({ from, to }) => {
    const data = await post("time", "/diff", { from, to });
    return text(data);
  }
);

// ============================================================
// IP TOOLS
// ============================================================

server.tool(
  "validate_ip",
  "Validate an IP address and identify version (IPv4/IPv6), type, and range",
  {
    ip: z.string().describe("IP address to validate"),
  },
  async ({ ip }) => {
    const data = await post("ip", "/validate", { ip });
    return text(data);
  }
);

server.tool(
  "calculate_cidr",
  "Calculate network details from CIDR notation — range, broadcast, host count",
  {
    cidr: z.string().describe("CIDR notation (e.g. '192.168.1.0/24')"),
  },
  async ({ cidr }) => {
    const data = await post("ip", "/cidr", { cidr });
    return text(data);
  }
);

// ============================================================
// MARKDOWN TOOLS
// ============================================================

server.tool(
  "markdown_to_html",
  "Convert Markdown to HTML",
  {
    markdown: z.string().describe("Markdown text"),
  },
  async ({ markdown }) => {
    const data = await post("md", "/to-html", { markdown });
    return text(data);
  }
);

server.tool(
  "extract_markdown_toc",
  "Extract table of contents from a Markdown document",
  {
    markdown: z.string().describe("Markdown text"),
  },
  async ({ markdown }) => {
    const data = await post("md", "/toc", { markdown });
    return text(data);
  }
);

// --- Connect and start ---

const transport = new StdioServerTransport();
await server.connect(transport);
