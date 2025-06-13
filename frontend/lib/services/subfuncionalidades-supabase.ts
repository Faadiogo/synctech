import { api } from '../api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Subfuncionalidade {
  id: number;
  nivel2_id: number;
  nome: string;
  descricao?: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  data_inicio?: string;
  data_alvo?: string;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSubfuncionalidadeData {
  funcionalidade_id: number;
  nome: string;
  descricao?: string;
  status?: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  data_inicio?: string;
  data_alvo?: string;
  ordem?: number;
}

export interface UpdateSubfuncionalidadeData extends Partial<CreateSubfuncionalidadeData> {}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const subfuncionalidadesSupabaseService = {
  // Listar subfuncionalidades por nivel2
  async listarPorNivel2(nivel2Id: number) {
    return api.get<Subfuncionalidade[]>(`/subfuncionalidades-supabase/nivel2/${nivel2Id}`);
  },

  // Buscar subfuncionalidade por ID
  async buscarPorId(id: number) {
    return api.get<Subfuncionalidade>(`/subfuncionalidades-supabase/${id}`);
  },

  // Criar nova subfuncionalidade
  async criar(subfuncionalidadeData: Omit<Subfuncionalidade, 'id' | 'created_at' | 'updated_at'>) {
    return api.post<Subfuncionalidade>('/subfuncionalidades-supabase', subfuncionalidadeData);
  },

  // Atualizar subfuncionalidade
  async atualizar(id: number, subfuncionalidadeData: Partial<Omit<Subfuncionalidade, 'id' | 'created_at' | 'updated_at'>>) {
    return api.put<Subfuncionalidade>(`/subfuncionalidades-supabase/${id}`, subfuncionalidadeData);
  },

  // Excluir subfuncionalidade
  async excluir(id: number) {
    return api.delete(`/subfuncionalidades-supabase/${id}`);
  }
}; 