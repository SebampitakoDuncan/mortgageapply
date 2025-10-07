#!/bin/bash

# Document Intelligence Feature Startup Script
echo "🚀 Starting Document Intelligence Services"
echo "=========================================="

# Check if we're in the right directory
if [ ! -d "ai-services" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the mortgage-application directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Install Python dependencies if needed
echo "📦 Setting up Python AI Service..."
cd ai-services

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment and installing dependencies..."
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo "🧠 Starting AI Service on port 8000..."
if check_port 8000; then
    echo "⚠️  Port 8000 is already in use. AI service might already be running."
else
    # Start AI service in background
    nohup python src/main.py > ../logs/ai-service.log 2>&1 &
    echo $! > ../logs/ai-service.pid
    echo "✅ AI Service started (PID: $(cat ../logs/ai-service.pid))"
fi

cd ..

# Install Node.js dependencies and start backend
echo "🔧 Starting Backend API on port 5000..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if check_port 5000; then
    echo "⚠️  Port 5000 is already in use. Backend might already be running."
else
    # Start backend in background
    nohup npm run dev > ../logs/backend.log 2>&1 &
    echo $! > ../logs/backend.pid
    echo "✅ Backend started (PID: $(cat ../logs/backend.pid))"
fi

cd ..

# Install Node.js dependencies and start frontend
echo "🎨 Starting Frontend on port 3000..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

if check_port 3000; then
    echo "⚠️  Port 3000 is already in use. Frontend might already be running."
else
    # Start frontend in background
    nohup npm start > ../logs/frontend.log 2>&1 &
    echo $! > ../logs/frontend.pid
    echo "✅ Frontend started (PID: $(cat ../logs/frontend.pid))"
fi

cd ..

# Create logs directory if it doesn't exist
mkdir -p logs

echo ""
echo "🎉 Document Intelligence services are starting up!"
echo ""
echo "Services:"
echo "- AI Service:    http://localhost:8000"
echo "- Backend API:   http://localhost:5000"
echo "- Frontend:      http://localhost:3000"
echo ""
echo "📋 To test the setup, run:"
echo "python test_document_intelligence.py"
echo ""
echo "📝 To stop all services, run:"
echo "./stop_services.sh"
echo ""
echo "📊 To view logs:"
echo "tail -f logs/ai-service.log"
echo "tail -f logs/backend.log"
echo "tail -f logs/frontend.log"
