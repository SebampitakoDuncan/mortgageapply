#!/usr/bin/env python3
"""
Script to trigger AI analysis for all unprocessed documents
"""
import requests
import json
import time

# Configuration
BACKEND_URL = "http://localhost:5001"
AI_SERVICE_URL = "http://localhost:8001"
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNzhmM2RiNS0yNzRlLTQzNmUtOGFkOC1jOTZkYTE4NzNmZTEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NTk4MDQzODgsImV4cCI6MTc1OTg5MDc4OH0.I1U5q7HZylOZzULIRCquNXoZqOcvneCuwyVwaIko_9U"
APPLICATION_ID = "52238453-2d89-4530-9d10-bfcf25024b1a"

def get_unprocessed_documents():
    """Get all unprocessed documents for the application"""
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    response = requests.get(f"{BACKEND_URL}/api/documents/{APPLICATION_ID}", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            documents = data.get('data', [])
            unprocessed = [doc for doc in documents if not doc.get('ai_processed', False)]
            return unprocessed
    return []

def trigger_ai_analysis(document_id, document_type):
    """Trigger AI analysis for a specific document"""
    print(f"Processing document {document_id} (type: {document_type})")
    
    # Get the document file from backend
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    response = requests.get(f"{BACKEND_URL}/api/documents/download/{document_id}", headers=headers)
    
    if response.status_code != 200:
        print(f"Failed to download document {document_id}")
        return False
    
    # Send to AI service for analysis
    files = {'file': (f'document_{document_id}', response.content, 'application/octet-stream')}
    data = {
        'document_type': document_type,
        'application_id': APPLICATION_ID
    }
    
    ai_response = requests.post(f"{AI_SERVICE_URL}/api/documents/analyze", files=files, data=data)
    
    if ai_response.status_code == 200:
        print(f"✅ Successfully analyzed document {document_id}")
        return True
    else:
        print(f"❌ Failed to analyze document {document_id}: {ai_response.status_code}")
        return False

def main():
    """Main function to process all unprocessed documents"""
    print("🔍 Finding unprocessed documents...")
    unprocessed_docs = get_unprocessed_documents()
    
    if not unprocessed_docs:
        print("✅ All documents are already processed!")
        return
    
    print(f"📄 Found {len(unprocessed_docs)} unprocessed documents")
    
    success_count = 0
    for doc in unprocessed_docs:
        doc_id = doc['id']
        doc_type = doc.get('document_type', 'identity')
        
        if trigger_ai_analysis(doc_id, doc_type):
            success_count += 1
        
        # Small delay to avoid overwhelming the services
        time.sleep(1)
    
    print(f"\n🎉 Processing complete! Successfully analyzed {success_count}/{len(unprocessed_docs)} documents")

if __name__ == "__main__":
    main()
