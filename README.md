# AutoWrangler AI

A fully agentic, LLM-powered data wrangling system that allows non-technical users to prepare datasets using simple natural language instructions. Inspired by the AutoDW research paper (ASE 2024).

## 🎯 Project Overview

Data wrangling is a critical yet time-consuming step in data science, analytics, and machine learning workflows. Studies show that data professionals spend up to **70-80%** of their time on cleaning, transforming, and preparing data rather than extracting insights.

AutoWrangler AI solves this by:
- ✅ **No manual coding** - Just describe what you need in natural language
- ✅ **Automatic understanding** - AI agents analyze your dataset and intent
- ✅ **Autonomous execution** - Plans and executes transformations automatically
- ✅ **ML-ready output** - Clean, enriched datasets ready for analytics, ML, or BI tools

## 🏗️ System Architecture

### Backend (Python/FastAPI)
- **Dataset Profiler** - Analyzes datasets and extracts metadata
- **Agent Orchestrator** with multiple specialized agents:
  - **Intent Understanding Agent** (Gemini) - Understands user goals
  - **Planning Agent** (Gemini) - Creates step-by-step transformation plans
  - **Execution Agent** (Python) - Performs deterministic data transformations
  - **Validation & Insight Agent** (Gemini) - Validates results and generates insights

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
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

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

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

6. Run the backend server:
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

1. **Upload Dataset**: Go to Dashboard and upload a CSV/Excel file
2. **Describe Intent**: In the chat interface, say something like:
   - "Clean this dataset and prepare it for machine learning classification"
   - "Remove null values and normalize numeric columns"
   - "Encode categorical variables and prepare for ML"
3. **Review Plan**: AI shows the transformation plan
4. **Get Results**: Download processed dataset with insights

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
- Google Gemini API (LLM)
- scikit-learn (ML preprocessing)
- NumPy (Numerical operations)

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
