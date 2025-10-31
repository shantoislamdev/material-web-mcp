# GitHub Deployment Guide - Material Web MCP

## Prerequisites

- GitHub account with repository: https://github.com/shanroislamdev/material-web-mcp
- Git installed on your system
- GitHub CLI (optional but recommended)

## Step 1: Configure Git (First Time Only)

```bash
# Configure your git user information
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

## Step 2: Add All Files to Git

```bash
# Add all files to staging
git add .

# Check what files will be committed
git status
```

## Step 3: Create Initial Commit

```bash
# Create commit with descriptive message
git commit -m "feat: initial release of Material Web MCP

- Add comprehensive Material Design component documentation
- Include MDUI web components reference
- Add TypeScript definitions for all components
- Include testing setup with Jest
- Add CI/CD workflows for GitHub Actions
- Include comprehensive README and documentation
- Support for theming and customization
- Component API reference and examples
- Ready for npm publication"
```

## Step 4: Set Up Remote Repository

```bash
# Add the GitHub repository as remote origin
git remote add origin https://github.com/shanroislamdev/material-web-mcp.git

# Verify remote was added correctly
git remote -v
```

## Step 5: Push to GitHub

```bash
# Push to main branch (create main branch if it doesn't exist)
git branch -M main

# Push all code to GitHub
git push -u origin main
```

## Step 6: Verify Deployment

```bash
# Check the push was successful
git log --oneline -5

# Verify remote tracking
git remote show origin
```

## Alternative: Using GitHub CLI (Recommended)

If you have GitHub CLI installed:

```bash
# Authenticate with GitHub
gh auth login

# Create repository (if not exists)
gh repo create shanroislamdev/material-web-mcp --public --source=. --remote=origin --push

# Or add remote and push
git remote add origin https://github.com/shanroislamdev/material-web-mcp.git
git branch -M main
git push -u origin main
```

## Post-Deployment Checklist

### 1. Repository Settings

- [ ] Go to https://github.com/shanroislamdev/material-web-mcp
- [ ] Verify all files are uploaded correctly
- [ ] Check repository structure matches your local files

### 2. Enable GitHub Actions

- [ ] Navigate to Actions tab in your repository
- [ ] Review the workflow files (.github/workflows/)
- [ ] Enable workflows if they're disabled
- [ ] Run a test workflow to ensure it works

### 3. Set Up Repository Secrets

Go to Settings → Secrets and variables → Actions, add:

- [ ] `NPM_TOKEN`: Your npm publishing token
- [ ] `GITHUB_TOKEN`: Usually auto-generated (no action needed)

### 4. Configure Branch Protection (Recommended)

- [ ] Go to Settings → Branches
- [ ] Add rule for `main` branch
- [ ] Require pull request reviews
- [ ] Require status checks to pass
- [ ] Require branches to be up to date

### 5. Enable Dependabot

- [ ] Go to Settings → Code security and analysis
- [ ] Enable Dependabot alerts
- [ ] Enable Dependabot security updates
- [ ] Configure Dependabot version updates for `package.json`

### 6. Repository Documentation

- [ ] Update README.md with:
  - [ ] Badges for CI/CD status
  - [ ] Installation instructions
  - [ ] Usage examples
  - [ ] Contributing guidelines
  - [ ] License information

## Troubleshooting Common Issues

### Push Rejected

If you get a push rejection:

```bash
# Pull changes first (if any exist)
git pull origin main --rebase

# Try pushing again
git push origin main
```

### Authentication Issues

If you get authentication errors:

```bash
# Use personal access token instead of password
# Or set up SSH keys:
ssh-keygen -t ed25519 -C "your.email@example.com"
# Add public key to GitHub SSH settings
```

### Large Files

If you have files > 100MB:

```bash
# Check for large files
find . -size +100M

# Remove from git history if needed
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch path/to/large/file' \
--prune-empty --tag-name-filter cat -- --all
```

## Verification Commands

```bash
# Verify repository structure
ls -la

# Check commit history
git log --oneline --graph

# Verify remote tracking
git remote -v

# Check branch information
git branch -a

# Verify all files are tracked
git ls-files
```

## Next Steps After Deployment

1. **Create Release**: Use GitHub Releases for version management
2. **Set Up npm Publishing**: Configure automated npm releases
3. **Monitor CI/CD**: Ensure workflows run successfully
4. **Update Documentation**: Keep README and docs current
5. **Configure Analytics**: Add repository insights tracking

## Security Best Practices

- [ ] Review and update `.gitignore` to exclude sensitive files
- [ ] Never commit API keys or secrets
- [ ] Use environment variables for configuration
- [ ] Enable security advisories
- [ ] Regular dependency updates via Dependabot

---

**Deployment Complete!** Your Material Web MCP project is now live on GitHub.
