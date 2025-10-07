import { Application, CreateApplicationRequest } from '../types';
import db from '../utils/database';

export class ApplicationModel {
  async create(applicationData: CreateApplicationRequest): Promise<Application> {
    const query = `
      INSERT INTO applications (
        user_id, application_number, status, personal_info, 
        property_details, loan_info, financial_info, risk_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      applicationData.userId,
      applicationData.applicationNumber,
      applicationData.status || 'draft',
      JSON.stringify(applicationData.personalInfo),
      JSON.stringify(applicationData.propertyDetails),
      JSON.stringify(applicationData.loanInfo),
      JSON.stringify(applicationData.financialInfo),
      applicationData.riskScore || 0
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async findByUserId(userId: string): Promise<Application[]> {
    const query = `
      SELECT * FROM applications 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  async findById(id: string): Promise<Application | null> {
    const query = 'SELECT * FROM applications WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async updateStatus(id: string, status: string): Promise<Application | null> {
    const query = `
      UPDATE applications 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, id]);
    return result.rows[0] || null;
  }

  async updateRiskScore(id: string, riskScore: number): Promise<Application | null> {
    const query = `
      UPDATE applications 
      SET risk_score = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [riskScore, id]);
    return result.rows[0] || null;
  }

  async update(id: string, updates: Partial<Application>): Promise<Application | null> {
    const allowedFields = ['status', 'risk_score', 'ai_risk_assessment'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      return this.findById(id);
    }

    const setClause = updateFields.map((field, index) => {
      if (field === 'ai_risk_assessment') {
        return `${field} = $${index + 2}::jsonb`;
      }
      return `${field} = $${index + 2}`;
    }).join(', ');

    const query = `
      UPDATE applications 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [id, ...updateFields.map(field => {
      const value = updates[field as keyof Application];
      return field === 'ai_risk_assessment' ? JSON.stringify(value) : value;
    })];

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM applications WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }
}

export const applicationModel = new ApplicationModel();
export default applicationModel;
