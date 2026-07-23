# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-23

### Added
- Full portfolio-ready documentation (`docs/`)
- Dark mode via Theme Context
- Error Boundary and dedicated error pages (404, 500, wallet, network)
- Purchase flow UX steps (buying → wallet confirm → network → done)
- `react-hot-toast` notifications
- Framer Motion animations and glassmorphism UI refresh
- Spinner component for async actions
- GitHub Actions CI (lint, test, build)
- Husky + lint-staged pre-commit hooks
- Docker + docker-compose support
- CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, CHANGELOG

### Changed
- README rewritten to open-source portfolio standard
- Project structure expanded (`hooks/`, `constants/`, `types/`, `components/ui/`)
- Lighthouse-oriented SEO/accessibility improvements

### Fixed
- Stronger error mapping for wallet, network, and contract failures
