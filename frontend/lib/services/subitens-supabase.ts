import { api } from '../api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Subitem {
  id: number;
  nivel3_id: number;
  nome: string;
  descricao?: string;
  data_inicio?: string;
  data_alvo?: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  horas_estimadas?: number;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSubitemData {
  subfuncionalidade_id: number;
  nome: string;
  descricao?: string;
  status?: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  data_inicio?: string;
  data_alvo?: string;
  horas_estimadas?: number;
  ordem?: number;
}

export interface UpdateSubitemData extends Partial<CreateSubitemData> {}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const subitensSupabaseService = {
  // Listar subitens por nivel3
  async listarPorNivel3(nivel3Id: number) {
    return api.get<Subitem[]>(`/subitens-supabase/nivel3/${nivel3Id}`);
  },

  // Manter compatibilidade - listar por subfuncionalidade
  async listarPorSubfuncionalidade(subfuncionalidadeId: number) {
    return api.get<Subitem[]>(`/subitens-supabase/subfuncionalidade/${subfuncionalidadeId}`);
  },

  // Buscar subitem por ID
  async buscarPorId(id: number) {
    return api.get<Subitem>(`/subitens-supabase/${id}`);
  },

  // Criar novo subitem
  async criar(subitemData: Omit<Subitem, 'id' | 'created_at' | 'updated_at'>) {
    return api.post<Subitem>('/subitens-supabase', subitemData);
  },

  // Atualizar subitem
  async atualizar(id: number, subitemData: Partial<Omit<Subitem, 'id' | 'created_at' | 'updated_at'>>) {
    return api.put<Subitem>(`/subitens-supabase/${id}`, subitemData);
  },

  // Excluir subitem
  async excluir(id: number) {
    return api.delete(`/subitens-supabase/${id}`);
  }
}; 