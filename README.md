# BioComposable

**Composable, Contract-First Bioinformatics Architecture for Transplant & Single-Cell Research**

BioComposable is an interactive, full-stack application and software architecture specification for multiomics single-cell transplant research, Banff 2023 pathology validation, and reproducible workflow orchestration (Nextflow DSL2, Snakemake, Python).

---

## Key Features

- **Contract-First Architecture**: Strong typed schema validation for single-cell multiomics (`MuData`, `Scanpy`, `Pydantic`) and pathology lesion scores (`Banff 2023`).
- **Live Express Backend Service (Port 3000)**: Serves live execution, DAG validation, schema checking, and Gemini 3.6 Flash reasoning.
- **Reproducibility Debt ($\text{RpD}$) Engine**: Quantifies schema drift and version mismatches across pipeline steps.
- **Workflow Generators**: Generates executable Python scripts, Nextflow DSL2 (`main.nf`), and Snakemake (`Snakefile`) workflows.
- **Production PyPI Mappings**: Abstract `bio-*` component specifications map directly to open-source PyPI packages (`mudata`, `scanpy`, `scvi-tools`, `decoupler`, `harmony-pytorch`, `ro-crate-py`).
- **Direct File Downloads**:
  - `biocomposable_pipeline.py` (Executable Python script)
  - `ro-crate-metadata.json` (W3C RO-Crate v1.1 provenance manifest)
  - `requirements.txt` (Pinned production PyPI dependencies)

---

## Live Express API Endpoints (Port 3000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/agent/v1/health` | Health check, server version, and supported schemas |
| `POST` | `/agent/v1/execute` | Executes DAG validation & returns Nextflow/Snakemake/Python artifacts |
| `POST` | `/agent/v1/validate-schema` | Live Banff 2023 pathology lesion validator & MVI index calculation |
| `POST` | `/agent/v1/query` | Gemini 3.6 Flash AI pipeline reasoning assistant |
| `GET` | `/agent/v1/download/python` | Downloads runnable Python pipeline script |
| `GET` | `/agent/v1/download/ro-crate` | Downloads W3C RO-Crate v1.1 provenance JSON |
| `GET` | `/agent/v1/download/requirements` | Downloads pinned `requirements.txt` |
| `GET` | `/agent/v1/components` | Returns component manifests and PyPI package equivalents |

---

## Getting Started

### Requirements
- Node.js >= 18 or Bun
- Gemini API Key (`GEMINI_API_KEY` in `.env`)

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/ncsound919/Biocomposable.git
cd Biocomposable

# Install dependencies
npm install

# Start the dev server (Express + Vite on Port 3000)
npm run dev
```

### Production Build

```bash
# Build Vite client and bundle Express server into dist/server.cjs
npm run build

# Start production server
npm run start
```

---

## Production PyPI Dependencies

```txt
mudata==0.3.3
scanpy==1.10.0
pydantic==2.6.4
scvi-tools==1.1.2
decoupler==1.6.0
harmony-pytorch==0.1.1
ro-crate-py==0.8.0
```

---

## License

This project is licensed under the [MIT License](LICENSE).
