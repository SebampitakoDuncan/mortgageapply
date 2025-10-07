# Westpac-Style Mortgage Application Assistant

A full-stack web application that replicates and enhances Westpac Bank's home loan application process, demonstrating advanced technical skills including React development, Node.js API engineering, Python AI integration, and modern DevOps practices.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │   Mobile App    │
│   (Frontend)    │    │   (Future)      │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      API Gateway          │
                    │  (Express.js + Auth)      │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐    ┌──────────▼──────────┐    ┌─────────▼─────────┐
│  Application   │    │   Document          │    │   AI Services     │
│  Service       │    │   Service           │    │   (Python)        │
│  (Node.js)     │    │   (Node.js)         │    │                   │
└─────────────────┘    └────────────────────┘    └───────────────────┘
        │                         │                         │
        └─────────────────────────┼─────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │      Data Layer           │
                    │  (PostgreSQL + Redis)     │
                    └───────────────────────────┘
```

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI** for components
- **React Router** for navigation
- **React Query** for state management
- **Axios** for API calls

### Backend
- **Node.js 18** with Express.js
- **TypeScript** for type safety
- **JWT** for authentication
- **Multer** for file uploads
- **Swagger** for API documentation

### AI Services
- **Python 3.9+** with FastAPI
- **LangChain** for AI workflows
- **OpenAI API** integration
- **scikit-learn** for ML models

### Database
- **PostgreSQL** for structured data
- **Redis** for caching and sessions
- **AWS S3** for file storage

### DevOps
- **Docker** for containerization
- **AWS EC2** for hosting
- **GitHub Actions** for CI/CD
- **Nginx** for reverse proxy

## 📋 Features

### Core Features
- ✅ **Multi-Step Application Form** (6 steps matching Westpac's workflow)
- ✅ **Document Upload System** with drag-and-drop functionality
- ✅ **AI Chatbot Assistant** for customer support
- ✅ **Application Tracking Dashboard** with real-time updates
- ✅ **Bank Staff Dashboard** for application processing

### AI-Powered Features
- ✅ **Document Intelligence** (OCR, classification, data extraction)
- ✅ **Risk Assessment Engine** (credit analysis, fraud detection)
- ✅ **Conversational AI** (context-aware chatbot)

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker and Docker Compose
- PostgreSQL 15
- Redis 7

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mortgage-application
   ```

2. **Start development environment**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - AI Services: http://localhost:8000
   - API Documentation: http://localhost:5000/api-docs

### Manual Setup

1. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **AI Services Setup**
   ```bash
   cd ai-services
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python src/main.py
   ```

## 📊 Project Status

### Phase 1: Foundation (Week 1)
- [x] Project setup and repository structure
- [ ] Database schema implementation
- [ ] Basic authentication system
- [ ] API structure setup

### Phase 2: Core Features (Week 2)
- [ ] Application form implementation
- [ ] Document upload system
- [ ] Basic dashboard functionality
- [ ] API endpoints development

### Phase 3: AI Integration (Week 3)
- [ ] Document processing AI
- [ ] Chatbot implementation
- [ ] Risk assessment engine
- [ ] AI service integration

### Phase 4: Polish & Deploy (Week 4)
- [ ] UI/UX improvements
- [ ] Testing and bug fixes
- [ ] Performance optimization
- [ ] Production deployment

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test

# Run AI services tests
cd ai-services && python -m pytest
```

## 📚 Documentation

- [Product Requirements Document](../MORTGAGE_APPLICATION_PRD.md)
- [Implementation Guide](../IMPLEMENTATION_GUIDE.md)
- [API Documentation](http://localhost:5000/api-docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for portfolio demonstration purposes only.

## 🎯 Portfolio Goals

This project demonstrates:
- **Full-Stack Development** (React, Node.js, Python)
- **AI Integration** (LangChain, OpenAI, ML models)
- **Modern DevOps** (Docker, CI/CD, AWS)
- **Banking Domain Knowledge** (Mortgage processes)
- **Professional Development** (Clean code, testing, documentation)

---

**Built with ❤️ for the Westpac Mortgages Technology team**
