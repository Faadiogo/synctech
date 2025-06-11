import { api, Cliente } from '../api';

export const clientesService = {
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

    return api.get<Cliente[]>('/clientes-supabase', params);
  },

  // Buscar cliente por ID
  async buscarPorId(id: number) {
    return api.get<Cliente>(`/clientes-supabase/${id}`);
  },

  // Criar novo cliente
  async criar(clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'projetos_count'>) {
    return api.post<Cliente>('/clientes-supabase', clienteData);
  },

  // Atualizar cliente
  async atualizar(id: number, clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'projetos_count'>) {
    return api.put<Cliente>(`/clientes-supabase/${id}`, clienteData);
  },

  // Desativar cliente
  async desativar(id: number, permanent = false) {
    const url = permanent ? `/clientes-supabase/${id}?hard=true` : `/clientes-supabase/${id}`;
    return api.delete(url);
  },

  // Buscar projetos do cliente
  async buscarProjetos(id: number) {
    return api.get(`/clientes-supabase/${id}/projetos`);
  }
}; 