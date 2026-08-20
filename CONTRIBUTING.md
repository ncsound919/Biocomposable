# Contributing to BioComposable

Thank you for your interest in contributing to BioComposable! We welcome community contributions in contract definitions, single-cell multiomics tools, pathology schema validators, and workflow orchestration generators.

## Development Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/ncsound919/Biocomposable.git
   cd Biocomposable
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Dev Environment**:
   ```bash
   npm run dev
   ```

4. **Run Tests & Linter**:
   ```bash
   npm test
   npm run lint
   ```

## Pull Request Guidelines

- Ensure `npm test` and `npm run lint` pass cleanly before submitting your PR.
- Add unit tests for any new contract schemas or DAG validation rules in `src/__tests__/schemaValidator.test.ts`.
- Maintain contract compatibility with Banff 2023 kidney biopsy standards and RO-Crate v1.1 provenance specs.
