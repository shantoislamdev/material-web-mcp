# Codecov Setup Guide

This guide provides step-by-step instructions for setting up Codecov coverage reporting in the Material Web MCP project.

## Overview

Codecov provides code coverage analysis and reporting. The integration requires setting up authentication via a CODECOV_TOKEN secret in your GitHub repository.

## Prerequisites

- GitHub repository: `shantoislamdev/material-web-mcp`
- Codecov account (sign up at [codecov.io](https://codecov.io) if needed)
- GitHub repository admin permissions

## Step 1: Add CODECOV_TOKEN Secret

### Option A: Using GitHub Web Interface (Recommended)

1. **Navigate to your repository:**

   ```
   https://github.com/shantoislamdev/material-web-mcp
   ```

2. **Go to Settings:**

   - Click the "Settings" tab in your repository

3. **Access Secrets and Variables:**

   - Click "Secrets and variables" in the left sidebar
   - Select "Actions"

4. **Add new secret:**
   - Click "New repository secret"
   - **Name:** `CODECOV_TOKEN`
   - **Secret:** `64e851a2-ae37-443f-a971-fecd31663792`
   - Click "Add secret"

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Login to GitHub
gh auth login

# Add the secret
gh secret set CODECOV_TOKEN --body="64e851a2-ae37-443f-a971-fecd31663792" --repo=shantoislamdev/material-web-mcp
```

## Step 2: Verify Codecov Connection

1. **Visit Codecov:**

   - Go to [https://codecov.io](https://codecov.io)
   - Sign in with your GitHub account

2. **Find your repository:**

   - Look for `shantoislamdev/material-web-mcp`
   - If not visible, click "Add new repository"

3. **Activate the repository:**
   - Click "Add" next to your repository name
   - Follow the on-screen instructions

## Step 3: Test Coverage Upload

1. **Trigger CI workflow:**

   - Make any commit and push to main/develop branch
   - Or create a pull request

2. **Monitor the workflow:**

   - Go to Actions tab in your GitHub repository
   - Click on the latest workflow run
   - Watch for the "Upload coverage to Codecov" step

3. **Check for success:**
   - Look for green checkmark on the Codecov step
   - No error messages should appear

## Step 4: Verify Coverage Reporting

1. **Check Codecov dashboard:**

   - Visit your repository page on Codecov
   - Should show coverage percentage and reports

2. **Review PR comments:**
   - Create a new pull request
   - Codecov should comment with coverage changes
   - Check that the PR shows coverage status

## Current Configuration

### CI Workflow Integration

The `.github/workflows/ci.yml` file includes:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    file: ./coverage/lcov.info
    fail_ci_if_error: true
    flags: unittests
    name: codecov-umbrella
    verbose: true
```

### Codecov Configuration

The `codecov.yml` file configures:

- Coverage reporting thresholds (80% target)
- Comment behavior on PRs
- File ignores for documentation and build files
- Source file mapping

## Security Considerations

### Token Security

- **Never commit the token** to version control
- **Only store in GitHub Secrets** as environment variable
- **Regularly rotate** the token if needed
- **Restrict token scope** to necessary repositories only

### Best Practices

1. **Use environment-specific secrets** in GitHub Actions
2. **Monitor token usage** in Codecov dashboard
3. **Revoke compromised tokens** immediately
4. **Use least privilege principle** for token permissions

## Troubleshooting

### Common Issues

1. **"Token not found" error:**

   - Verify `CODECOV_TOKEN` secret is properly set
   - Check secret name spelling and case sensitivity

2. **"Upload failed" error:**

   - Ensure the provided token is valid
   - Check that the repository is activated in Codecov

3. **"No coverage data found":**

   - Verify `npm run coverage` script exists and works
   - Check that coverage report is generated at `./coverage/lcov.info`

4. **Badge not updating:**
   - Badge may take a few minutes to refresh after first upload
   - Check that the badge URL in README.md matches repository path

### Debug Steps

1. **Check GitHub Actions logs:**

   - Navigate to Actions tab
   - Click failed workflow run
   - Expand "Upload coverage to Codecov" step
   - Look for specific error messages

2. **Verify coverage script:**

   ```bash
   npm run coverage
   ls -la coverage/
   ```

3. **Test manual upload:**
   ```bash
   npm run coverage
   npx codecov --file ./coverage/lcov.info --token 64e851a2-ae37-443f-a971-fecd31663792
   ```

## Support Resources

- **Codecov Documentation:** [https://docs.codecov.io](https://docs.codecov.io)
- **GitHub Actions Secrets:** [https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- **Codecov GitHub Action:** [https://github.com/codecov/codecov-action](https://github.com/codecov/codecov-action)

## Verification Checklist

- [ ] CODECOV_TOKEN secret added to GitHub repository
- [ ] Repository activated in Codecov dashboard
- [ ] CI workflow includes coverage upload step
- [ ] First coverage upload completed successfully
- [ ] Coverage badge displays in README.md
- [ ] PR comments show coverage status
- [ ] Documentation updated with setup instructions

## Personal Account Compatibility

This setup is fully compatible with personal GitHub accounts:

- **Token authentication** works for personal and organizational repositories
- **Badge format** `github/username/repository` works for both account types
- **CI workflow** uses repository secrets, not organizational ones
- **Coverage reporting** is identical regardless of account type

The provided CODECOV_TOKEN (`64e851a2-ae37-443f-a971-fecd31663792`) is pre-configured for your repository and will work immediately once the GitHub secret is set.
