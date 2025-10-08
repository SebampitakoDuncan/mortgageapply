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
import re
import tempfile
import subprocess

# Load environment variables
load_dotenv()

async def _extract_pdf_with_ocr(pdf_content: bytes, filename: str) -> dict:
    """
    Extract text from PDF using OCR (for scanned PDFs)
    Uses pdf2image + tesseract for OCR processing
    """
    try:
        # Check if required tools are available
        try:
            subprocess.run(['pdftoppm', '-h'], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise Exception("pdftoppm not available. Install poppler-utils: brew install poppler")
        
        try:
            subprocess.run(['tesseract', '--version'], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise Exception("tesseract not available. Install tesseract: brew install tesseract")
        
        # Create temporary files
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
            temp_pdf.write(pdf_content)
            temp_pdf_path = temp_pdf.name
        
        try:
            # Convert PDF pages to images using pdftoppm
            with tempfile.TemporaryDirectory() as temp_dir:
                # Convert PDF to PNG images
                subprocess.run([
                    'pdftoppm', 
                    '-png', 
                    '-r', '300',  # 300 DPI for good OCR quality
                    temp_pdf_path, 
                    f'{temp_dir}/page'
                ], check=True, capture_output=True)
                
                # Find all generated image files
                import glob
                image_files = sorted(glob.glob(f'{temp_dir}/page-*.png'))
                
                if not image_files:
                    raise Exception("No images generated from PDF")
                
                # OCR each page
                all_text = []
                for image_file in image_files:
                    try:
                        # Run tesseract OCR
                        result = subprocess.run([
                            'tesseract', 
                            image_file, 
                            'stdout',
                            '-l', 'eng',  # English language
                            '--psm', '1'  # Automatic page segmentation with OSD
                        ], capture_output=True, text=True, check=True)
                        
                        page_text = result.stdout.strip()
                        if page_text:
                            all_text.append(page_text)
                    
                    except subprocess.CalledProcessError as e:
                        print(f"OCR failed for {image_file}: {e}")
                        continue
                
                combined_text = '\n\n'.join(all_text)
                
                return {
                    "text": combined_text,
                    "method": "OCR (tesseract)",
                    "pages_processed": len(image_files),
                    "pages_with_text": len(all_text)
                }
        
        finally:
            os.unlink(temp_pdf_path)
    
    except Exception as e:
        print(f"OCR processing failed: {str(e)}")
        return {"text": "", "error": str(e)}

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
            
            # Check if text extraction was successful (more than just whitespace)
            extracted_text = result["text"].strip()
            word_count = len(extracted_text.split()) if extracted_text else 0
            
            # If no meaningful text was extracted, try OCR
            if word_count == 0 or len(extracted_text) < 10:
                print(f"📄 PDF text extraction yielded minimal content ({word_count} words). Attempting OCR...")
                try:
                    ocr_result = await _extract_pdf_with_ocr(content, file.filename)
                    if ocr_result and ocr_result.get("text", "").strip():
                        extracted_text = ocr_result["text"]
                        word_count = len(extracted_text.split()) if extracted_text else 0
                        result["method"] = f"{result['method']} + OCR"
                        result["text"] = extracted_text
                        print(f"✅ OCR successful: {word_count} words extracted")
                    else:
                        print("❌ OCR also failed to extract meaningful text")
                except Exception as e:
                    print(f"❌ OCR failed: {str(e)}")
                    # Continue with original result even if OCR fails
            
            total_time = (time.time() - start_time) * 1000
            
            return {
                "success": True,
                "data": {
                    "filename": file.filename,
                    "file_type": file.content_type,
                    "extracted_text": result["text"],
                    "confidence_score": 0.95 if word_count > 0 else 0.3,  # Lower confidence for failed extraction
                    "processing_method": result["method"],
                    "word_count": word_count,
                    "page_count": result["page_count"],
                    "extraction_time_ms": result["time_ms"],
                    "total_time_ms": total_time
                },
                "message": f"Text extracted in {total_time:.1f}ms using {result['method']}" + (f" ({word_count} words)" if word_count > 0 else " (no text found)")
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
        
        # LM Studio configuration
        lm_studio_url = "http://127.0.0.1:1234"
        lm_studio_model = "google/gemma-3-1b"
        
        print(f"Using LM Studio at {lm_studio_url} with model {lm_studio_model}")
        
        # Prepare the system prompt for mortgage banking analysis
        system_prompt = """You are a senior mortgage house banker and document analyst with over 20 years of experience in residential and commercial lending in Australia. Your role is to assess documents submitted by mortgage applicants to determine their suitability for home loans.

YOUR EXPERTISE INCLUDES:
- Document verification and authenticity assessment
- Income and employment verification
- Asset and liability evaluation  
- Credit risk assessment
- Regulatory compliance (NCCP, APRA guidelines)
- Property valuation analysis
- Loan serviceability calculations

CRITICAL INSTRUCTIONS:
1. FIRST, carefully read and understand the entire document text provided
2. DETERMINE if this document is relevant and useful for mortgage lending decisions
3. If the document is NOT relevant to mortgage lending (e.g., academic papers, unrelated business documents, personal letters), clearly state this and explain why it's not useful for mortgage assessment
4. If the document IS relevant, proceed with comprehensive analysis

FOR RELEVANT DOCUMENTS, provide analysis in these sections:

1. **Document Relevance Assessment**: State clearly whether this document is useful for mortgage lending and why
2. **Document Type & Purpose**: Identify what type of document this is and its specific relevance to mortgage applications
3. **Key Financial Information**: Extract and analyze any financial data, income figures, assets, liabilities, employment details
4. **Verification Points**: Highlight information that would need verification or raises questions
5. **Risk Assessment**: Identify any potential risks or red flags from a lending perspective
6. **Compliance Notes**: Note any regulatory or compliance considerations (NCCP, APRA)
7. **Lending Recommendations**: Provide specific recommendations for loan officers or underwriters

REMEMBER: Your role is to help make informed lending decisions. Be honest about document relevance and provide actionable insights only when the document contains mortgage-relevant information."""

        # Handle large documents by intelligently truncating while preserving key information
        max_chars = 8000  # Conservative limit for Gemma-3-1B context window (~2K tokens)
        
        if len(extracted_text) > max_chars:
            # For large documents, take first part + last part to capture beginning and end
            first_part = extracted_text[:max_chars//2]
            last_part = extracted_text[-(max_chars//2):]
            
            document_text = f"""[DOCUMENT START - First {max_chars//2} characters]
{first_part}

[DOCUMENT CONTINUES... {len(extracted_text) - max_chars} characters omitted for analysis]

[DOCUMENT END - Last {max_chars//2} characters]
{last_part}

[TOTAL DOCUMENT LENGTH: {len(extracted_text)} characters]"""
        else:
            document_text = extracted_text

        user_prompt = f"""As a senior mortgage banker, please carefully read the following document text and assess its relevance for mortgage lending decisions.

DOCUMENT TEXT TO ANALYZE:
{document_text}

ANALYSIS INSTRUCTIONS:
1. First, read the entire document text carefully (note: for large documents, key sections from beginning and end are shown)
2. Determine if this document is relevant for mortgage lending assessment
3. If NOT relevant, explain why and stop analysis
4. If relevant, provide comprehensive mortgage banking analysis following the 7-section structure from your system instructions

Begin your analysis now:"""

        # Use LM Studio for analysis
        try:
            print(f"🏠 Using LM Studio at {lm_studio_url}...")
            
            payload = {
                "model": lm_studio_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "max_tokens": 2000,
                "temperature": 0.3,
                "top_p": 0.9
            }
            
            response = requests.post(
                f"{lm_studio_url}/v1/chat/completions",
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=90
            )
            
            print(f"LM Studio API response status: {response.status_code}")
            print(f"Document text length: {len(document_text)} characters")
            
            if response.status_code == 200:
                response_data = response.json()
                
                if response_data.get("choices") and response_data["choices"][0].get("message"):
                    llm_analysis = response_data["choices"][0]["message"]["content"]
                    total_time = (time.time() - start_time) * 1000
                    
                    print("✅ LM Studio analysis completed successfully")
                    
                    return {
                        "success": True,
                        "data": {
                            "filename": file.filename,
                            "document_type": "mortgage_document_analysis",
                            "extracted_text": extracted_text,
                            "llm_analysis": llm_analysis,
                            "model_used": f"{lm_studio_model} (LM Studio)",
                            "confidence_score": 0.95,  # Higher confidence for local model
                            "word_count": len(extracted_text.split()) if extracted_text else 0,
                            "analysis_time_ms": total_time,
                            "tokens_analyzed": len(extracted_text[:4000].split())
                        },
                        "message": f"Advanced mortgage banking analysis completed in {total_time:.1f}ms using LM Studio"
                    }
                else:
                    raise HTTPException(
                        status_code=500,
                        detail="Invalid response from LM Studio API"
                    )
            else:
                error_text = response.text
                print(f"❌ LM Studio error response: {error_text}")
                
                if response.status_code == 400:
                    # Likely context length exceeded
                    raise HTTPException(
                        status_code=400,
                        detail=f"Document too large for analysis. Document length: {len(document_text)} characters. Try with a smaller document or contact support."
                    )
                else:
                    raise HTTPException(
                        status_code=500,
                        detail=f"LM Studio API error: {response.status_code} - {error_text}"
                    )
                    
        except requests.exceptions.RequestException as e:
            print(f"❌ LM Studio connection failed: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail="LM Studio is not running. Please start LM Studio and ensure the server is running on http://127.0.0.1:1234"
            )
        
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
    print("🏠 Enhanced with LM Studio Gemma-3-1B mortgage banking analysis")
    print("🔥 No rate limits - unlimited local AI processing!")
    uvicorn.run(app, host="0.0.0.0", port=port)
