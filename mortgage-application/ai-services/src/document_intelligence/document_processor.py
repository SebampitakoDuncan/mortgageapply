import io
import fitz  # PyMuPDF
import pytesseract
import easyocr
import pdfplumber
from PIL import Image
import cv2
import numpy as np
from typing import Dict, Any, List
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self):
        """Initialize the document processor with OCR engines"""
        try:
            # Initialize EasyOCR reader (supports multiple languages)
            self.easyocr_reader = easyocr.Reader(['en'])
            logger.info("EasyOCR initialized successfully")
        except Exception as e:
            logger.warning(f"EasyOCR initialization failed: {e}")
            self.easyocr_reader = None
        
        # Test Tesseract availability
        try:
            pytesseract.get_tesseract_version()
            self.tesseract_available = True
            logger.info("Tesseract OCR available")
        except Exception as e:
            logger.warning(f"Tesseract not available: {e}")
            self.tesseract_available = False

    async def extract_text_from_pdf(self, content: bytes, filename: str) -> Dict[str, Any]:
        """
        Extract text from PDF using multiple methods for best results
        """
        try:
            # Method 1: Try direct text extraction with PyMuPDF (fastest for text-based PDFs)
            text_pymupdf = self._extract_text_pymupdf(content)
            
            if text_pymupdf and len(text_pymupdf.strip()) > 50:
                logger.info(f"PDF text extracted successfully with PyMuPDF: {filename}")
                return {
                    "text": text_pymupdf,
                    "method": "PyMuPDF (direct text)",
                    "confidence": 0.95,
                    "page_count": self._get_pdf_page_count(content)
                }
            
            # Method 2: Try pdfplumber for better table/structure handling
            text_pdfplumber = self._extract_text_pdfplumber(content)
            
            if text_pdfplumber and len(text_pdfplumber.strip()) > 50:
                logger.info(f"PDF text extracted successfully with pdfplumber: {filename}")
                return {
                    "text": text_pdfplumber,
                    "method": "pdfplumber (structured)",
                    "confidence": 0.90,
                    "page_count": self._get_pdf_page_count(content)
                }
            
            # Method 3: OCR on PDF pages (for scanned PDFs)
            logger.info(f"Attempting OCR on PDF pages: {filename}")
            text_ocr = await self._extract_text_from_pdf_ocr(content)
            
            return {
                "text": text_ocr,
                "method": "OCR on PDF pages",
                "confidence": 0.75,
                "page_count": self._get_pdf_page_count(content)
            }
            
        except Exception as e:
            logger.error(f"PDF text extraction failed for {filename}: {e}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")

    async def extract_text_from_image(self, content: bytes, filename: str) -> Dict[str, Any]:
        """
        Extract text from image using OCR with preprocessing
        """
        try:
            # Load image
            image = Image.open(io.BytesIO(content))
            
            # Preprocess image for better OCR results
            processed_image = self._preprocess_image(image)
            
            # Try multiple OCR methods and return the best result
            results = []
            
            # Method 1: EasyOCR (often better for complex layouts)
            if self.easyocr_reader:
                try:
                    easyocr_result = self._extract_with_easyocr(processed_image)
                    results.append({
                        "text": easyocr_result,
                        "method": "EasyOCR",
                        "confidence": 0.85
                    })
                except Exception as e:
                    logger.warning(f"EasyOCR failed: {e}")
            
            # Method 2: Tesseract OCR
            if self.tesseract_available:
                try:
                    tesseract_result = self._extract_with_tesseract(processed_image)
                    results.append({
                        "text": tesseract_result,
                        "method": "Tesseract OCR",
                        "confidence": 0.80
                    })
                except Exception as e:
                    logger.warning(f"Tesseract failed: {e}")
            
            # Return the result with the most text (usually indicates better extraction)
            if results:
                best_result = max(results, key=lambda x: len(x["text"]))
                logger.info(f"Image OCR completed with {best_result['method']}: {filename}")
                return best_result
            else:
                raise Exception("No OCR method available or all methods failed")
                
        except Exception as e:
            logger.error(f"Image OCR failed for {filename}: {e}")
            raise Exception(f"Failed to extract text from image: {str(e)}")

    def _extract_text_pymupdf(self, content: bytes) -> str:
        """Extract text using PyMuPDF"""
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()

    def _extract_text_pdfplumber(self, content: bytes) -> str:
        """Extract text using pdfplumber (better for tables)"""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()

    async def _extract_text_from_pdf_ocr(self, content: bytes) -> str:
        """Extract text from PDF using OCR on each page"""
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            # Render page as image
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better OCR
            img_data = pix.tobytes("png")
            
            # Convert to PIL Image
            image = Image.open(io.BytesIO(img_data))
            
            # Extract text from this page
            page_result = await self.extract_text_from_image(img_data, f"page_{page_num}")
            text += page_result["text"] + "\n"
        
        doc.close()
        return text.strip()

    def _get_pdf_page_count(self, content: bytes) -> int:
        """Get the number of pages in PDF"""
        try:
            doc = fitz.open(stream=content, filetype="pdf")
            page_count = len(doc)
            doc.close()
            return page_count
        except:
            return 1

    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """Preprocess image for better OCR results"""
        # Convert to numpy array
        img_array = np.array(image)
        
        # Convert to grayscale if needed
        if len(img_array.shape) == 3:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Apply image enhancements
        # 1. Noise reduction
        img_array = cv2.medianBlur(img_array, 3)
        
        # 2. Contrast enhancement
        img_array = cv2.convertScaleAbs(img_array, alpha=1.2, beta=10)
        
        # 3. Thresholding for better text recognition
        _, img_array = cv2.threshold(img_array, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Convert back to PIL Image
        return Image.fromarray(img_array)

    def _extract_with_easyocr(self, image: Image.Image) -> str:
        """Extract text using EasyOCR"""
        img_array = np.array(image)
        results = self.easyocr_reader.readtext(img_array)
        
        # Combine all detected text
        text_parts = []
        for (bbox, text, confidence) in results:
            if confidence > 0.5:  # Filter low-confidence results
                text_parts.append(text)
        
        return " ".join(text_parts)

    def _extract_with_tesseract(self, image: Image.Image) -> str:
        """Extract text using Tesseract OCR"""
        # Configure Tesseract for better results
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,!?@#$%^&*()_+-=[]{}|;:,.<>?/~` '
        
        text = pytesseract.image_to_string(image, config=custom_config)
        return text.strip()

    async def analyze_document_structure(self, text: str, filename: str) -> Dict[str, Any]:
        """
        Analyze document structure and identify document type and key fields
        """
        try:
            # Basic document type classification
            doc_type = self._classify_document_type(text, filename)
            
            # Extract structured fields based on document type
            fields = self._extract_structured_fields(text, doc_type)
            
            # Calculate confidence based on field extraction success
            confidence = self._calculate_analysis_confidence(fields, doc_type)
            
            return {
                "document_type": doc_type,
                "fields": fields,
                "confidence": confidence,
                "suggestions": self._generate_suggestions(fields, doc_type)
            }
            
        except Exception as e:
            logger.error(f"Document analysis failed: {e}")
            return {
                "document_type": "unknown",
                "fields": {},
                "confidence": 0.0,
                "suggestions": ["Document analysis failed. Please try with a clearer image or different file."]
            }

    def _classify_document_type(self, text: str, filename: str) -> str:
        """Classify document type based on content and filename"""
        text_lower = text.lower()
        filename_lower = filename.lower()
        
        # Check filename first
        if any(keyword in filename_lower for keyword in ['passport', 'license', 'id', 'driver']):
            return 'identity_document'
        elif any(keyword in filename_lower for keyword in ['payslip', 'salary', 'income', 'pay']):
            return 'income_document'
        elif any(keyword in filename_lower for keyword in ['bank', 'statement', 'account']):
            return 'bank_statement'
        elif any(keyword in filename_lower for keyword in ['property', 'valuation', 'appraisal']):
            return 'property_document'
        
        # Check content
        if any(keyword in text_lower for keyword in ['passport', 'driver license', 'identification']):
            return 'identity_document'
        elif any(keyword in text_lower for keyword in ['gross pay', 'net pay', 'salary', 'wages']):
            return 'income_document'
        elif any(keyword in text_lower for keyword in ['account balance', 'transaction', 'deposit', 'withdrawal']):
            return 'bank_statement'
        elif any(keyword in text_lower for keyword in ['property value', 'valuation', 'appraisal']):
            return 'property_document'
        
        return 'general_document'

    def _extract_structured_fields(self, text: str, doc_type: str) -> Dict[str, Any]:
        """Extract structured fields based on document type"""
        fields = {}
        
        if doc_type == 'identity_document':
            fields.update(self._extract_identity_fields(text))
        elif doc_type == 'income_document':
            fields.update(self._extract_income_fields(text))
        elif doc_type == 'bank_statement':
            fields.update(self._extract_bank_fields(text))
        elif doc_type == 'property_document':
            fields.update(self._extract_property_fields(text))
        
        # Always extract common fields
        fields.update(self._extract_common_fields(text))
        
        return fields

    def _extract_identity_fields(self, text: str) -> Dict[str, str]:
        """Extract fields from identity documents"""
        fields = {}
        
        # Name patterns
        name_patterns = [
            r'name[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)',
            r'([A-Z][A-Z\s]+)\s+(?:DOB|Date of Birth)',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['full_name'] = match.group(1).strip()
                break
        
        # Date of birth
        dob_patterns = [
            r'(?:DOB|Date of Birth)[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})'
        ]
        
        for pattern in dob_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['date_of_birth'] = match.group(1)
                break
        
        # Document number
        doc_num_patterns = [
            r'(?:License|Passport|ID)[:\s#]*([A-Z0-9]+)',
            r'([A-Z]{1,2}\d{6,})'
        ]
        
        for pattern in doc_num_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['document_number'] = match.group(1)
                break
        
        return fields

    def _extract_income_fields(self, text: str) -> Dict[str, str]:
        """Extract fields from income documents"""
        fields = {}
        
        # Gross pay
        gross_patterns = [
            r'gross[:\s]+\$?([\d,]+\.?\d*)',
            r'total[:\s]+\$?([\d,]+\.?\d*)'
        ]
        
        for pattern in gross_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['gross_income'] = match.group(1)
                break
        
        # Net pay
        net_patterns = [
            r'net[:\s]+\$?([\d,]+\.?\d*)',
            r'take home[:\s]+\$?([\d,]+\.?\d*)'
        ]
        
        for pattern in net_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['net_income'] = match.group(1)
                break
        
        # Employer
        employer_patterns = [
            r'employer[:\s]+([A-Za-z\s&.,]+)',
            r'company[:\s]+([A-Za-z\s&.,]+)'
        ]
        
        for pattern in employer_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['employer'] = match.group(1).strip()
                break
        
        return fields

    def _extract_bank_fields(self, text: str) -> Dict[str, str]:
        """Extract fields from bank statements"""
        fields = {}
        
        # Account balance
        balance_patterns = [
            r'balance[:\s]+\$?([\d,]+\.?\d*)',
            r'current balance[:\s]+\$?([\d,]+\.?\d*)'
        ]
        
        for pattern in balance_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['account_balance'] = match.group(1)
                break
        
        # Account number
        account_patterns = [
            r'account[:\s#]*(\d{6,})',
            r'(\d{3}-\d{3}-\d{3,})'
        ]
        
        for pattern in account_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['account_number'] = match.group(1)
                break
        
        return fields

    def _extract_property_fields(self, text: str) -> Dict[str, str]:
        """Extract fields from property documents"""
        fields = {}
        
        # Property value
        value_patterns = [
            r'value[:\s]+\$?([\d,]+\.?\d*)',
            r'valuation[:\s]+\$?([\d,]+\.?\d*)'
        ]
        
        for pattern in value_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['property_value'] = match.group(1)
                break
        
        # Address
        address_patterns = [
            r'(\d+\s+[A-Za-z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln))',
        ]
        
        for pattern in address_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields['property_address'] = match.group(1).strip()
                break
        
        return fields

    def _extract_common_fields(self, text: str) -> Dict[str, str]:
        """Extract common fields from any document"""
        fields = {}
        
        # Dates
        date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})'
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates.extend(matches)
        
        if dates:
            fields['dates_found'] = dates[:5]  # Limit to first 5 dates
        
        # Phone numbers
        phone_patterns = [
            r'(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})',
            r'(\(\d{3}\)\s*\d{3}[-.\s]?\d{4})'
        ]
        
        phones = []
        for pattern in phone_patterns:
            matches = re.findall(pattern, text)
            phones.extend(matches)
        
        if phones:
            fields['phone_numbers'] = phones[:3]  # Limit to first 3 phone numbers
        
        # Email addresses
        email_pattern = r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
        emails = re.findall(email_pattern, text)
        if emails:
            fields['email_addresses'] = emails[:3]  # Limit to first 3 emails
        
        return fields

    def _calculate_analysis_confidence(self, fields: Dict[str, Any], doc_type: str) -> float:
        """Calculate confidence score based on extracted fields"""
        if not fields:
            return 0.0
        
        # Base confidence
        confidence = 0.5
        
        # Boost confidence based on document type and relevant fields
        if doc_type == 'identity_document':
            if 'full_name' in fields:
                confidence += 0.2
            if 'date_of_birth' in fields:
                confidence += 0.2
            if 'document_number' in fields:
                confidence += 0.1
        elif doc_type == 'income_document':
            if 'gross_income' in fields:
                confidence += 0.2
            if 'employer' in fields:
                confidence += 0.2
            if 'net_income' in fields:
                confidence += 0.1
        elif doc_type == 'bank_statement':
            if 'account_balance' in fields:
                confidence += 0.2
            if 'account_number' in fields:
                confidence += 0.2
        
        # General field bonuses
        if 'dates_found' in fields:
            confidence += 0.05
        if 'phone_numbers' in fields:
            confidence += 0.05
        if 'email_addresses' in fields:
            confidence += 0.05
        
        return min(confidence, 1.0)

    def _generate_suggestions(self, fields: Dict[str, Any], doc_type: str) -> List[str]:
        """Generate suggestions based on extraction results"""
        suggestions = []
        
        if not fields or len(fields) < 2:
            suggestions.append("Consider using a higher quality scan or image for better text extraction.")
            suggestions.append("Ensure the document is well-lit and all text is clearly visible.")
        
        if doc_type == 'identity_document' and 'full_name' not in fields:
            suggestions.append("Name not clearly detected. Please ensure the name field is visible and not obscured.")
        
        if doc_type == 'income_document' and 'gross_income' not in fields:
            suggestions.append("Income amount not detected. Please ensure salary/wage information is clearly visible.")
        
        if doc_type == 'bank_statement' and 'account_balance' not in fields:
            suggestions.append("Account balance not detected. Please ensure the balance information is clearly visible.")
        
        if not suggestions:
            suggestions.append("Document processed successfully. Review extracted information for accuracy.")
        
        return suggestions
