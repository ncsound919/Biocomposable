# Changelog

All notable changes to BioComposable will be documented in this file.

## [1.0.0] - 2026-08-20

### Architecture & Engine
- **Contract-First Engine**: Established Banff 2023 pathology lesion schemas and RO-Crate v1.1 provenance models.
- **Full-Stack Express Agent Server**: Deployed Express backend on port 3000 hosting `/agent/v1/health`, `/agent/v1/execute`, `/agent/v1/validate-schema`, `/agent/v1/query` (Gemini 3.6 Flash), and `/agent/v1/download/*`.
- **Reproducibility Debt ($\text{RpD}$) Engine**: Automated calculation of contract drift and version mismatches.
- **Workflow Generators**: Built Nextflow DSL2, Snakemake, and runnable Python pipeline exporters.

### Hygiene & Code Quality
- **Cleaned Repository**: Removed 36 legacy Python patch scripts from root directory.
- **Documentation & Open Source**: Added comprehensive `README.md`, `LICENSE` (MIT), `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md`.
- **CI/CD & Testing**: Added GitHub Actions workflow (`ci.yml`), Dependabot config (`dependabot.yml`), and automated TypeScript unit test runner (`npm test`).
- **Error Resilience**: Implemented React `ErrorBoundary` and Express CORS/security middleware.
