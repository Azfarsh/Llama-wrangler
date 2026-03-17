# Excel AI Agent

A conversational AI agent that understands natural language and performs intelligent operations on Excel sheets. **Ollama-only** (local LLM), with **RAG** for better context understanding.

## 🎯 Project Overview

The Excel AI Agent lets you:
- ✅ **Upload** Excel (.xlsx, .xls) or CSV files
- ✅ **Chat** in natural language: "Sort by Date descending", "Add column Total = Price * Quantity", "Create summary per region"
- ✅ **Get** structured plans, validated execution, insights, and downloadable output

**Flow:** Upload → Profile → RAG-index → Understand Intent (Ollama) → Create Plan → Validate → Execute → Insights → Download

## 🏗️ System Architecture

### Backend (Python/FastAPI)
- **Dataset Profiler** - Analyzes datasets and extracts metadata
- **Feature Type Inference (FTI)** - Rule-based column type detection (numerical, categorical, datetime, text, etc.)
- **Prediction Engineering** - LLM recommends target column and task (classification/regression)
- **Agent Orchestrator** with multiple agents:
  - **Intent Understanding Agent** (Ollama/HF) - Understands user goals
  - **Planning Agent** (Ollama/HF) - Creates step-by-step transformation plans
  - **Execution Agent** (Python) - Performs deterministic data transformations
  - **Validation & Insight Agent** (Ollama/HF) - Validates results and generates insights
- **Code Generator** - Produces executable Python script for the wrangling pipeline (Jinja2)

### Frontend (React)
- Modern, responsive UI with ChatGPT-style chat interface
- Dataset upload and preview
- Real-time statistics and visualizations
- Transformation progress tracking
- Results and insights display

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- **Ollama** (lightweight local LLM – runs easily on a laptop). Install from [ollama.com](https://ollama.com), then run:
  ```bash
  ollama run llama3.2:3b
  ```
  Keep this running in a terminal, or run it once so the model is pulled; the backend will call it when needed.

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. (Optional) Create `.env` in `backend/` to override defaults:
```bash
cp .env.example .env
```
- `USE_OLLAMA=true` – Use Ollama (default). Set to `false` to use HuggingFace fallback (requires `pip install transformers torch`).
- `OLLAMA_BASE_URL=http://localhost:11434` – Ollama API URL.
- `OLLAMA_MODEL=llama3.2:3b` – Model name (e.g. `phi3:mini`, `llama3.2:3b`).

5. Run the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py      # API routes
│   │   ├── core/
│   │   │   └── config.py         # Configuration
│   │   └── services/
│   │       ├── data_service.py   # Data processing operations
│   │       └── llm_service.py    # Gemini LLM integration
│   ├── main.py                   # FastAPI application
│   ├── requirements.txt          # Python dependencies
│   └── uploads/                  # Uploaded datasets (created automatically)
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx          # Landing page
    │   │   ├── Login.jsx         # Login page
    │   │   ├── Signup.jsx        # Signup page
    │   │   ├── Dashboard.jsx     # User dashboard
    │   │   ├── Processing.jsx    # Core chatbot/data wrangling page
    │   │   └── Download.jsx      # Results and insights page
    │   ├── App.jsx               # Main app component with routing
    │   └── main.jsx              # Entry point
    ├── package.json
    └── vite.config.js
```

## 🔧 Features

### Data Transformations Supported
- Drop columns and constant columns
- Handle missing values (drop or fill with mean/median/mode)
- Remove duplicates
- Rename columns
- Type conversion (int, float, datetime, string)
- Categorical encoding (Label Encoding)
- Datetime feature extraction
- Text vectorization (TF-IDF)
- Numeric normalization (StandardScaler)

### Agent Capabilities
1. **Intent Understanding**: Identifies purpose (ML classification, regression, analytics, etc.)
2. **Planning**: Creates logical transformation sequences
3. **Execution**: Performs safe, deterministic operations
4. **Validation**: Generates insights and validates data quality

## 📊 Usage Example

1. **Upload Dataset**: Go to Dashboard and upload a CSV/Excel file.
2. **Run full pipeline (Auto)**: On the Processing page, click **"Run full pipeline (Auto)"** to:
   - Predict target column and task (classification/regression) via LLM
   - Infer feature types (FTI) for each column
   - Build and execute a cleaning + enrichment plan
   - Get insights and download the cleaned dataset + generated Python script.
3. **Or describe intent**: In the chat, type e.g.:
   - "Clean this dataset and prepare it for machine learning classification"
   - "Remove null values and normalize numeric columns"
4. **Get Results**: Download the cleaned dataset and (optionally) the generated Python script from the Download page.

## 🔬 Research Inspiration

This project is directly inspired by:
- **AutoDW: Automatic Data Wrangling Leveraging Large Language Models** (ASE 2024)

Key enhancements over AutoDW:
- No code shown to users
- ChatGPT-style conversational interface
- Modern React web UI
- Gemini-powered execution
- Rich dataset visualizations

## 🛠️ Technology Stack

**Backend:**
- FastAPI (Python web framework)
- Pandas (Data manipulation)
- Ollama (local LLM – default) or HuggingFace (optional fallback)
- scikit-learn (ML preprocessing)
- NumPy (Numerical operations)
- Jinja2 (Code generation)

**Frontend:**
- React 19
- React Router (Routing)
- Tailwind CSS (Styling)
- Axios (HTTP client)
- Vite (Build tool)

## 📝 Environment Variables

Create a `.env` file in the `backend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🧪 Testing

### Backend API Endpoints

- `POST /api/upload` - Upload dataset
- `POST /api/analyze` - Analyze user intent and generate plan
- `POST /api/execute` - Execute transformation plan
- `POST /api/wrangle` - **Full AutoDW-style pipeline**: predict target, FTI, build plan, execute, return results
- `GET /api/code/{session_id}` - Download generated Python wrangling script
- `GET /api/download/{filename}` - Download processed dataset
- `GET /api/session/{session_id}/insights` - Get insights for a session

### Example API Usage

```bash
# Upload dataset
curl -X POST http://localhost:8000/api/upload \
  -F "file=@your_dataset.csv"

# Analyze intent
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"session_id": "xxx", "query": "Clean for ML"}'
```

## 🎨 UI Pages

1. **Home** - Landing page with features and research info
2. **Login/Signup** - Authentication (localStorage-based for MVP)
3. **Dashboard** - Upload datasets and view history
4. **Processing** - Core chatbot interface with dataset preview
5. **Download** - Results, insights, and download page

## 📄 License

Academic Prototype - For educational/research purposes

## 🤝 Contributing

This is an academic project inspired by AutoDW research. Contributions welcome!

## 🙏 Acknowledgments

- AutoDW research paper (ASE 2024)
- Google Gemini API
- FastAPI and React communities

---

**Note**: This is a prototype/MVP. For production use, consider:
- Database for session management (instead of in-memory)
- User authentication with proper backend
- File size limits and validation
- Error handling and logging
- Testing suite
