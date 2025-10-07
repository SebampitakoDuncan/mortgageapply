#!/usr/bin/env python3
"""
Ultra-Fast PDF Text Extractor (October 2025)
Optimized for speed and lightweight operation
"""
import io
import subprocess
import tempfile
import os
from typing import Dict, Any, Optional
import time

try:
    import fitz  # PyMuPDF - fastest option
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

try:
    import pypdf  # Modern replacement for PyPDF2
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

class FastPDFExtractor:
    """Ultra-fast PDF text extraction with fallback methods"""
    
    def __init__(self):
        self.methods_available = {
            'pymupdf': PYMUPDF_AVAILABLE,
            'pypdf': PYPDF_AVAILABLE,
            'pdftotext': self._check_pdftotext()
        }
        print(f"Available extraction methods: {[k for k, v in self.methods_available.items() if v]}")
    
    def _check_pdftotext(self) -> bool:
        """Check if pdftotext command is available"""
        try:
            subprocess.run(['pdftotext', '-v'], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    def extract_text(self, pdf_content: bytes, filename: str = "document.pdf") -> Dict[str, Any]:
        """
        Extract text using the fastest available method
        Returns: {text: str, method: str, time_ms: float, page_count: int}
        """
        start_time = time.time()
        
        # Method 1: PyMuPDF (fastest for most cases)
        if self.methods_available['pymupdf']:
            try:
                result = self._extract_with_pymupdf(pdf_content)
                if result['text'].strip():
                    result['time_ms'] = (time.time() - start_time) * 1000
                    return result
            except Exception as e:
                print(f"PyMuPDF failed: {e}")
        
        # Method 2: pdftotext (extremely fast command-line tool)
        if self.methods_available['pdftotext']:
            try:
                result = self._extract_with_pdftotext(pdf_content)
                if result['text'].strip():
                    result['time_ms'] = (time.time() - start_time) * 1000
                    return result
            except Exception as e:
                print(f"pdftotext failed: {e}")
        
        # Method 3: pypdf (lightweight fallback)
        if self.methods_available['pypdf']:
            try:
                result = self._extract_with_pypdf(pdf_content)
                result['time_ms'] = (time.time() - start_time) * 1000
                return result
            except Exception as e:
                print(f"pypdf failed: {e}")
        
        # No methods available
        return {
            'text': '',
            'method': 'none_available',
            'time_ms': (time.time() - start_time) * 1000,
            'page_count': 0,
            'error': 'No PDF extraction methods available'
        }
    
    def _extract_with_pymupdf(self, pdf_content: bytes) -> Dict[str, Any]:
        """Extract using PyMuPDF - fastest method"""
        doc = fitz.open(stream=pdf_content, filetype="pdf")
        text_parts = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text_parts.append(page.get_text())
        
        doc.close()
        
        return {
            'text': '\n'.join(text_parts),
            'method': 'PyMuPDF (fitz)',
            'page_count': len(text_parts)
        }
    
    def _extract_with_pdftotext(self, pdf_content: bytes) -> Dict[str, Any]:
        """Extract using pdftotext command - extremely fast"""
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
            temp_pdf.write(pdf_content)
            temp_pdf_path = temp_pdf.name
        
        try:
            # Run pdftotext command
            result = subprocess.run([
                'pdftotext', 
                '-layout',  # Preserve layout
                '-nopgbrk', # No page breaks
                temp_pdf_path, 
                '-'  # Output to stdout
            ], capture_output=True, text=True, check=True)
            
            text = result.stdout
            
            # Get page count
            page_count_result = subprocess.run([
                'pdfinfo', temp_pdf_path
            ], capture_output=True, text=True)
            
            page_count = 1
            if page_count_result.returncode == 0:
                for line in page_count_result.stdout.split('\n'):
                    if line.startswith('Pages:'):
                        page_count = int(line.split(':')[1].strip())
                        break
            
            return {
                'text': text,
                'method': 'pdftotext (poppler)',
                'page_count': page_count
            }
        
        finally:
            os.unlink(temp_pdf_path)
    
    def _extract_with_pypdf(self, pdf_content: bytes) -> Dict[str, Any]:
        """Extract using pypdf - lightweight fallback"""
        from pypdf import PdfReader
        
        reader = PdfReader(io.BytesIO(pdf_content))
        text_parts = []
        
        for page in reader.pages:
            text_parts.append(page.extract_text())
        
        return {
            'text': '\n'.join(text_parts),
            'method': 'pypdf',
            'page_count': len(text_parts)
        }

# Standalone function for simple usage
def extract_pdf_text_fast(pdf_content: bytes, filename: str = "document.pdf") -> Dict[str, Any]:
    """
    Simple function to extract text from PDF as fast as possible
    """
    extractor = FastPDFExtractor()
    return extractor.extract_text(pdf_content, filename)

if __name__ == "__main__":
    # Test the extractor
    print("Fast PDF Text Extractor - Testing available methods...")
    extractor = FastPDFExtractor()
    
    # Test with a simple PDF if available
    test_pdf_path = "/tmp/test.pdf"
    if os.path.exists(test_pdf_path):
        with open(test_pdf_path, 'rb') as f:
            result = extractor.extract_text(f.read())
            print(f"Extracted {len(result['text'])} characters in {result['time_ms']:.1f}ms using {result['method']}")
    else:
        print("No test PDF found. Extractor is ready for use.")
