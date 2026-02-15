# bmobot-mcp

MCP server providing 37 developer tools — hash, encode, regex, JSON, SQL, cron, QR codes, UUID, JWT, and more. All tools are powered by [bmobot.ai](https://bmobot.ai) APIs.

Works with **Claude Desktop**, **Claude Code**, and any MCP-compatible client.

## Quick Start

### Claude Code

```bash
claude mcp add bmobot-mcp -- npx -y bmobot-mcp
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bmobot": {
      "command": "npx",
      "args": ["-y", "bmobot-mcp"]
    }
  }
}
```

## Tools (37)

### Hash & Encode
| Tool | Description |
|------|-------------|
| `hash` | Hash text with MD5, SHA-1, SHA-256, SHA-384, SHA-512 |
| `hmac` | Generate HMAC signatures with a secret key |
| `encode` | Base64, URL, hex, HTML entity encode/decode |

### Text
| Tool | Description |
|------|-------------|
| `convert_case` | camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, Title Case, and more |
| `slugify` | Convert text to URL-safe slugs |
| `count_words` | Word/char/sentence count with reading time estimate |
| `extract_from_text` | Extract emails, URLs, numbers, hashtags, mentions, phones |

### JSON
| Tool | Description |
|------|-------------|
| `format_json` | Format, validate, and pretty-print JSON |
| `json_diff` | Compare two JSON objects and show differences |
| `json_query` | Query JSON with dot-notation paths |

### Code & Dev
| Tool | Description |
|------|-------------|
| `test_regex` | Test regex patterns against text |
| `explain_regex` | Explain regex in plain English |
| `format_sql` | Format SQL queries (MySQL, PostgreSQL, SQLite) |
| `analyze_sql` | Extract tables, columns, JOINs from SQL |
| `parse_cron` | Parse cron expressions with next run times |
| `decode_jwt` | Decode JWT tokens (header, payload, expiration) |
| `parse_semver` | Parse versions and check range satisfaction |
| `http_status` | Look up HTTP status code meanings |
| `diff_text` | Unified diff between two texts |
| `test_glob` | Test glob pattern matching |

### Data Formats
| Tool | Description |
|------|-------------|
| `csv_to_json` | Convert CSV to JSON |
| `yaml_to_json` | Convert YAML to JSON |
| `json_to_yaml` | Convert JSON to YAML |
| `markdown_to_html` | Convert Markdown to HTML |
| `extract_markdown_toc` | Extract table of contents from Markdown |

### Generators
| Tool | Description |
|------|-------------|
| `generate_uuid` | UUID v4, v7, or ULID |
| `generate_password` | Secure passwords, passphrases, PINs |
| `generate_lorem` | Lorem ipsum placeholder text |
| `generate_fake_data` | Realistic test data (people, addresses, companies, finance) |
| `generate_qr` | QR codes as base64 PNG, SVG, or terminal art |

### Validation & Analysis
| Tool | Description |
|------|-------------|
| `validate_email` | Email validation with MX lookup, disposable detection, typo suggestions |
| `validate_ip` | IP address validation (v4/v6), type identification |
| `calculate_cidr` | Network calculations from CIDR notation |
| `color_palette` | Generate color palettes (complementary, analogous, triadic, etc.) |
| `check_contrast` | WCAG color contrast ratio checker |

### Date & Time
| Tool | Description |
|------|-------------|
| `datetime_now` | Current time in any timezone |
| `datetime_diff` | Calculate difference between two dates |

## Examples

Once installed, just ask Claude naturally:

- "Hash this API key with SHA-256"
- "Explain this regex: `^(?=.*[A-Z])(?=.*\d).{8,}$`"
- "Parse this cron: `0 */6 * * 1-5`"
- "Generate 5 UUIDs"
- "Check if #333 on #fff passes WCAG contrast"
- "Format this SQL query"
- "Convert this YAML to JSON"
- "Validate this email address"

## Configuration

By default, tools call the hosted APIs at `*.bmobot.ai`. To use a custom API base:

```bash
# Claude Code
claude mcp add bmobot-mcp \
  --env BMOBOT_API_BASE=https://{service}.your-domain.com \
  -- npx -y bmobot-mcp

# Claude Desktop
{
  "mcpServers": {
    "bmobot": {
      "command": "npx",
      "args": ["-y", "bmobot-mcp"],
      "env": {
        "BMOBOT_API_BASE": "https://{service}.your-domain.com"
      }
    }
  }
}
```

The `{service}` placeholder is replaced with the service name (e.g., `hash`, `json`, `cron`).

## Requirements

- Node.js 18+
- No API key required — all tools are free to use

## License

MIT
