import { api } from '../api';

export interface Cronograma {
  id: number;
  fase_nome: string;
  projeto_id: number;
  projeto_nome?: string;
  cliente_nome?: string;
  cliente_foto?: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  progresso: number;
  descricao?: string;
  observacoes?: string;
  ordem?: number;
  created_at: string;
  updated_at: string;
}

export const cronogramaSupabaseService = {
  // Listar cronogramas com filtros
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

    return api.get<Cronograma[]>('/cronograma-supabase', params);
  },

  // Buscar cronograma por ID
  async buscarPorId(id: number) {
    return api.get<Cronograma>(`/cronograma-supabase/${id}`);
  },

  // Criar novo cronograma
  async criar(cronogramaData: Omit<Cronograma, 'id' | 'created_at' | 'updated_at' | 'projeto_nome' | 'cliente_nome' | 'cliente_foto'>) {
    return api.post<Cronograma>('/cronograma-supabase', cronogramaData);
  },

  // Atualizar cronograma
  async atualizar(id: number, cronogramaData: Partial<Omit<Cronograma, 'id' | 'created_at' | 'updated_at' | 'projeto_nome' | 'cliente_nome' | 'cliente_foto'>>) {
    return api.put<Cronograma>(`/cronograma-supabase/${id}`, cronogramaData);
  },

  // Excluir cronograma
  async excluir(id: number) {
    return api.delete(`/cronograma-supabase/${id}`);
  }
}; 