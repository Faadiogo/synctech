import { api } from '../api';

export interface Reuniao {
  id: number;
  titulo: string;
  projeto_id: number;
  projeto_nome?: string;
  cliente_nome?: string;
  cliente_foto?: string;
  data_reuniao: string;
  horario_inicio: string;
  horario_fim: string;
  tipo: string;
  status: string;
  link_reuniao?: string;
  local?: string;
  agenda?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const reunioesSupabaseService = {
  // Listar reuniões com filtros
  async listar(filtros?: {
    status?: string;
    tipo?: string;
    projeto_id?: number;
    data_inicio?: string;
    data_fim?: string;
    busca?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, string> = {};
    
    if (filtros?.status) {
      params.status = filtros.status;
    }
    if (filtros?.tipo) {
      params.tipo = filtros.tipo;
    }
    if (filtros?.projeto_id) {
      params.projeto_id = filtros.projeto_id.toString();
    }
    if (filtros?.data_inicio) {
      params.data_inicio = filtros.data_inicio;
    }
    if (filtros?.data_fim) {
      params.data_fim = filtros.data_fim;
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

    return api.get<Reuniao[]>('/reunioes-supabase', params);
  },

  // Buscar reunião por ID
  async buscarPorId(id: number) {
    return api.get<Reuniao>(`/reunioes-supabase/${id}`);
  },

  // Criar nova reunião
  async criar(reuniaoData: Omit<Reuniao, 'id' | 'created_at' | 'updated_at' | 'projeto_nome' | 'cliente_nome' | 'cliente_foto'>) {
    return api.post<Reuniao>('/reunioes-supabase', reuniaoData);
  },

  // Atualizar reunião
  async atualizar(id: number, reuniaoData: Partial<Omit<Reuniao, 'id' | 'created_at' | 'updated_at' | 'projeto_nome' | 'cliente_nome' | 'cliente_foto'>>) {
    return api.put<Reuniao>(`/reunioes-supabase/${id}`, reuniaoData);
  },

  // Excluir reunião
  async excluir(id: number) {
    return api.delete(`/reunioes-supabase/${id}`);
  }
}; 