# Branch Protection Rules Configuration

## Main Branch Protection

The main branch (`main`) should be configured with the following protection rules:

### Required Status Checks

- **Require branches to be up to date before merging**: Enabled
- **Require status checks to pass before merging**: Enabled
  - `ci` workflow
  - `security` workflow
- **Require review from Code Owners**: Enabled (recommended for production branches)

### Required Pull Request Reviews

- **Dismiss stale PR approvals when new commits are pushed**: Enabled
- **Require review from code owners**: Enabled
- **Require at least 1 reviewer**: 1
- **Require review from people with write access**: Enabled

### Restrictions

- **Restrict pushes that create files larger than 1MB**: Enabled
- **Restrict pushes to branches that are not protected**: Enabled

## Develop Branch Protection

The develop branch should have similar but slightly relaxed rules:

### Required Status Checks

- **Require branches to be up to date before merging**: Enabled
- **Require status checks to pass before merging**: Enabled
  - `ci` workflow only

### Required Pull Request Reviews

- **Dismiss stale PR approvals when new commits are pushed**: Enabled
- **Require at least 1 reviewer**: 1

## Commit Signing

- **Require signed commits**: Enabled for main branch
- **Require GPG verification**: Enabled for main branch

## Enforcement

These rules should be enforced automatically through GitHub's branch protection system and will prevent:

- Direct pushes to protected branches
- Merging pull requests without required approvals
- Merging without passing CI/CD checks
- Bypassing security scanning requirements

## Manual Override (Emergency)

For emergency fixes, a repository administrator can temporarily disable these protections through:

1. Repository Settings → Branches
2. Edit protection rules for the affected branch
3. Apply temporary changes
4. Re-enable protections after emergency fix is merged
