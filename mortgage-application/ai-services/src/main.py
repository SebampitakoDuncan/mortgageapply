from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from document_intelligence.document_processor import DocumentProcessor
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Mortgage AI Services - Document Intelligence", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize document processor
document_processor = DocumentProcessor()

@app.get("/")
async def root():
    return {"message": "Mortgage AI Services - Document Intelligence API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "document-intelligence"}

@app.post("/extract-text")
async def extract_text_from_document(file: UploadFile = File(...)):
    """
    Extract text from uploaded document (PDF or image)
    """
    try:
        # Validate file type
        allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file.content_type}. Supported types: PDF, JPEG, PNG"
            )
        
        # Read file content
        content = await file.read()
        
        # Process document based on type
        if file.content_type == 'application/pdf':
            result = await document_processor.extract_text_from_pdf(content, file.filename)
        else:
            result = await document_processor.extract_text_from_image(content, file.filename)
        
        return {
            "success": True,
            "data": {
                "filename": file.filename,
                "file_type": file.content_type,
                "extracted_text": result["text"],
                "confidence_score": result["confidence"],
                "processing_method": result["method"],
                "page_count": result.get("page_count", 1),
                "word_count": len(result["text"].split()) if result["text"] else 0
            },
            "message": "Text extracted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

@app.post("/analyze-document")
async def analyze_document_structure(file: UploadFile = File(...)):
    """
    Analyze document structure and extract structured data
    """
    try:
        content = await file.read()
        
        # Get basic text extraction first
        if file.content_type == 'application/pdf':
            text_result = await document_processor.extract_text_from_pdf(content, file.filename)
        else:
            text_result = await document_processor.extract_text_from_image(content, file.filename)
        
        # Analyze document structure
        analysis = await document_processor.analyze_document_structure(text_result["text"], file.filename)
        
        return {
            "success": True,
            "data": {
                "filename": file.filename,
                "document_type": analysis["document_type"],
                "extracted_fields": analysis["fields"],
                "confidence_score": analysis["confidence"],
                "raw_text": text_result["text"],
                "suggestions": analysis.get("suggestions", [])
            },
            "message": "Document analyzed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document analysis failed: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
