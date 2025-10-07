#!/bin/bash

# Stop Document Intelligence Services
echo "🛑 Stopping Document Intelligence Services"
echo "========================================="

# Function to stop a service by PID file
stop_service() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "Stopping $service_name (PID: $pid)..."
            kill $pid
            rm "$pid_file"
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name process not found (PID: $pid)"
            rm "$pid_file"
        fi
    else
        echo "⚠️  No PID file found for $service_name"
    fi
}

# Stop all services
stop_service "AI Service" "logs/ai-service.pid"
stop_service "Backend API" "logs/backend.pid"
stop_service "Frontend" "logs/frontend.pid"

# Also try to kill by port (backup method)
echo ""
echo "🔍 Checking for any remaining processes on ports 3000, 5000, 8000..."

for port in 3000 5000 8000; do
    pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "Found process on port $port (PID: $pid), stopping..."
        kill $pid
    fi
done

echo ""
echo "✅ All services stopped!"
