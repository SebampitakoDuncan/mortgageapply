# Implementation Guide
## Westpac-Style Mortgage Application Assistant

**Version:** 1.0  
**Date:** December 2024  
**Based on:** Mortgage Application PRD v1.0  

---

## 1. Project Overview

### 1.1 Implementation Strategy
This guide provides step-by-step instructions to build the Mortgage Application Assistant based on the PRD requirements. The implementation follows a 4-week timeline with clear milestones and deliverables.

### 1.2 Technology Stack
- **Frontend:** React 18 + TypeScript + Material-UI
- **Backend:** Node.js + Express + TypeScript
- **AI Services:** Python + FastAPI + LangChain
- **Database:** PostgreSQL + Redis
- **Storage:** AWS S3
- **Deployment:** Docker + AWS EC2

---

## 2. Project Structure

### 2.1 Repository Organization
```
mortgage-application/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── routes/
│   ├── tests/
│   ├── package.json
│   └── Dockerfile
├── ai-services/              # Python AI services
│   ├── src/
│   │   ├── document_processing/
│   │   ├── chatbot/
│   │   ├── risk_assessment/
│   │   └── models/
│   ├── requirements.txt
│   └── Dockerfile
├── database/                 # Database scripts
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

---

## 3. Phase 1: Foundation (Week 1)

### 3.1 Project Setup

#### 3.1.1 Initialize Repositories
```bash
# Create main project directory
mkdir mortgage-application
cd mortgage-application

# Initialize git repository
git init
git remote add origin <your-repo-url>

# Create subdirectories
mkdir frontend backend ai-services database
```

#### 3.1.2 Frontend Setup (React + TypeScript)
```bash
cd frontend
npx create-react-app . --template typescript
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install react-router-dom
npm install @tanstack/react-query
npm install axios
npm install formik yup
npm install @types/node
```

**Frontend package.json:**
```json
{
  "name": "mortgage-frontend",
  "version": "1.0.0",
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.14.19",
    "@mui/material": "^5.14.20",
    "@tanstack/react-query": "^5.8.4",
    "axios": "^1.6.2",
    "formik": "^2.4.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "typescript": "^4.9.5",
    "yup": "^1.3.3"
  }
}
```

#### 3.1.3 Backend Setup (Node.js + Express)
```bash
cd ../backend
npm init -y
npm install express cors helmet morgan
npm install jsonwebtoken bcryptjs
npm install multer aws-sdk
npm install pg redis
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/express @types/cors @types/morgan
npm install -D @types/jsonwebtoken @types/bcryptjs
npm install -D @types/multer @types/pg
npm install -D typescript ts-node nodemon
```

**Backend package.json:**
```json
{
  "name": "mortgage-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5-lts.1",
    "aws-sdk": "^2.1490.0",
    "pg": "^8.11.3",
    "redis": "^4.6.10",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  }
}
```

#### 3.1.4 AI Services Setup (Python + FastAPI)
```bash
cd ../ai-services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn
pip install langchain openai
pip install python-multipart
pip install pillow pytesseract
pip install scikit-learn pandas numpy
pip install psycopg2-binary redis
```

**requirements.txt:**
```txt
fastapi==0.104.1
uvicorn==0.24.0
langchain==0.0.350
openai==1.3.7
python-multipart==0.0.6
pillow==10.1.0
pytesseract==0.3.10
scikit-learn==1.3.2
pandas==2.1.4
numpy==1.25.2
psycopg2-binary==2.9.9
redis==5.0.1
```

### 3.2 Database Setup

#### 3.2.1 PostgreSQL Schema
Create `database/schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    application_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    personal_info JSONB,
    property_details JSONB,
    loan_info JSONB,
    financial_info JSONB,
    risk_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_analysis JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat conversations table
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    application_id UUID REFERENCES applications(id),
    messages JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
```

#### 3.2.2 Docker Compose Setup
Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: mortgage_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/mortgage_app
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
    depends_on:
      - postgres
      - redis

  ai-services:
    build: ./ai-services
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/mortgage_app
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=your-openai-key
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

### 3.3 Basic Authentication System

#### 3.3.1 Backend Auth Middleware
Create `backend/src/middleware/auth.ts`:

```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user as any;
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

#### 3.3.2 User Model
Create `backend/src/models/User.ts`:

