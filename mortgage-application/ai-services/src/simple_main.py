#!/usr/bin/env python3
"""
Simple, Fast AI Service for Document Intelligence
Optimized for speed - October 2025
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from fast_pdf_extractor import extract_pdf_text_fast
import time

app = FastAPI(title="Fast Document Intelligence API", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Fast Document Intelligence API",
        "version": "2.0.0",
        "optimized": "October 2025"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "fast-document-intelligence",
        "timestamp": time.time()
    }

@app.post("/extract-text")
async def extract_text_from_document(file: UploadFile = File(...)):
    """
    Ultra-fast text extraction from PDF or image files
    """
    try:
        start_time = time.time()
        
        # Validate file type
        if not file.content_type:
            raise HTTPException(status_code=400, detail="File type not specified")
        
        # Read file content
        content = await file.read()
        
        if file.content_type == 'application/pdf':
            # Use our fast PDF extractor
            result = extract_pdf_text_fast(content, file.filename)
            
            if 'error' in result:
                raise HTTPException(status_code=500, detail=result['error'])
            
            total_time = (time.time() - start_time) * 1000
            
            return {
                "success": True,
                "data": {
                    "filename": file.filename,
                    "file_type": file.content_type,
                    "extracted_text": result["text"],
                    "confidence_score": 0.95,  # High confidence for direct PDF text
                    "processing_method": result["method"],
                    "word_count": len(result["text"].split()) if result["text"] else 0,
                    "page_count": result["page_count"],
                    "extraction_time_ms": result["time_ms"],
                    "total_time_ms": total_time
                },
                "message": f"Text extracted in {total_time:.1f}ms using {result['method']}"
            }
        
        elif file.content_type in ['image/jpeg', 'image/jpg', 'image/png']:
            # For images, we'd need OCR - but let's keep it simple for now
            return {
                "success": False,
                "error": {
                    "code": "OCR_NOT_IMPLEMENTED",
                    "message": "Image OCR not implemented in fast mode. Use PDF files for instant text extraction."
                }
            }
        
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file.content_type}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/analyze-document")
async def analyze_document_structure(file: UploadFile = File(...)):
    """
    Fast document analysis - simplified version
    """
    try:
        # For now, just do text extraction and basic analysis
        extract_result = await extract_text_from_document(file)
        
        if not extract_result["success"]:
            return extract_result
        
        text = extract_result["data"]["extracted_text"]
        
        # Simple document type detection
        text_lower = text.lower()
        doc_type = "general_document"
        
        if any(word in text_lower for word in ['passport', 'driver license', 'identification']):
            doc_type = 'identity_document'
        elif any(word in text_lower for word in ['salary', 'wages', 'gross pay', 'net pay']):
            doc_type = 'income_document'
        elif any(word in text_lower for word in ['account balance', 'transaction', 'bank']):
            doc_type = 'bank_statement'
        elif any(word in text_lower for word in ['property', 'valuation', 'appraisal']):
            doc_type = 'property_document'
        
        # Extract basic fields (simplified)
        fields = {}
        
        # Look for dates
        import re
        date_pattern = r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b'
        dates = re.findall(date_pattern, text)
        if dates:
            fields['dates_found'] = dates[:3]
        
        # Look for amounts
        amount_pattern = r'\$[\d,]+\.?\d*'
        amounts = re.findall(amount_pattern, text)
        if amounts:
            fields['amounts_found'] = amounts[:5]
        
        return {
            "success": True,
            "data": {
                "filename": file.filename,
                "document_type": doc_type,
                "extracted_fields": fields,
                "confidence_score": 0.80,
                "raw_text": text[:500] + "..." if len(text) > 500 else text,  # Truncate for response size
                "suggestions": ["Document processed successfully with fast analysis."]
            },
            "message": "Document analyzed successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting Fast Document Intelligence API on port {port}")
    print("📄 Optimized for lightning-fast PDF text extraction")
    uvicorn.run(app, host="0.0.0.0", port=port)
