# Contributing to Material Web MCP

Thank you for your interest in contributing to Material Web MCP! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/material-web-mcp.git
   cd material-web-mcp
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run Tests**

   ```bash
   npm test
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/`: Feature branches (e.g., `feature/add-new-tool`)
- `fix/`: Bug fix branches (e.g., `fix/handle-error-cases`)
- `release/`: Release preparation branches

### Making Changes

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**

   - Follow coding standards (see below)
   - Write/update tests
   - Update documentation

3. **Test Your Changes**

   ```bash
   npm test
   npm run lint
   npm run coverage
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new MCP tool for component validation"
   ```

## Coding Standards

### Code Style

- **ESLint**: Follow the project's ESLint configuration
- **Formatting**: Use Prettier (configured in the project)
- **Line Length**: Maximum 80 characters
- **Indentation**: 2 spaces

### JavaScript/Node.js Guidelines

- Use ES modules (`import`/`export`)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Handle errors gracefully
- Use async/await over callbacks

### MCP Protocol Compliance

- Follow [MCP specification](https://modelcontextprotocol.io/specification)
- Implement proper tool definitions
- Use Zod for input validation
- Handle errors with appropriate error codes
- Log appropriately for debugging

### Example Code Structure

```javascript
/**
 * Description of what this tool does
 * @param {Object} params - Parameters for the tool
 * @param {string} params.input - Input description
 * @returns {Promise<Object>} Result object
 */
export async function myTool({ input }) {
  try {
    // Implementation
    const result = await processInput(input);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
}
```

## Testing

### Test Structure

- Unit tests in `src/*.test.mjs`
- Integration tests for MCP protocol compliance
- End-to-end tests for complete workflows

### Writing Tests

```javascript
import { myTool } from "../server.js";

describe("myTool", () => {
  test("should process input correctly", async () => {
    const result = await myTool({ input: "test data" });
    expect(result.content).toBeDefined();
    // More assertions...
  });
});
```

### Test Commands

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm run coverage      # Generate coverage report
```

## Documentation

### API Documentation

- Document all MCP tools with JSDoc
- Include parameter types and descriptions
- Provide usage examples
- Update README.md for significant changes

### User Documentation

- Update documentation in `ui-docs/` directory
- Follow markdown syntax guidelines
- Include code examples
- Test documentation links

### Example Documentation

````markdown
# Tool Name

Brief description of what this tool does.

## Parameters

- `param1` (string): Description of param1
- `param2` (number, optional): Description of param2

## Returns

Object containing the tool results.

## Example

```json
{
  "result": "example output"
}
```
````

```

## Submitting Changes

### Pull Request Process

1. **Before Submitting**
   - [ ] Code follows style guidelines
   - [ ] Tests pass locally
   - [ ] Documentation is updated
   - [ ] Commit messages follow conventions

2. **Creating PR**
   - Fill out the PR template completely
   - Link related issues
   - Include screenshots for UI changes
   - Request review from maintainers

3. **PR Review**
   - Address feedback promptly
   - Keep PR updated with main branch
   - Ensure all CI checks pass

### Commit Message Convention

We use [Conventional Commits](https://conventionalcommits.org/):

```

type(scope): subject

body (optional)

footer (optional)

````

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
feat(mcp): add component validation tool
fix(server): handle missing parameters gracefully
docs(readme): update installation instructions
````

## Release Process

### Version Management

We use [Semantic Versioning](https://semver.org/):

- **Major** (X.0.0): Breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.0.1): Bug fixes, backward compatible

### Release Workflow

1. **Prepare Release**

   ```bash
   # Update version in package.json
   npm version 1.0.0

   # Update CHANGELOG.md
   # Update documentation
   ```

2. **Create Release PR**

   - Update version numbers
   - Update changelog
   - Update documentation
   - Include release notes

3. **Merge and Tag**

   ```bash
   git tag v1.0.0
   git push origin main --tags
   ```

4. **GitHub Actions**
   - Automated testing on main branch
   - Automated release on tag creation
   - NPM publication
   - Documentation deployment

### Automated Releases

Releases are automated through GitHub Actions:

- **Triggers**: Tag push or manual workflow dispatch
- **Process**: Build, test, publish to NPM, create GitHub release
- **Artifacts**: Package distribution, release notes, documentation

## Issues and Support

### Reporting Bugs

- Use the bug report template
- Include steps to reproduce
- Provide environment details
- Include error logs

### Feature Requests

- Use the feature request template
- Describe the use case
- Consider implementation complexity
- Discuss alternatives

### Getting Help

- Check existing documentation
- Search existing issues
- Join discussions
- Contact maintainers

## Recognition

Contributors are recognized in:

- README.md contributors section
- GitHub contributors page
- Release notes for significant contributions
- Annual contributor appreciation posts

## Questions?

If you have questions about contributing, please:

1. Check this document and other documentation
2. Search existing issues
3. Open a new issue with the `question` label
4. Contact maintainers directly

Thank you for contributing to Material Web MCP!
