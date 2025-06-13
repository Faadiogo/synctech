import { api } from '../api';

export interface Escopo {
  id: number;
  nome: string;
  projeto_id: number;
  projeto_nome?: string;
  cliente_nome?: string;
  cliente_foto?: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  data_inicio?: string;
  data_alvo?: string;
  ordem: number;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export const escoposSupabaseService = {
  // Listar escopos com filtros
  async listar(filtros?: {
    status?: string;
    projeto_id?: number;
    busca?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, string> = {};
    
    if (filtros?.status) {
      params.status = filtros.status;
    }
    if (filtros?.projeto_id) {
      params.projeto_id = filtros.projeto_id.toString();
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

    return api.get<Escopo[]>('/escopos-supabase', params);
  },

  // Buscar escopo por ID
  async buscarPorId(id: number) {
    return api.get<Escopo>(`/escopos-supabase/${id}`);
  },

  // Criar novo escopo
  async criar(escopoData: Omit<Escopo, 'id' | 'created_at' | 'updated_at' | 'projeto_nome' | 'cliente_nome' | 'cliente_foto'>) {
    return api.post<Escopo>('/escopos-supabase', escopoData);
  },

  // Atualizar escopo
  async atualizar(id: number, escopoData: Partial<Omit<Escopo, 'id' | 'created_at' | 'updated_at' | 'projeto_nome' | 'cliente_nome' | 'cliente_foto'>>) {
    return api.put<Escopo>(`/escopos-supabase/${id}`, escopoData);
  },

  // Excluir escopo
  async excluir(id: number) {
    return api.delete(`/escopos-supabase/${id}`);
  }
}; 