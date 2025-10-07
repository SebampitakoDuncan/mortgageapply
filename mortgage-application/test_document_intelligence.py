#!/usr/bin/env python3
"""
Test script for document intelligence feature
"""
import requests
import os
import sys

def test_ai_service_health():
    """Test if the AI service is running"""
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            print("✅ AI Service is running")
            return True
        else:
            print(f"❌ AI Service returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ AI Service is not running: {e}")
        return False

def test_backend_api():
    """Test if the backend API is running"""
    try:
        response = requests.get('http://localhost:5000/api/documents/test', timeout=5)
        if response.status_code in [200, 401]:  # 401 is expected without auth
            print("✅ Backend API is running")
            return True
        else:
            print(f"❌ Backend API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend API is not running: {e}")
        return False

def test_frontend():
    """Test if the frontend is running"""
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running")
            return True
        else:
            print(f"❌ Frontend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend is not running: {e}")
        return False

def main():
    print("🧪 Testing Document Intelligence Setup")
    print("=" * 50)
    
    # Test all services
    ai_service_ok = test_ai_service_health()
    backend_ok = test_backend_api()
    frontend_ok = test_frontend()
    
    print("\n📋 Summary:")
    print(f"AI Service (Port 8000): {'✅' if ai_service_ok else '❌'}")
    print(f"Backend API (Port 5000): {'✅' if backend_ok else '❌'}")
    print(f"Frontend (Port 3000): {'✅' if frontend_ok else '❌'}")
    
    if ai_service_ok and backend_ok and frontend_ok:
        print("\n🎉 All services are running! You can now test document intelligence.")
        print("\nTo test:")
        print("1. Go to http://localhost:3000")
        print("2. Login/register")
        print("3. Create an application")
        print("4. Upload a PDF or image document")
        print("5. Click the text extraction or analysis buttons")
    else:
        print("\n⚠️  Some services are not running. Please start them:")
        if not ai_service_ok:
            print("   - Start AI service: cd ai-services && python src/main.py")
        if not backend_ok:
            print("   - Start backend: cd backend && npm run dev")
        if not frontend_ok:
            print("   - Start frontend: cd frontend && npm start")

if __name__ == "__main__":
    main()
