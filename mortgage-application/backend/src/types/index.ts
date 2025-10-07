// User types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'customer' | 'staff' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Application types
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  residencyStatus: 'citizen' | 'permanent' | 'temporary';
  employmentStatus: 'full-time' | 'part-time' | 'casual' | 'self-employed' | 'unemployed';
  employerName?: string;
  jobTitle?: string;
}

export interface PropertyDetails {
  address: string;
  propertyType: 'house' | 'apartment' | 'townhouse' | 'unit';
  purchasePrice: number;
  propertyValue?: number;
  purpose: 'owner-occupied' | 'investment';
  suburb: string;
  state: string;
  postcode: string;
}

export interface LoanInfo {
  loanAmount: number;
  downPayment: number;
  termYears: number;
  loanType: 'variable' | 'fixed' | 'split';
  purpose: 'purchase' | 'refinance' | 'cash_out';
  interestRate?: number;
}

export interface FinancialInfo {
  annualIncome: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  assets: number;
  liabilities: number;
  existingLoans: number;
  creditCards: number;
  otherDebts: number;
}

// Document types
export interface Document {
  id: string;
  application_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: 'identity' | 'income' | 'bank_statement' | 'property' | 'other';
  ai_processed: boolean;
  ai_analysis?: DocumentAnalysis;
  created_at: Date;
}

export interface DocumentAnalysis {
  documentType?: string;
  extractedText?: string;
  processedData?: Record<string, any>;
  confidenceScore?: number;
  confidence_score?: number;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  verification_status?: string;
  extracted_data?: any;
  ai_insights?: string[];
  requires_human_review?: boolean;
  processing_time?: number;
  document_id?: string;
  error?: string;
  timestamp?: string;
}

// Application types
export interface Application {
  id: string;
  user_id: string;
  application_number: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'funded' | 'requires_review' | 'declined';
  personal_info?: PersonalInfo;
  property_details?: PropertyDetails;
  loan_info?: LoanInfo;
  financial_info?: FinancialInfo;
  risk_score?: number;
  ai_risk_assessment?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateApplicationRequest {
  userId: string;
  applicationNumber?: string;
  status?: string;
  personalInfo?: any;
  propertyDetails?: any;
  loanInfo?: any;
  financialInfo?: any;
  riskScore?: number;
}


// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Auth types
export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  refreshToken: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Database connection types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

// File upload types
export interface FileUploadConfig {
  maxFileSize: number;
  allowedTypes: string[];
  destination: string;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}
