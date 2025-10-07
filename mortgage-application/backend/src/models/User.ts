import bcrypt from 'bcryptjs';
import { User, CreateUserRequest, LoginRequest } from '../types';
import db from '../utils/database';

export class UserModel {
  async create(userData: CreateUserRequest): Promise<Omit<User, 'password_hash'>> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at
    `;
    
    const values = [
      userData.email,
      hashedPassword,
      userData.firstName,
      userData.lastName,
      userData.phone,
      userData.role || 'customer'
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    const query = `
      SELECT id, email, first_name, last_name, phone, role, created_at, updated_at 
      FROM users WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async update(id: string, updateData: Partial<CreateUserRequest>): Promise<Omit<User, 'password_hash'> | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updateData.firstName) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(updateData.firstName);
    }

    if (updateData.lastName) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(updateData.lastName);
    }

    if (updateData.phone) {
      fields.push(`phone = $${paramCount++}`);
      values.push(updateData.phone);
    }

    if (updateData.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(updateData.email);
    }

    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 12);
      fields.push(`password_hash = $${paramCount++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone, role, created_at, updated_at
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  async exists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows.length > 0;
  }

  async getAll(limit: number = 50, offset: number = 0): Promise<Omit<User, 'password_hash'>[]> {
    const query = `
      SELECT id, email, first_name, last_name, phone, role, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }

  async getByRole(role: string, limit: number = 50, offset: number = 0): Promise<Omit<User, 'password_hash'>[]> {
    const query = `
      SELECT id, email, first_name, last_name, phone, role, created_at, updated_at 
      FROM users 
      WHERE role = $1
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [role, limit, offset]);
    return result.rows;
  }
}

export const userModel = new UserModel();
export default userModel;
