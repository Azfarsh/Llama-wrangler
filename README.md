# Axel AI

**An Agentic AI System for Automatic Data Wrangling & Excel Intelligence**

Upload any dataset, describe what you need in plain English, and get a clean, transformed, analysis-ready file back — no code, no formulas, no manual effort.

---

## The Problem

Data scientists spend **70–80% of their time** cleaning and preparing data instead of analyzing it. Traditional tools like Excel or Python scripts require technical expertise, repetitive manual work, and constant trial-and-error. Non-technical users are left completely out of the loop.

## The Solution

Axel AI is a **multi-agent AI system** that automates the entire data wrangling pipeline through a ChatGPT-style conversational interface. Users simply upload a file and describe their goal — the AI understands, plans, executes, validates, and delivers a clean dataset.

**Powered by Google Gemini**, the system separates reasoning (LLM) from execution (deterministic Python), ensuring accurate, reproducible, and hallucination-free results.

---

## Key Capabilities

| Capability | Description |
|---|---|
| **Natural Language Data Wrangling** | Describe transformations in plain English — "clean this for ML", "remove nulls", "normalize numeric columns" |
| **Multi-Agent Pipeline** | Intent Understanding → Planning → Execution → Validation, each handled by a specialized AI agent |
| **Excel AI Assistant** | Upload `.xlsx` files and ask the AI to add formulas, create charts, build dashboards, and analyze data directly in the spreadsheet |
| **Auto-Wrangling Mode** | Fully automatic pipeline — predicts target column, infers feature types, builds and executes a cleaning plan with zero user input |
| **RAG-Enhanced Context** | Retrieval-Augmented Generation indexes dataset metadata for smarter, context-aware AI responses |
| **Feature Type Inference** | Rule-based column classification (numerical, categorical, datetime, sentence, URL, etc.) inspired by the AutoDW research paper |
| **Dashboard Generation** | Automatic visual dashboard sheets with summary statistics, distributions, and charts embedded in the output Excel file |
| **Code Generation** | Downloadable Python script that reproduces the exact wrangling pipeline for transparency and reproducibility |
| **Multi-Sheet Excel Support** | Full support for multi-sheet Excel workbooks — read, transform, and write across sheets |
| **Conversation Memory** | Follow-up prompts build on previous transformations within the same session |

---

## How It Works

```
Upload Dataset (CSV / Excel)
        ↓
Dataset Profiling & RAG Indexing
        ↓
User Describes Goal in Natural Language
        ↓
Agent 1 → Intent Understanding (Gemini)
        ↓
Agent 2 → Transformation Planning (Gemini)
        ↓
Agent 3 → Safe Execution (Python/Pandas)
        ↓
Agent 4 → Validation & Insight Generation (Gemini)
        ↓
Download Clean Dataset + Python Script
```

> **Core principle: LLM thinks, agent plans, code executes** — no hallucinated data, no unsafe operations.

---

## Data Transformations Supported

- Drop columns and constant columns
- Handle missing values (drop rows, fill with mean/median/mode)
- Remove duplicate rows
- Rename columns
- Type conversion (int, float, datetime, string)
- Categorical encoding (Label Encoding)
- Datetime feature extraction (year, month, day, etc.)
- Text vectorization (TF-IDF)
- Numeric normalization (StandardScaler)
- Custom transformations via LLM-generated Python code (sandboxed execution)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python, FastAPI, Pandas, NumPy, scikit-learn, Jinja2, openpyxl |
| **LLM** | Google Gemini API (`gemini-2.5-flash`) |
| **RAG** | Lightweight in-memory token-overlap retrieval |
| **Frontend** | React 19, React Router, Tailwind CSS, Recharts, Lucide Icons, Axios |
| **Build** | Vite 7 |

