import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse, Application, Document, ChatRequest, DocumentUploadRequest } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/api/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/api/auth/register', userData);
    return response.data;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await this.api.post('/api/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.api.post('/api/auth/logout');
    return response.data;
  }

  // Application endpoints
  async createApplication(applicationData: any): Promise<ApiResponse<Application>> {
    const response = await this.api.post('/api/applications', applicationData);
    return response.data;
  }

  async getApplications(): Promise<ApiResponse<Application[]>> {
    const response = await this.api.get('/api/applications');
    return response.data;
  }

  async getApplicationById(id: string): Promise<ApiResponse<Application>> {
    const response = await this.api.get(`/api/applications/${id}`);
    return response.data;
  }

  async updateApplicationStatus(id: string, status: string): Promise<ApiResponse<Application>> {
    const response = await this.api.patch(`/api/applications/${id}/status`, { status });
    return response.data;
  }

      async updateApplication(id: string, applicationData: Partial<Application>): Promise<ApiResponse<Application>> {
        const response = await this.api.put(`/api/applications/${id}`, applicationData);
        return response.data;
      }

      // Document endpoints
      async uploadDocument(applicationId: string, file: File, documentType: string): Promise<ApiResponse<Document>> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);

        const response = await this.api.post(`/api/documents/${applicationId}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }

      async getDocuments(applicationId: string): Promise<ApiResponse<Document[]>> {
        const response = await this.api.get(`/api/documents/${applicationId}`);
        return response.data;
      }

      async downloadDocument(documentId: string): Promise<Blob> {
        const response = await this.api.get(`/api/documents/download/${documentId}`, {
          responseType: 'blob',
        });
        return response.data;
      }

      async deleteDocument(documentId: string): Promise<ApiResponse> {
        const response = await this.api.delete(`/api/documents/${documentId}`);
        return response.data;
      }

  async submitApplication(id: string): Promise<ApiResponse<Application>> {
    const response = await this.api.post(`/api/applications/${id}/submit`);
    return response.data;
  }

  async deleteApplication(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/api/applications/${id}`);
    return response.data;
  }



  // AI Service endpoints
  async chatWithAI(message: string, applicationId?: string): Promise<ApiResponse<any>> {
    const response = await this.api.post('/api/ai/chat', {
      message,
      applicationId
    });
    return response.data;
  }

  async getAIHealth(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/api/ai/health');
    return response.data;
  }

  async getRiskAssessment(applicationId: string): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/api/ai/applications/${applicationId}/risk`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
