import { api, Projeto } from '../api';

export const projetosSupabaseService = {
  // Listar projetos com filtros
  async listar(filtros?: {
    status?: string;
    cliente_id?: number;
    busca?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, string> = {};
    
    if (filtros?.status) {
      params.status = filtros.status;
    }
    if (filtros?.cliente_id) {
      params.cliente_id = filtros.cliente_id.toString();
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

    return api.get<Projeto[]>('/projetos-supabase', params);
  },

  // Buscar projeto por ID
  async buscarPorId(id: number) {
    return api.get<Projeto>(`/projetos-supabase/${id}`);
  },

  // Criar novo projeto
  async criar(projetoData: Omit<Projeto, 'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'nome_empresa' | 'nome_completo' | 'total_tarefas' | 'tarefas_concluidas' | 'progresso_calculado'>) {
    return api.post<Projeto>('/projetos-supabase', projetoData);
  },

  // Atualizar projeto
  async atualizar(id: number, projetoData: Partial<Omit<Projeto, 'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'nome_empresa' | 'nome_completo' | 'total_tarefas' | 'tarefas_concluidas' | 'progresso_calculado'>>) {
    return api.put<Projeto>(`/projetos-supabase/${id}`, projetoData);
  },

  // Excluir projeto
  async excluir(id: number) {
    return api.delete(`/projetos-supabase/${id}`);
  }
}; 