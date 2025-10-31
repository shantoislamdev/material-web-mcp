# Repository Deployment Checklist

## Pre-Deployment Setup

### 1. Repository Configuration

- [ ] **Repository Name**: `material-web-mcp`
- [ ] **Owner**: `shanroislamdev`
- [ ] **Description**: "MCP server for Material Web documentation"
- [ ] **Visibility**: Public (recommended for open source)
- [ ] **Initialize repository**: README.md, .gitignore, MIT License

### 2. Branch Protection Rules

#### Main Branch (`main`)

- [ ] **Enable branch protection**: Required
- [ ] **Require pull request reviews**: Enabled (1 reviewer minimum)
- [ ] **Require status checks to pass**: Enabled
  - [ ] `ci` workflow
  - [ ] [ ] `security` workflow
- [ ] **Require branches to be up to date**: Enabled
- [ ] **Dismiss stale reviews**: Enabled
- [ ] **Require review from code owners**: Optional but recommended
- [ ] **Restrict pushes that create files larger than 1MB**: Enabled
- [ ] **Require signed commits**: Enabled
- [ ] **Require GPG verification**: Enabled

#### Develop Branch (`develop`)

- [ ] **Enable branch protection**: Optional
- [ ] **Require pull request reviews**: Enabled (1 reviewer minimum)
- [ ] **Require status checks to pass**: Enabled
  - [ ] `ci` workflow only
- [ ] **Dismiss stale reviews**: Enabled

### 3. GitHub Actions Secrets

Configure the following secrets in repository settings:

- [ ] **`NPM_TOKEN`**: NPM publishing token
  - Get from: npm -> Access Tokens -> Generate new token
  - Scope: `publish`
  - Add to: Repository Settings → Secrets and variables → Actions

### 4. Website/Documentation (Optional)

- [ ] **Alternative hosting**: Consider alternatives like Netlify, Vercel, or GitHub Releases
- [ ] **Documentation storage**: Keep markdown files in `ui-docs/` folder
- [ ] **Package readme**: NPM package will include README.md automatically

### 5. Security Settings

- [ ] **Dependency graph**: Enabled (automatic)
- [ ] **Dependabot alerts**: Enabled (automatic)
- [ ] **Dependabot security updates**: Enabled
- [ ] **Code scanning alerts**: Enabled
- [ ] **Secret scanning**: Enabled
- [ ] **Push protection from forks**: Disabled (for open source)

### 6. Repository Metadata

- [ ] **Topics**: `mcp`, `material-web`, `documentation`, `nodejs`, `ai-tools`
- [ ] **Website**: Repository URL (GitHub repository main page)
- [ ] **Issues**: Enabled
- [ ] **Projects**: Disabled (unless needed)
- [ ] **Wiki**: Disabled (documentation in docs/ folder)
- [ ] **Discussions**: Optional (can enable later for community)

### 7. Automated Workflows

Once deployed, the following workflows will be active:

#### CI Workflow (`ci.yml`)

- [ ] **Triggered on**: Push to `main`/`develop`, Pull requests
- [ ] **Node.js versions**: 18.x, 20.x, 22.x
- [ ] **Actions**: Install, lint, test, coverage, build
- [ ] **Upload coverage**: To Codecov

#### Security Workflow (`security.yml`)

- [ ] **Triggered on**: Push, PR, schedule (daily), manual
- [ ] **Actions**: CodeQL analysis, Trivy scan, npm audit, secret scan
- [ ] **Alerts**: Security tab, pull request comments

#### Release Workflow (`release.yml`)

- [ ] **Triggered on**: Tag push (`v*`), manual dispatch
- [ ] **Actions**: Build, test, npm publish, GitHub release
- [ ] **Versioning**: Semantic versioning
- [ ] **Assets**: Package distribution, release notes

#### Documentation Strategy

- [ ] **Package documentation**: Automatically included in NPM package
- [ ] **GitHub repository**: Main documentation source
- [ ] **Alternative hosting**: Consider dedicated documentation platforms if needed

### 8. Automation Configuration

#### Dependabot (`dependabot.yml`)

- [ ] **Dependencies**: Weekly updates for npm packages
- [ ] **GitHub Actions**: Weekly updates
- [ ] **Security updates**: Automatic
- [ ] **Reviewers**: `shanroislamdev`
- [ ] **Labels**: `dependencies`, `automated`

#### Semantic Release (`.releaserc.json`)

- [ ] **Branch strategy**: `main`, `develop`
- [ ] **Plugins**: Commit analyzer, changelog, npm, GitHub
- [ ] **Versioning**: Automatic semantic versioning

### 9. Documentation Structure

- [ ] **README.md**: Main documentation with badges
- [ ] **CONTRIBUTING.md**: Contribution guidelines
- [ ] **ui-docs/**: Markdown documentation files
- [ ] **docs/**: Additional documentation (branch protection, etc.)

### 10. Issue Templates

- [ ] **Bug Report Template**: `.github/ISSUE_TEMPLATE/bug_report.md`
- [ ] **Feature Request Template**: `.github/ISSUE_TEMPLATE/feature_request.md`
- [ ] **Pull Request Template**: `.github/pull_request_template.md`

## Deployment Steps

### Step 1: Create Repository on GitHub

```bash
# Create repository on GitHub using gh CLI (or web interface)
gh repo create shanroislamdev/material-web-mcp --public --source=. --push
```

### Step 2: Configure Branch Protection

1. Go to repository settings
2. Navigate to "Branches"
3. Add rule for `main` branch
4. Configure protection rules as listed above

### Step 3: Add GitHub Actions Secrets

1. Go to repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add `NPM_TOKEN` secret
4. Generate NPM token with publish scope

### Step 4: Setup Alternative Documentation (Optional)

1. Consider using NPM package as primary documentation source
2. Review GitHub repository as main documentation hub
3. Optionally set up external hosting for enhanced documentation

### Step 5: Verify Workflows

1. Make a small test commit to trigger CI
2. Verify all workflows run successfully
3. Check security alerts and coverage reports

## Post-Deployment Verification

### Automated Systems Checklist

- [ ] **CI/CD Pipeline**: All workflows passing
- [ ] **Security Scanning**: No critical vulnerabilities
- [ ] **Code Coverage**: Reports generated successfully
- [ ] **Dependabot**: First automated PR created
- [ ] **NPM Package**: Package published successfully

### Manual Verification

- [ ] **Issue Templates**: Working correctly
- [ ] **Pull Request Template**: Auto-populated
- [ ] **Branch Protection**: Enforced correctly
- [ ] **Automated Releases**: Test with minor version bump
- [ ] **Documentation**: All links working
- [ ] **Badges**: Displaying correctly in README

## Success Criteria

**Production Ready**: Repository meets all best practices
**Automated**: Minimal manual intervention required
**Secure**: Security scanning and protection enabled
**Documented**: Clear contribution and usage guidelines
**Tested**: Comprehensive test coverage and CI/CD
**Maintained**: Automated dependency and security updates

## Maintenance Tasks

### Weekly

- [ ] Review Dependabot PRs
- [ ] Check security alerts
- [ ] Monitor CI/CD pipeline status

### Monthly

- [ ] Review contributor activity
- [ ] Update documentation as needed
- [ ] Review documentation needs and consider external hosting if beneficial

### As Needed

- [ ] Review and merge feature contributions
- [ ] Update Node.js version support
- [ ] Address security vulnerabilities
- [ ] Release new versions
