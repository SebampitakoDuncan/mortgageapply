#!/usr/bin/env python3
"""
Simple, Fast AI Service for Document Intelligence
Optimized for speed - October 2025
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import requests
import json
from dotenv import load_dotenv
from fast_pdf_extractor import extract_pdf_text_fast
import time

# Load environment variables
load_dotenv()

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

@app.post("/analyze-with-llm")
async def analyze_document_with_llm(file: UploadFile = File(...)):
    """
    Advanced document analysis using GPT-OSS 20B for mortgage banking expertise
    """
    try:
        start_time = time.time()
        
        # First extract text from the document
        extract_result = await extract_text_from_document(file)
        
        if not extract_result["success"]:
            return extract_result
        
        extracted_text = extract_result["data"]["extracted_text"]
        
        if not extracted_text or len(extracted_text.strip()) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Insufficient text content for meaningful analysis"
            )
        
        # Get OpenRouter API key from environment
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        print(f"DEBUG: Environment variables: {list(os.environ.keys())}")
        print(f"DEBUG: OPENROUTER_API_KEY exists: {bool(openrouter_api_key)}")
        if not openrouter_api_key:
            print("ERROR: OpenRouter API key not found in environment")
            raise HTTPException(
                status_code=500, 
                detail="OpenRouter API key not configured"
            )
        
        print(f"Using OpenRouter API key: {openrouter_api_key[:10]}...")
        
        # Prepare the system prompt for mortgage banking analysis
        system_prompt = """You are an expert mortgage house banker and document analyst with over 20 years of experience in residential and commercial lending. Your expertise includes:

- Document verification and authenticity assessment
- Income and employment verification
- Asset and liability evaluation  
- Credit risk assessment
- Regulatory compliance (NCCP, APRA guidelines)
- Property valuation analysis
- Loan serviceability calculations

Analyze the provided document text and provide a comprehensive mortgage banking assessment. Focus on:

1. **Document Type & Purpose**: Identify what type of document this is and its relevance to mortgage applications
2. **Key Financial Information**: Extract and analyze any financial data, income figures, assets, liabilities
3. **Verification Points**: Highlight information that would need verification or raises questions
4. **Risk Assessment**: Identify any potential risks or red flags from a lending perspective
5. **Compliance Notes**: Note any regulatory or compliance considerations
6. **Recommendations**: Provide specific recommendations for loan officers or underwriters

Format your response as a structured analysis with clear sections. Be thorough but concise, focusing on actionable insights for mortgage decision-making."""

        user_prompt = f"""Please analyze this document text from a mortgage banking perspective:

DOCUMENT TEXT:
{extracted_text[:4000]}  # Limit to first 4000 chars to stay within token limits

Provide a comprehensive analysis following the structure outlined in your system instructions."""

        # Call OpenRouter API with GPT-OSS 20B
        headers = {
            "Authorization": f"Bearer {openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Mortgage Document Intelligence"
        }
        
        payload = {
            "model": "openai/gpt-oss-20b:free",  # Using GPT-OSS 20B free variant as requested
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 2000,
            "temperature": 0.3,  # Lower temperature for more consistent analysis
            "top_p": 0.9
        }
        
        # Make the API call
        print(f"Making OpenRouter API call with model: {payload['model']}")
        print(f"Request headers: {headers}")
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        print(f"OpenRouter API response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"OpenRouter API error response: {response.text}")
            print(f"Response headers: {dict(response.headers)}")
            
            # Check if it's an authentication issue
            if response.status_code == 401:
                error_detail = "Authentication failed. Please check your OpenRouter API key. You may need to create a new API key at https://openrouter.ai/keys"
            else:
                error_detail = f"OpenRouter API error: {response.status_code} - {response.text}"
                
            raise HTTPException(
                status_code=500,
                detail=error_detail
            )
        
        response_data = response.json()
        
        if not response_data.get("choices") or not response_data["choices"][0].get("message"):
            raise HTTPException(
                status_code=500,
                detail="Invalid response from OpenRouter API"
            )
        
        llm_analysis = response_data["choices"][0]["message"]["content"]
        
        # Calculate processing time
        total_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "data": {
                "filename": file.filename,
                "document_type": "mortgage_document_analysis",
                "extracted_text": extracted_text,
                "llm_analysis": llm_analysis,
                "model_used": "openai/gpt-oss-20b:free",
                "confidence_score": 0.92,
                "word_count": len(extracted_text.split()) if extracted_text else 0,
                "analysis_time_ms": total_time,
                "tokens_analyzed": len(extracted_text[:4000].split())
            },
            "message": f"Advanced mortgage banking analysis completed in {total_time:.1f}ms"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: LLM Analysis exception: {str(e)}")
        print(f"ERROR: Exception type: {type(e)}")
        import traceback
        print(f"ERROR: Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"LLM Analysis failed: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting Fast Document Intelligence API on port {port}")
    print("📄 Optimized for lightning-fast PDF text extraction")
    print("🧠 Enhanced with GPT-OSS 20B mortgage banking analysis")
    uvicorn.run(app, host="0.0.0.0", port=port)