---

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- A [Google Gemini API key](https://makersuite.google.com/app/apikey) (free tier works)

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_SEC=45
```

Start the server:

```bash
python main.py
```

Backend runs on `http://localhost:8001`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. Use It

1. Open `http://localhost:5173` in your browser
2. Sign up and log in
3. Go to **Dashboard** → upload a CSV or Excel file
4. On the **Processing** page, type what you need (e.g. *"Clean this dataset and prepare it for machine learning"*)
5. Download the processed file and generated Python script from the **Download** page

---

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── endpoints.py           # All API routes (data wrangling + Excel AI)
│   ├── core/
│   │   └── config.py              # Settings & environment config
│   ├── services/
│   │   ├── data_service.py        # Data loading, profiling, transformations, sandboxed code execution
│   │   ├── llm_service.py         # Gemini-powered multi-agent LLM service
│   │   ├── rag_service.py         # In-memory RAG for context-aware responses
│   │   ├── fti_service.py         # Feature Type Inference (rule-based)
│   │   ├── code_generator.py      # Jinja2-based Python script generator
│   │   └── excel_ai_service.py    # Excel AI: formulas, charts, dashboards
│   └── schemas.py                 # Plan validation schemas
├── main.py                        # FastAPI entry point
├── requirements.txt
└── uploads/                       # Uploaded & processed files (auto-created)

frontend/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx            # Navigation sidebar
│   ├── pages/
│   │   ├── Home.jsx               # Landing page
│   │   ├── Login.jsx              # Login
│   │   ├── Signup.jsx             # Sign up
│   │   ├── Dashboard.jsx          # Upload & dataset management
│   │   ├── Processing.jsx         # Chat interface for data wrangling
│   │   ├── Download.jsx           # Results, insights & downloads
│   │   ├── About.jsx              # About the project
│   │   ├── HowItWorks.jsx         # Step-by-step explanation
│   │   └── Contact.jsx            # Contact info
│   ├── App.jsx                    # Routing & protected routes
│   └── main.jsx                   # Entry point
├── package.json
└── vite.config.js
```

---

## API Endpoints

### Data Wrangling

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload CSV/Excel dataset |
| `POST` | `/api/analyze` | Understand intent & generate transformation plan |
| `POST` | `/api/execute` | Execute plan with LLM code generation + validated fallback |
| `POST` | `/api/wrangle` | Fully automatic pipeline (predict target, FTI, plan, execute) |
| `GET` | `/api/code/{session_id}` | Download generated Python wrangling script |
| `GET` | `/api/download/{filename}` | Download processed dataset |
| `GET` | `/api/session/{session_id}/insights` | Get generated insights |
| `GET` | `/api/session/{session_id}/table` | Paginated table data |

### Excel AI

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/excel/upload` | Upload `.xlsx` file for AI processing |
| `POST` | `/api/excel/ai` | Send natural language request to modify the spreadsheet |
| `GET` | `/api/excel/download` | Download the updated Excel file |
| `GET` | `/api/excel/health` | Check Gemini API configuration status |

---

## Research Inspiration

This project is directly inspired by **Axel AI: Automatic Data Wrangling Leveraging Large Language Models** (ASE 2024).

| AutoDW Paper | Axel AI |
|---|---|
| End-to-end automation | Fully automated pipeline with auto-wrangling mode |
| LLM-assisted planning | Gemini-powered multi-agent architecture |
| Feature type inference | Rule-based FTI with 12 feature types |
| Code generation | Sandboxed code execution + downloadable scripts |
| Research prototype | Full-stack web app with conversational UI |

Key enhancements beyond the paper: no code exposed to users, ChatGPT-style chat interface, Excel AI assistant, RAG-enhanced context, dashboard generation, and a modern React frontend.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model to use |
| `GEMINI_TIMEOUT_SEC` | No | `45` | Request timeout in seconds |

---

## License

Academic Prototype — for educational and research purposes.

## Acknowledgments

- AutoDW research paper (ASE 2024)
- Google Gemini API
- FastAPI and React communities
