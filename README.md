# Clinic Patient Queue

## Tech Stack

### Frontend

- **React**
- **JavaScript**
- **CSS**

### Backend

- **FastAPI** – Python web framework for APIs
- **Uvicorn** – ASGI server to run FastAPI
- **Pydantic** – Data validation
- **JSON** – Storage

---

## Quick Start

### 1. Clone the repository

```powershell
git clone https://github.com/101rror/myClinic.git
cd myClinic
```

### 1. Start Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate

pip install fastapi uvicorn
uvicorn app.main:app --reload --port 8000
```

### 2. Start Frontend

```powershell
cd frontend
npm install
npm run dev
```
