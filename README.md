# Material Web MCP Server

[![npm version](https://img.shields.io/npm/v/material-web-mcp.svg)](https://www.npmjs.com/package/material-web-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![CI Status](https://img.shields.io/github/actions/workflow/status/shantoislamdev/material-web-mcp/ci.yml?branch=main&label=CI)](https://github.com/shantoislamdev/material-web-mcp/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/shantoislamdev/material-web-mcp/graph/badge.svg?token=G2ZUHV6R4C)](https://codecov.io/gh/shantoislamdev/material-web-mcp)
[![GitHub issues](https://img.shields.io/github/issues/shantoislamdev/material-web-mcp)](https://github.com/shantoislamdev/material-web-mcp/issues)

An MCP server providing programmatic access to Material Web documentation for AI agents (Claude, Cursor, Cline, Copilot, etc.).

**Requirements:** Node.js >= 18.0.0

## Quick Start

Connect to AI agents using npx (no installation required):

```json
{
  "mcpServers": {
    "material-web": {
      "command": "npx",
      "args": ["-y", "material-web-mcp"]
    }
  }
}
```

## Tools Overview

- **list_components**: Returns JSON array of available Material Web components.
- **search_docs**: Searches documentation for keywords (input: keyword string), returns matching paths with excerpts.
- **health_check**: Verifies server uptime and documentation accessibility.
- **get_component_doc**: Fetches full documentation for a specific component (input: component name).
- **get_theming_docs**: Returns theming documentation for Material Web.
- **get_installation_docs**: Returns installation and quick-start documentation.
- **generate_template**: Generates basic HTML templates with Material Web components based on prompts (input: prompt string).
- **validate_website**: Validates HTML code for correct Material Web component usage (input: HTML string).

## Links

- [ Contributing Guide](CONTRIBUTING.md) - How to contribute
- [ Changelog](CHANGELOG.md) - Version history

## Development

### Quick Setup

```bash
git clone https://github.com/shantoislamdev/material-web-mcp.git
cd material-web-mcp
npm install
npm test
npm start
```

[MIT License](LICENSE)
