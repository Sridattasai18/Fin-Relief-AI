# FinRelief AI
### AI-Powered Debt Settlement & Negotiation Platform

FinRelief AI is a production-grade full-stack web application designed to help individuals understand their debt stress, simulate settlement options, and generate professional negotiation letters. It replaces the original proof-of-concept prototype with a modern, decoupled architecture: a pure FastAPI JSON API backend coupled with a React SPA frontend.

This application is built with a Cloud-first database layer (Neon PostgreSQL) and incorporates Google Gemini AI to draft context-specific creditor communication, backed by a robust offline template engine.

---

## 🛠️ The Tech Stack

### Backend (`/backend`)
- **FastAPI:** Python ASGI web framework providing type-safe JSON endpoints.
- **SQLAlchemy:** Modern database toolkit mapped to our PostgreSQL models.
- **Neon Database:** Serverless PostgreSQL cloud instance for secure, durable data persistence.
- **Google Gemini AI (`gemini-1.5-flash`):** Automates the drafting of custom negotiation letters.
- **JWT Authentication:** Stateful token blacklist in-memory + bcrypt password hashing.
- **ReportLab:** Generates on-the-fly professional PDFs for download.

### Frontend (`/frontend`)
- **React + Vite:** Superfast modern build toolchain and SPA architecture.
- **Tailwind CSS (v4):** Core styling engine with a customized "warm editorial" design system.
- **Recharts & inline SVGs:** Data visualization of DTI and stress-score histories.
- **Axios:** Authenticated client with automatic request interception and 401 redirect logic.

---

## 🔑 Required Environment Variables (Names Only)

To run the application locally or in production, you need to configure the following environment variables.

### Backend (`/backend/.env`)
- `DATABASE_URL`: Connection URI to your PostgreSQL instance.
- `FINRELIEF_SECRET_KEY`: High-entropy hex string used for signing JWT access tokens.
- `GEMINI_API_KEY`: Google AI Studio credentials for writing negotiation letters.
- `FRONTEND_URL`: CORS configuration URL (points to Vite dev server locally, or your deployed Vercel URL in production).

### Frontend (`/frontend/.env` or `.env.local`)
- `VITE_API_URL`: Root path of your backend server (defaults to localhost:8000).

---

## 💻 Local Development Setup

Ensure you have Python 3.10+ and Node.js 18+ installed on your system.

### 1. Backend Setup

1. Open a terminal in the `/backend` folder:
   ```bash
   cd backend
   ```
2. Create your local environment file:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to supply your database, secret key, and optional Gemini credentials.*
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

*The API documentation is accessible interactively at [http://localhost:8000/docs](http://localhost:8000/docs).*

### 2. Frontend Setup

1. Open a new terminal in the `/frontend` folder:
   ```bash
   cd frontend
   ```
2. Create your local environment file:
   ```bash
   cp .env.example .env
   ```
   *By default, the Vite dev proxy matches http://localhost:8000 for local requests.*
3. Install packages:
   ```bash
   npm install
   ```
4. Start the Vite hot-reloading dev server:
   ```bash
   npm run dev
   ```

*Open your browser to [http://localhost:5173](http://localhost:5173) to see the application in action.*

---

## 🚀 Deployed Demo
*Live demo links (Render backend + Vercel frontend) will be added here shortly once the deployment pipeline completes.*

---

## 📝 Disclaimer
FinRelief AI is created for educational and informational purposes. The metrics and recommendation models do not constitute professional financial or legal counsel. Consult a qualified advisor before negotiating with creditors.
