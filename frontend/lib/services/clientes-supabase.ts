import { api } from '../api';

export interface Cliente {
  id: number;
  nome_empresa?: string;
  nome_completo?: string;
  email: string;
  telefone?: string;
  endereco?: string;
  cpf_cnpj?: string;
  tipo_pessoa: 'PF' | 'PJ';
  ativo: boolean;
  observacoes?: string;
  foto_url?: string;
  created_at: string;
  updated_at: string;
  projetos_count?: number;
}

export const clientesSupabaseService = {
  // Listar clientes com filtros
  async listar(filtros?: {
    ativo?: boolean;
    tipo_pessoa?: 'PF' | 'PJ';
    busca?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, string> = {};
    
    if (filtros?.ativo !== undefined) {
      params.ativo = filtros.ativo.toString();
    }
    if (filtros?.tipo_pessoa) {
      params.tipo_pessoa = filtros.tipo_pessoa;
    }
    if (filtros?.busca) {
      params.busca = filtros.busca;
    }
    if (filtros?.page) {
      params.page = filtros.page.toString();
    }
    if (filtros?.limit) {
      params.limit = filtros.limit.toString();
    }

    return api.get<{
      data: Cliente[];
      total: number;
      page: number;
      totalPages: number;
    }>('/clientes-supabase', params);
  },

  // Buscar cliente por ID
  async buscarPorId(id: number) {
    return api.get<{ data: Cliente; message: string }>(`/clientes-supabase/${id}`);
  },

  // Criar novo cliente
  async criar(clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'projetos_count'>) {
    return api.post<{ data: Cliente; message: string }>('/clientes-supabase', clienteData);
  },

  // Atualizar cliente
  async atualizar(id: number, clienteData: Partial<Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'projetos_count'>>) {
    return api.put<{ data: Cliente; message: string }>(`/clientes-supabase/${id}`, clienteData);
  },

  // Deletar cliente
  async deletar(id: number) {
    return api.delete(`/clientes-supabase/${id}`);
  },

  // Buscar projetos do cliente
  async buscarProjetos(id: number) {
    return api.get(`/clientes-supabase/${id}/projetos`);
  }
}; 