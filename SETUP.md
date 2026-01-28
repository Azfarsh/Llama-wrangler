# Setup Guide - AutoWrangler AI

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
copy .env.example .env  # Windows
# or
cp .env.example .env   # macOS/Linux

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_api_key_here

# Run the backend server
python main.py
```

Backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 3. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to `backend/.env`

## Testing the Application

1. Open `http://localhost:5173` in your browser
2. Sign up for an account (stored in localStorage)
3. Go to Dashboard
4. Upload a CSV or Excel file
5. In the Processing page, type: "Clean this dataset and prepare it for machine learning classification"
6. Wait for the agents to process
7. Download the cleaned dataset

## Troubleshooting

### Backend Issues

- **Port 8000 already in use**: Change port in `main.py` or kill the process using port 8000
- **Gemini API errors**: Check your API key in `.env` file
- **Import errors**: Make sure virtual environment is activated and dependencies are installed

### Frontend Issues

- **Port 5173 already in use**: Vite will automatically use the next available port
- **CORS errors**: Make sure backend is running and CORS is configured correctly
- **API connection errors**: Check that backend is running on `http://localhost:8000`

### Common Issues

- **File upload fails**: Check file size (max 50MB recommended) and format (CSV/Excel)
- **Transformations fail**: Check dataset format and ensure columns exist
- **Gemini API rate limits**: Free tier has rate limits; wait a few seconds between requests

## Project Structure

```
backend/
├── app/
│   ├── api/endpoints.py      # API routes
│   ├── core/config.py        # Configuration
│   └── services/             # Business logic
│       ├── data_service.py   # Data operations
│       └── llm_service.py    # LLM integration
├── main.py                   # FastAPI app
├── requirements.txt          # Python deps
└── uploads/                  # Uploaded files

frontend/
├── src/
│   ├── pages/               # React pages
│   ├── components/          # Reusable components
│   └── App.jsx             # Main app
├── package.json            # Node deps
└── vite.config.js          # Vite config
```

## Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=your_api_key_here
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the API endpoints in `backend/app/api/endpoints.py`
- Explore the frontend pages in `frontend/src/pages/`

## Support

For issues or questions, check:
- Backend logs in terminal
- Browser console for frontend errors
- Network tab for API request/response details
