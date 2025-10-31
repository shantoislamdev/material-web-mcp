---
name: Pull Request
about: Create a pull request to contribute to Material Web MCP
title: "[PR] "
labels: ["needs-review"]
assignees: ""
---

## Description

Please include a summary of the changes and the related issue. Include relevant motivation and context.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Test coverage improvement

## Related Issues

Closes #(issue_number)
Fixes #(issue_number)

## Changes Made

### Files Changed

- [ ] Core functionality changes
- [ ] Documentation updates
- [ ] Test additions/updates
- [ ] Configuration changes
- [ ] Dependencies updates

### Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Performance testing (if applicable)

### Documentation

- [ ] README updated
- [ ] API documentation updated
- [ ] Examples updated
- [ ] CHANGELOG updated

## Checklist

### Pre-submission

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

### For MCP Specific Changes

- [ ] MCP protocol compliance verified
- [ ] Tool definitions updated correctly
- [ ] Schema validation passes
- [ ] Error handling implemented properly
- [ ] Performance impact assessed

### For Documentation Changes

- [ ] Markdown syntax is correct
- [ ] Links are working
- [ ] Examples are tested and working
- [ ] Screenshots/images are updated if needed

## Testing Instructions

### Automated Testing

```bash
npm install
npm test
npm run lint
npm run coverage
```

### Manual Testing

1. Test with Claude Desktop
2. Test with other MCP clients
3. Test all tool functions individually
4. Test error scenarios

### MCP Client Configuration

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

## Breaking Changes

If this PR introduces breaking changes, please describe:

- What changes are breaking
- Why these changes are necessary
- How users should migrate their code
- What alternative approaches were considered

## Additional Notes

Add any other notes about the PR here.

### Performance Impact

- [ ] No performance impact
- [ ] Performance improved (describe how)
- [ ] Performance degraded (describe impact and mitigation)

### Security Considerations

- [ ] No security implications
- [ ] Security considerations addressed (describe)

### Backward Compatibility

- [ ] Fully backward compatible
- [ ] Backward compatible with deprecation warnings
- [ ] Breaking change (explain migration path)

---

## Reviewer Guidelines

### Code Review Checklist

- [ ] Code is well-documented and follows project conventions
- [ ] Tests cover the changes adequately
- [ ] No obvious security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling is appropriate
- [ ] Logging is sufficient for debugging

### Functional Review Checklist

- [ ] Feature works as described
- [ ] Edge cases are handled
- [ ] Integration with existing features works correctly
- [ ] Documentation is accurate and complete

### Security Review Checklist

- [ ] Input validation is implemented
- [ ] No sensitive data is exposed
- [ ] Proper authentication/authorization
- [ ] No injection vulnerabilities
- [ ] Secure defaults are used
