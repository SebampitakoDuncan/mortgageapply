# Document Intelligence Feature

## Overview

The Document Intelligence feature adds AI-powered text extraction and document analysis capabilities to the mortgage application system. Users can now click buttons next to uploaded documents to extract text from PDFs or perform OCR on images, and get structured analysis of document content.

## Features

### 🔤 Text Extraction
- **PDF Text Extraction**: Direct text extraction from text-based PDFs using PyMuPDF
- **OCR for Scanned PDFs**: OCR processing for image-based PDF pages
- **Image OCR**: Text extraction from JPEG, PNG images using Tesseract and EasyOCR
- **Multiple Methods**: Automatically selects the best extraction method based on document type

### 🔍 Document Analysis
- **Document Type Classification**: Automatically identifies document types (identity, income, bank statement, property)
- **Structured Field Extraction**: Extracts key fields like names, dates, amounts, addresses
- **Confidence Scoring**: Provides confidence scores for extraction quality
- **Smart Suggestions**: Offers suggestions for improving document quality

### 🎯 Supported Document Types
- **Identity Documents**: Passports, driver's licenses, ID cards
- **Income Documents**: Payslips, salary statements, employment letters
- **Bank Statements**: Account statements, transaction records
- **Property Documents**: Valuations, property reports
- **General Documents**: Any PDF or image file

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  AI Service     │
│   (React)       │    │   (Node.js)     │    │  (Python)       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Upload UI     │◄──►│ • Document APIs │◄──►│ • PyMuPDF       │
│ • Intelligence  │    │ • File Storage  │    │ • Tesseract OCR │
│   Buttons       │    │ • AI Integration│    │ • EasyOCR       │
│ • Results View  │    │ • Database      │    │ • Text Analysis │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Tesseract OCR (for image processing)

### 1. Install Tesseract OCR

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Download from: https://github.com/UB-Mannheim/tesseract/wiki

### 2. Install Python Dependencies
```bash
cd ai-services
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Install Node.js Dependencies
```bash
# Backend
cd backend
npm install form-data

# Frontend (if needed)
cd ../frontend
npm install
```

### 4. Start Services

**Option A: Use the startup script**
```bash
./start_document_intelligence.sh
```

**Option B: Start manually**
```bash
# Terminal 1: AI Service
cd ai-services
source venv/bin/activate
python src/main.py

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm start
```

### 5. Test the Setup
```bash
python test_document_intelligence.py
```

## Usage

### 1. Upload a Document
1. Navigate to the application documents section
2. Select document type and upload a PDF or image file
3. Wait for upload confirmation

### 2. Extract Text
1. Click the **Text Extract** button (📝) next to any supported document
2. Wait for processing (10-30 seconds)
3. View extracted text in the results section below

### 3. Analyze Document
1. Click the **Analyze** button (📊) next to any supported document
2. Wait for analysis (15-45 seconds)
3. View structured analysis including:
   - Document type classification
   - Extracted fields (names, dates, amounts)
   - Confidence scores
   - Improvement suggestions

## API Endpoints

### Text Extraction
```http
POST /api/documents/extract-text/:documentId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "uuid",
    "filename": "document.pdf",
    "extractedText": "Document content...",
    "confidenceScore": 0.95,
    "processingMethod": "PyMuPDF (direct text)",
    "wordCount": 245,
    "pageCount": 2
  }
}
```

### Document Analysis
```http
POST /api/documents/analyze/:documentId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "uuid",
    "filename": "payslip.pdf",
    "documentType": "income_document",
    "extractedFields": {
      "gross_income": "5000.00",
      "employer": "ABC Company Ltd",
      "dates_found": ["2024-01-15", "2024-01-31"]
    },
    "confidenceScore": 0.87,
    "suggestions": [
      "Document processed successfully. Review extracted information for accuracy."
    ]
  }
}
```

## Python Libraries Used

### PDF Processing
- **PyMuPDF (fitz)**: Fast PDF text extraction and page rendering
- **pdfplumber**: Enhanced table and structure extraction
- **pdf2image**: PDF to image conversion for OCR

### OCR Engines
- **pytesseract**: Google Tesseract wrapper for text recognition
- **EasyOCR**: PyTorch-based OCR with multi-language support

### Image Processing
- **Pillow (PIL)**: Image manipulation and preprocessing
- **OpenCV**: Advanced image enhancement for better OCR

### Web Framework
- **FastAPI**: Modern Python web framework for AI service
- **uvicorn**: ASGI server for FastAPI

## Configuration

### Environment Variables
```bash
# AI Service
PORT=8000
AI_SERVICE_URL=http://localhost:8000

# Backend
AI_SERVICE_URL=http://localhost:8000
```

### Supported File Types
- **PDFs**: `application/pdf`
- **Images**: `image/jpeg`, `image/jpg`, `image/png`

### File Size Limits
- Maximum file size: 10MB (configurable in backend)
- Recommended: Under 5MB for optimal performance

## Performance Optimization

### Text Extraction Speed
- **Text-based PDFs**: ~1-2 seconds
- **Scanned PDFs**: ~5-15 seconds per page
- **Images**: ~3-10 seconds depending on size and complexity

### Accuracy Improvements
1. **High-quality scans**: Use 300+ DPI for images
2. **Good lighting**: Ensure documents are well-lit and clear
3. **Flat documents**: Avoid shadows and distortions
4. **Supported languages**: Currently optimized for English

## Troubleshooting

### Common Issues

**1. AI Service Not Starting**
```bash
# Check Python version
python3 --version  # Should be 3.9+

# Check Tesseract installation
tesseract --version

# Install missing dependencies
pip install -r requirements.txt
```

**2. OCR Not Working**
```bash
# Test Tesseract directly
tesseract --list-langs

# Should show 'eng' in the list
# If not, reinstall Tesseract
```

**3. Low Accuracy Results**
- Ensure document image is clear and high-resolution
- Check that text is not rotated or skewed
- Try different document types in the classification

**4. Timeout Errors**
- Large files may take longer to process
- Check AI service logs: `tail -f logs/ai-service.log`
- Increase timeout in frontend API calls if needed

### Debug Mode
Enable detailed logging in the AI service:
```python
# In ai-services/src/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Development

### Adding New Document Types
1. Update document type classification in `document_processor.py`
2. Add field extraction patterns for the new type
3. Update frontend document type options
4. Test with sample documents

### Improving OCR Accuracy
1. Add preprocessing steps in `_preprocess_image()`
2. Experiment with different Tesseract configurations
3. Add EasyOCR language models for non-English text
4. Implement confidence-based method selection

### Performance Monitoring
- Monitor processing times in logs
- Track confidence scores for quality metrics
- Set up alerts for service failures

## Security Considerations

- All document processing happens server-side
- Uploaded files are stored securely with access controls
- AI analysis results are stored in the database with encryption
- No document content is sent to external AI services

## Future Enhancements

- [ ] Support for additional file formats (DOCX, XLSX)
- [ ] Multi-language OCR support
- [ ] Real-time processing progress indicators
- [ ] Batch document processing
- [ ] Machine learning model training on user corrections
- [ ] Integration with external document verification services

## Support

For issues or questions about the Document Intelligence feature:
1. Check the troubleshooting section above
2. Review logs in the `logs/` directory
3. Test with the provided test script
4. Ensure all dependencies are correctly installed