```typescript
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export class User {
  constructor(private db: Pool) {}

  async create(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, phone, role, created_at
    `;
    
    const values = [
      userData.email,
      hashedPassword,
      userData.firstName,
      userData.lastName,
      userData.phone,
      userData.role || 'customer'
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async findByEmail(email: string) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email]);
    return result.rows[0];
  }

  async findById(id: string) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  async validatePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
}
```

---

## 4. Phase 2: Core Features (Week 2)

### 4.1 Application Form Implementation

#### 4.1.1 Multi-Step Form Component
Create `frontend/src/components/ApplicationForm.tsx`:

```typescript
import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Box, Paper } from '@mui/material';
import PersonalInfoStep from './steps/PersonalInfoStep';
import PropertyDetailsStep from './steps/PropertyDetailsStep';
import LoanInfoStep from './steps/LoanInfoStep';
import FinancialInfoStep from './steps/FinancialInfoStep';
import DocumentUploadStep from './steps/DocumentUploadStep';
import ReviewStep from './steps/ReviewStep';

const steps = [
  'Personal Information',
  'Property Details',
  'Loan Information',
  'Financial Information',
  'Document Upload',
  'Review & Submit'
];

const ApplicationForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepData = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <PersonalInfoStep onNext={handleNext} onDataChange={handleStepData} />;
      case 1:
        return <PropertyDetailsStep onNext={handleNext} onBack={handleBack} onDataChange={handleStepData} />;
      case 2:
        return <LoanInfoStep onNext={handleNext} onBack={handleBack} onDataChange={handleStepData} />;
      case 3:
        return <FinancialInfoStep onNext={handleNext} onBack={handleBack} onDataChange={handleStepData} />;
      case 4:
        return <DocumentUploadStep onNext={handleNext} onBack={handleBack} onDataChange={handleStepData} />;
      case 5:
        return <ReviewStep onBack={handleBack} formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
      <Paper sx={{ padding: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ marginTop: 3 }}>
          {renderStepContent(activeStep)}
        </Box>
      </Paper>
    </Box>
  );
};

export default ApplicationForm;
```

#### 4.1.2 Personal Information Step
Create `frontend/src/components/steps/PersonalInfoStep.tsx`:

```typescript
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

