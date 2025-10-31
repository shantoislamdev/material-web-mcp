---
name: Bug report
about: Create a report to help us improve Material Web MCP
title: "[BUG] "
labels: ["bug", "needs-triage"]
assignees: ""
---

## Bug Description

A clear and concise description of what the bug is.

## Environment

- **Node.js Version:** [e.g. 20.x]
- **Operating System:** [e.g. iOS]
- **Package Version:** [e.g. 0.1.0]
- **MCP Client:** [e.g. Claude Desktop, Cursor, etc.]

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

A clear and concise description of what actually happened.

## Code Snippets

If applicable, add code snippets to help explain your problem.

```bash
# Add any relevant command or configuration here
```

## Additional Context

Add any other context about the problem here.

## MCP Server Configuration

Please share your MCP server configuration:

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

## Error Messages

If applicable, please include any error messages from:

1. **MCP Client Logs:** [Paste here]
2. **Console Output:** [Paste here]
3. **Network Logs:** [Paste here]

---

**Checklist:**

- [ ] I have searched for existing issues that describe this bug
- [ ] I have provided detailed reproduction steps
- [ ] I have included relevant error messages and logs
- [ ] I am using the latest version of the package
- [ ] I have tested with different MCP clients if applicable
