const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; pagination?: any }> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<{ data: T; pagination?: any }> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    
    return this.request<T>(url);
  }

  async post<T>(endpoint: string, data: any): Promise<{ data: T; message?: string }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<{ data: T; message?: string }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string): Promise<{ data: any; message?: string }> {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Tipos para as entidades
export interface Cliente {
  id: number;
  tipo_pessoa: 'PF' | 'PJ';
  nome_empresa?: string;
  nome_completo?: string;
  representante_legal?: string;
  razao_social?: string;
  cpf?: string;
  cnpj?: string;
  cep?: string;
  numero?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  foto_url?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  projetos_count?: number;
}

export interface Projeto {
  id: number;
  cliente_id: number;
  nome: string;
  descricao?: string;
  tecnologias?: string[];
  status: string;
  data_inicio?: string;
  data_alvo?: string;
  data_conclusao?: string;
  horas_estimadas?: number;
  horas_trabalhadas?: number;
  valor_estimado?: number;
  progresso?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  cliente_nome?: string;
  nome_empresa?: string;
  nome_completo?: string;
  total_tarefas?: number;
  tarefas_concluidas?: number;
  progresso_calculado?: number;
} 