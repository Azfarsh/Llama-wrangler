# Axel AI

**Agentic AI for conversational data wrangling and Excel assistance**

Upload a CSV or Excel file, describe what you want in plain English, and get a transformed, analysis-ready file back. The backend uses **Google Gemini** for intent, planning, and validation; **pandas** runs the actual transformations so results stay reproducible.

---

## What it does

| Area | Details |
|------|---------|
| **Natural-language wrangling** | Chat-driven cleaning and transforms on uploaded tabular data |
| **Multi-step pipeline** | Intent → plan → execution (pandas / validated ops or sandboxed generated code) → insights |
| **Auto-wrangling** | `POST /api/wrangle` predicts a target column, runs **feature type inference (FTI)**, builds a plan, and executes with minimal prompting |
| **RAG context** | **Yes.** `rag_service.py` builds short text chunks from the dataset profile and retrieves by **token overlap** (in-memory, no vector DB). That text is prepended to Gemini prompts for analyze / plan / some execute paths |
| **Excel AI** | Upload `.xlsx`, ask for formulas, charts, or a dashboard sheet; download the updated workbook |
| **Dashboard sheets** | For Excel output, extra sheets (e.g. KPI / category summaries) and native Excel charts can be added when visual outputs are requested |
| **Downloadable Python script** | Jinja2-based generator for the wrangling pipeline (`GET /api/code/{session_id}`) |
| **Session memory** | Follow-ups reuse the same session’s file, profile, and conversation history on the backend |

**FTI:** 12 rule-based types (subset aligned with AutoDW): numerical, categorical, datetime, sentence, url, embedded_number, list, ignorable_id, unit, sign, range, formatted_id.

**Auth (prototype):** Sign up / login in the UI stores credentials in **browser `localStorage` only**—there is no server-side user database.

---

## How it works (high level)

```
Upload (CSV / Excel)
    → Profile dataset + index profile chunks for RAG
    → User message
    → Gemini: intent + JSON plan
    → Execute: pandas / predefined ops + optional LLM-generated code (sandboxed)
    → Optional dashboard sheets for .xlsx
    → Download file + optional generated .py script
```

Principle: **LLM plans; Python executes** on real frames—no direct “LLM edits cells” in the wrangling path.

---

## Transformations (representative)

Implemented via the plan executor and/or generated code, including: drop columns, missing-value handling, dedupe, rename, dtype conversion, label encoding, datetime parts, TF-IDF text columns, numeric standardization, and custom steps from validated LLM-generated code.

---

## Tech stack (as used in code)

| Layer | Stack |
|-------|--------|
| Backend | Python, FastAPI, pandas, NumPy, scikit-learn, openpyxl, Jinja2, `google-genai` |
| LLM | Google Gemini (default model from env, typically `gemini-2.5-flash`) |
| RAG | In-memory chunks from profile + token-overlap retrieval (`backend/app/services/rag_service.py`) |
| Frontend | React 19, React Router 7, Vite 7, Tailwind CSS 4, Axios, Lucide, **Plotly** (`react-plotly.js`) |

The API process title in code is **AutoDW-Lite** (`main.py` / settings); the product name used in the UI is **Axel AI**.

---

## Quick start

### Prerequisites

- **Python 3.10+** recommended (3.8 may work; match your environment)
- **Node.js 20+** recommended for Vite 7
- A [Google AI Studio API key](https://aistudio.google.com/apikey) for Gemini

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_SEC=45
```

```bash
python main.py
```

API: `http://localhost:8001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

### Typical flow

1. Open the app, use **Sign up** / **Login** (local demo auth).
2. **Dashboard** → upload CSV or Excel.
3. **Processing** → describe the task; run analyze/execute (or use auto-wrangling from the API).
4. **Download** → processed file, insights, and script link as applicable.

---

## Project structure (main paths)

```
backend/
├── main.py
├── requirements.txt
├── app/
│   ├── api/endpoints.py       # REST routes
│   ├── core/config.py         # Settings (Gemini, paths)
│   ├── schemas.py
│   └── services/
│       ├── data_service.py    # Load, profile, execute plans, Excel output
│       ├── llm_service.py     # Gemini: intent, plan, insights
│       ├── rag_service.py     # Profile-based RAG (token overlap)
│       ├── fti_service.py     # Feature type inference
│       ├── code_generator.py
│       └── excel_ai_service.py
└── uploads/

frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/            # Sidebar, BrandLogo, ThemeToggle, PlotlyFigure, …
│   ├── hooks/useTheme.js
│   └── pages/                 # Home, Login, Signup, Dashboard, Processing, Download, About, HowItWorks, Contact
├── package.json
└── vite.config.js
```

---

## API overview

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/upload` | Upload dataset |
| POST | `/api/analyze` | Intent + plan from natural language |
| POST | `/api/execute` | Run plan; optional dashboard sheets for Excel |
| POST | `/api/wrangle` | Full auto pipeline |
| GET | `/api/code/{session_id}` | Generated Python script |
| GET | `/api/download/{filename}` | Processed file |
| GET | `/api/session/{session_id}/insights` | Insights JSON |
| GET | `/api/session/{session_id}/table` | Paginated preview |
| POST | `/api/excel/upload` | Excel session upload |
| POST | `/api/excel/ai` | Natural language Excel edits |
| GET | `/api/excel/download` | Download updated `.xlsx` |
| GET | `/api/excel/health` | Gemini configured check |

---

## Research note

This implementation is inspired by **AutoDW: Automatic Data Wrangling Leveraging Large Language Models** (Lei Liu et al., **ASE 2024**). The ASE paper title is **AutoDW**, not “Axel AI”; **Axel AI** is this team’s system name for a full-stack prototype that adds a web UI, Gemini, lightweight RAG, Excel AI, and related features.

---

## License

Academic prototype — educational and research use.

## Acknowledgments

- AutoDW (ASE 2024)
- Google Gemini API
- FastAPI and React communities
