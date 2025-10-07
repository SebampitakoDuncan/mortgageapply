import { v4 as uuidv4 } from 'uuid';
import { Document } from '../types';
import db from '../utils/database';

export interface CreateDocumentRequest {
  applicationId: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
}

export class DocumentModel {
  async create(documentData: CreateDocumentRequest): Promise<Document> {
    const query = `
      INSERT INTO documents (id, application_id, filename, original_name, file_path, file_size, mime_type, document_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      uuidv4(),
      documentData.applicationId,
      documentData.filename,
      documentData.originalName,
      documentData.filePath,
      documentData.fileSize,
      documentData.mimeType,
      documentData.documentType
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<Document | null> {
    const query = 'SELECT * FROM documents WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByApplicationId(applicationId: string): Promise<Document[]> {
    const query = 'SELECT * FROM documents WHERE application_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [applicationId]);
    return result.rows;
  }

  async update(id: string, updates: Partial<Document>): Promise<Document | null> {
    const allowedFields = ['ai_processed', 'ai_analysis'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      return this.findById(id);
    }

    const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `
      UPDATE documents 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [id, ...updateFields.map(field => updates[field as keyof Document])];
    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM documents WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  async findByDocumentType(applicationId: string, documentType: string): Promise<Document[]> {
    const query = 'SELECT * FROM documents WHERE application_id = $1 AND document_type = $2 ORDER BY created_at DESC';
    const result = await db.query(query, [applicationId, documentType]);
    return result.rows;
  }

  async getDocumentStats(applicationId: string): Promise<{ [key: string]: number }> {
    const query = `
      SELECT document_type, COUNT(*) as count
      FROM documents 
      WHERE application_id = $1 
      GROUP BY document_type
    `;
    const result = await db.query(query, [applicationId]);
    
    const stats: { [key: string]: number } = {};
    result.rows.forEach((row: any) => {
      stats[row.document_type] = parseInt(row.count);
    });
    
    return stats;
  }
}

export const documentModel = new DocumentModel();
export default documentModel;
