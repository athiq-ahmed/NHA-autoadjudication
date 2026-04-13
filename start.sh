#!/bin/bash

echo "===================================="
echo "NHA Claims Auto-Adjudication System"
echo "Starting Full Stack Application"
echo "===================================="
echo ""

if ! command -v python3.11 &> /dev/null
then
    echo "ERROR: Python 3.11 is not installed"
    exit 1
fi

if ! command -v node &> /dev/null
then
    echo "ERROR: Node.js is not installed"
    exit 1
fi

echo "Python version:"
python3.11 --version
echo ""
echo "Node.js version:"
node --version
echo ""

echo "Starting Backend API server (FastAPI on port 8000)..."
cd backend
python3.11 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
sleep 2
cd ..

echo "Starting Frontend development server (Next.js on port 3000)..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
sleep 2
cd ..

echo ""
echo "===================================="
echo "Application Started Successfully"
echo "===================================="
echo ""
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo ""
echo "Process IDs:"
echo "Backend:  $BACKEND_PID"
echo "Frontend: $FRONTEND_PID"
echo ""
echo "To stop the application, run:"
echo "kill $BACKEND_PID $FRONTEND_PID"
echo ""

wait
