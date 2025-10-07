// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'customer' | 'staff' | 'admin';
  created_at: string;
  updated_at: string;
}

// Application types
export interface Application {
  id: string;
  userId: string;
  applicationNumber: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'funded';
  personalInfo?: PersonalInfo;
  propertyDetails?: PropertyDetails;
  loanInfo?: LoanInfo;
  financialInfo?: FinancialInfo;
  riskScore?: number;
  documents?: Document[];
  aiRiskAssessment?: any;
  createdAt: string;
  updatedAt: string;
}

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
  applicationId: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: 'identity' | 'income' | 'bank_statement' | 'property' | 'other';
  aiProcessed: boolean;
  aiAnalysis?: DocumentAnalysis;
  createdAt: string;
}

export interface DocumentAnalysis {
  documentType: string;
  extractedText: string;
  processedData: Record<string, any>;
  confidenceScore: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  userId: string;
  applicationId?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
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

// Form step types
export interface FormStepProps {
  onNext: () => void;
  onBack?: () => void;
  onDataChange: (data: any) => void;
  formData?: any;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// AI Service types
export interface DocumentUploadRequest {
  file: File;
  documentType: string;
  applicationId?: string;
}

export interface ChatRequest {
  message: string;
  applicationId?: string;
}

export interface RiskAssessmentRequest {
  applicationData: Application;
}

export interface RiskAssessmentResponse {
  riskScore: number;
  recommendations: string[];
  factors: Record<string, any>;
}