interface PersonalInfoStepProps {
  onNext: () => void;
  onDataChange: (data: any) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ onNext, onDataChange }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    residencyStatus: '',
    employmentStatus: '',
    employerName: '',
    jobTitle: ''
  });

  const handleChange = (field: string) => (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    onDataChange({ personalInfo: { ...formData, [field]: value } });
  };

  const handleNext = () => {
    onDataChange({ personalInfo: formData });
    onNext();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Personal Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange('lastName')}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={handleChange('phone')}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange('dateOfBirth')}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Residency Status</InputLabel>
            <Select
              value={formData.residencyStatus}
              onChange={handleChange('residencyStatus')}
            >
              <MenuItem value="citizen">Australian Citizen</MenuItem>
              <MenuItem value="permanent">Permanent Resident</MenuItem>
              <MenuItem value="temporary">Temporary Resident</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Employment Status</InputLabel>
            <Select
              value={formData.employmentStatus}
              onChange={handleChange('employmentStatus')}
            >
              <MenuItem value="full-time">Full-time</MenuItem>
              <MenuItem value="part-time">Part-time</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>
              <MenuItem value="self-employed">Self-employed</MenuItem>
              <MenuItem value="unemployed">Unemployed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Employer Name"
            value={formData.employerName}
            onChange={handleChange('employerName')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Job Title"
            value={formData.jobTitle}
            onChange={handleChange('jobTitle')}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="contained" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default PersonalInfoStep;
```

### 4.2 Document Upload System

#### 4.2.1 Document Upload Component
Create `frontend/src/components/DocumentUpload.tsx`:

```typescript
import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert
} from '@mui/material';
import { CloudUpload, Delete, CheckCircle } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface DocumentUploadProps {
  onFilesChange: (files: File[]) => void;
  uploadedFiles: File[];
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onFilesChange, uploadedFiles }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...uploadedFiles, ...acceptedFiles];
    onFilesChange(newFiles);
  }, [uploadedFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 60 * 1024 * 1024 // 60MB
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const uploadFiles = async () => {
    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', 'identity'); // This would be dynamic

        // Simulate upload progress
        const progress = ((i + 1) / uploadedFiles.length) * 100;
        setUploadProgress(progress);

        // Here you would make the actual API call
        // await uploadDocument(formData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Document Upload
      </Typography>
      
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          or click to select files
        </Typography>
        <Typography variant="caption" display="block">
          Supported formats: PDF, JPG, PNG (Max 60MB)
        </Typography>
      </Paper>

      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files ({uploadedFiles.length})
          </Typography>
          
          <List>
            {uploadedFiles.map((file, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Uploading... {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={uploadFiles}
              disabled={uploading}
              startIcon={<CloudUpload />}
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DocumentUpload;
```

---

## 5. Phase 3: AI Integration (Week 3)

### 5.1 Document Processing AI Service

#### 5.1.1 FastAPI AI Service
Create `ai-services/src/main.py`:

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from document_processing.document_analyzer import DocumentAnalyzer
from chatbot.chat_service import ChatService
from risk_assessment.risk_engine import RiskEngine

app = FastAPI(title="Mortgage AI Services", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
document_analyzer = DocumentAnalyzer()
chat_service = ChatService()
risk_engine = RiskEngine()

@app.post("/analyze-document")
async def analyze_document(file: UploadFile = File(...)):
    try:
        # Read file content
        content = await file.read()
        
        # Analyze document
        analysis = await document_analyzer.analyze(content, file.filename)
        
        return {
            "success": True,
            "data": analysis,
            "message": "Document analyzed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_endpoint(message: str, application_id: str = None):
    try:
        response = await chat_service.get_response(message, application_id)
        
        return {
            "success": True,
            "data": {
                "message": response,
                "application_id": application_id
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/assess-risk")
async def assess_risk(application_data: dict):
    try:
        risk_score = await risk_engine.assess_risk(application_data)
        
        return {
            "success": True,
            "data": {
                "risk_score": risk_score,
                "recommendations": risk_engine.get_recommendations(risk_score)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### 5.1.2 Document Analyzer
Create `ai-services/src/document_processing/document_analyzer.py`:

```python
import os
from typing import Dict, Any
import pytesseract
from PIL import Image
import io
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA

class DocumentAnalyzer:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.llm = OpenAI(temperature=0)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )

    async def analyze(self, content: bytes, filename: str) -> Dict[str, Any]:
        """Analyze uploaded document and extract relevant information"""
        
        # Determine document type
        doc_type = self._classify_document(filename, content)
        
        # Extract text based on file type
        if filename.lower().endswith('.pdf'):
            text = self._extract_pdf_text(content)
        else:
            text = self._extract_image_text(content)
        
        # Process with LangChain
        processed_text = self._process_with_langchain(text, doc_type)
        
        return {
            "document_type": doc_type,
            "extracted_text": text,
            "processed_data": processed_text,
            "confidence_score": 0.85,  # This would be calculated
            "verification_status": "pending"
        }

    def _classify_document(self, filename: str, content: bytes) -> str:
        """Classify document type based on filename and content"""
        filename_lower = filename.lower()
        
        if any(keyword in filename_lower for keyword in ['passport', 'license', 'id']):
            return 'identity'
        elif any(keyword in filename_lower for keyword in ['payslip', 'salary', 'income']):
            return 'income'
        elif any(keyword in filename_lower for keyword in ['bank', 'statement']):
            return 'bank_statement'
        elif any(keyword in filename_lower for keyword in ['property', 'valuation']):
            return 'property'
        else:
            return 'other'

    def _extract_pdf_text(self, content: bytes) -> str:
        """Extract text from PDF using LangChain"""
        try:
            # Save content to temporary file
            with open('temp.pdf', 'wb') as f:
                f.write(content)
            
            loader = PyPDFLoader('temp.pdf')
            documents = loader.load()
            
            # Clean up temp file
            os.remove('temp.pdf')
            
            return ' '.join([doc.page_content for doc in documents])
        except Exception as e:
            print(f"PDF extraction error: {e}")
            return ""

    def _extract_image_text(self, content: bytes) -> str:
        """Extract text from image using OCR"""
        try:
            image = Image.open(io.BytesIO(content))
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            print(f"OCR extraction error: {e}")
            return ""

    def _process_with_langchain(self, text: str, doc_type: str) -> Dict[str, Any]:
        """Process extracted text with LangChain for data extraction"""
        
        # Split text into chunks
        texts = self.text_splitter.split_text(text)
        
        # Create embeddings and vector store
        # Note: In production, you'd use a persistent vector store
        # For this example, we'll simulate the processing
        
        if doc_type == 'identity':
            return self._extract_identity_data(text)
        elif doc_type == 'income':
            return self._extract_income_data(text)
        elif doc_type == 'bank_statement':
            return self._extract_bank_data(text)
        else:
            return {"raw_text": text, "type": doc_type}

    def _extract_identity_data(self, text: str) -> Dict[str, Any]:
        """Extract identity information from document"""
        # This would use LangChain with OpenAI to extract structured data
        return {
            "document_number": "Extracted from text",
            "full_name": "Extracted from text",
            "date_of_birth": "Extracted from text",
            "expiry_date": "Extracted from text"
        }

    def _extract_income_data(self, text: str) -> Dict[str, Any]:
        """Extract income information from document"""
        return {
            "gross_income": "Extracted from text",
            "net_income": "Extracted from text",
            "employer": "Extracted from text",
            "pay_period": "Extracted from text"
        }

    def _extract_bank_data(self, text: str) -> Dict[str, Any]:
        """Extract bank statement information"""
        return {
            "account_balance": "Extracted from text",
            "transaction_history": "Extracted from text",
            "account_type": "Extracted from text"
        }
```

### 5.2 Chatbot Integration

#### 5.2.1 Chat Service
Create `ai-services/src/chatbot/chat_service.py`:

```python
from langchain.llms import OpenAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate

class ChatService:
    def __init__(self):
        self.llm = OpenAI(temperature=0.7)
        self.memory = ConversationBufferMemory()
        
        # Create conversation chain
        self.conversation = ConversationChain(
            llm=self.llm,
            memory=self.memory,
            verbose=True
        )

    async def get_response(self, message: str, application_id: str = None) -> str:
        """Get chatbot response for user message"""
        
        # Add context about mortgage application if provided
        if application_id:
            context = f"User is working on mortgage application {application_id}. "
        else:
            context = "User is asking about mortgage applications. "
        
        # Create prompt template
        prompt_template = PromptTemplate(
            input_variables=["input"],
            template=f"""You are a helpful assistant for a mortgage application system. 
            {context}
            Provide helpful, accurate information about the mortgage application process.
            
            Human: {{input}}
            Assistant:"""
        )
        
        # Get response
        response = self.conversation.predict(input=message)
        
        return response

    def reset_conversation(self):
        """Reset conversation memory"""
        self.memory.clear()
```

---

## 6. Phase 4: Polish & Deploy (Week 4)

### 6.1 Testing Implementation

#### 6.1.1 Frontend Tests
Create `frontend/src/components/__tests__/ApplicationForm.test.tsx`:

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApplicationForm from '../ApplicationForm';

describe('ApplicationForm', () => {
  test('renders first step (Personal Information)', () => {
    render(<ApplicationForm />);
    
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  test('validates required fields', () => {
    render(<ApplicationForm />);
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Should show validation errors
    expect(screen.getByText('First Name is required')).toBeInTheDocument();
  });

  test('navigates to next step when form is valid', () => {
    render(<ApplicationForm />);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Property Details')).toBeInTheDocument();
  });
});
```

#### 6.1.2 Backend Tests
Create `backend/tests/auth.test.ts`:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('Authentication', () => {
  test('POST /api/auth/register - should create new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(userData.email);
  });

  test('POST /api/auth/login - should authenticate user', async () => {
    // First register a user
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Then login
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### 6.2 Deployment Configuration

#### 6.2.1 Production Docker Compose
Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=${API_URL}
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_S3_BUCKET=${AWS_S3_BUCKET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  ai-services:
    build: 
      context: ./ai-services
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 6.2.2 GitHub Actions CI/CD
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd frontend && npm ci
        cd ../backend && npm ci
    
    - name: Run tests
      run: |
        cd frontend && npm test -- --coverage --watchAll=false
        cd ../backend && npm test
    
    - name: Build applications
      run: |
        cd frontend && npm run build
        cd ../backend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to AWS
      run: |
        # Add your deployment commands here
        echo "Deploying to production..."
```

---

## 7. Development Timeline

### Week 1: Foundation
- [ ] Project setup and repository structure
- [ ] Database schema and Docker configuration
- [ ] Basic authentication system
- [ ] API structure and documentation

### Week 2: Core Features
- [ ] Multi-step application form
- [ ] Document upload system
- [ ] Application tracking dashboard
- [ ] Basic API endpoints

### Week 3: AI Integration
- [ ] Document processing AI service
- [ ] Chatbot implementation
- [ ] Risk assessment engine
- [ ] AI service integration

### Week 4: Polish & Deploy
- [ ] Testing implementation
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Production deployment

---

## 8. Key Deliverables

### 8.1 Technical Deliverables
- [ ] Complete React application with TypeScript
- [ ] Node.js API with Express and Swagger documentation
- [ ] Python AI services with LangChain integration
- [ ] PostgreSQL database with proper schema
- [ ] Docker containerization
- [ ] CI/CD pipeline with GitHub Actions
- [ ] AWS deployment configuration

### 8.2 Documentation Deliverables
- [ ] API documentation (Swagger)
- [ ] README with setup instructions
- [ ] Code comments and JSDoc
- [ ] Database schema documentation
- [ ] Deployment guide

### 8.3 Testing Deliverables
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests
- [ ] End-to-end tests
- [ ] Performance tests
- [ ] Security tests

---

This implementation guide provides a comprehensive roadmap for building the Mortgage Application Assistant. Each phase builds upon the previous one, ensuring a solid foundation while progressively adding advanced features. The focus on real-world banking processes and modern technology stack makes this an excellent portfolio project for demonstrating full-stack engineering capabilities.
