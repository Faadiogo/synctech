import { api } from '../api';

export interface Funcionalidade {
  id: number;
  nivel1_id: number;
  nome: string;
  descricao?: string;
  data_inicio?: string;
  data_alvo?: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  ordem: number;
  created_at: string;
  updated_at: string;
}

export const funcionalidadesSupabaseService = {
  // Listar funcionalidades por nivel1
  async listarPorNivel1(nivel1Id: number) {
    return api.get<Funcionalidade[]>(`/funcionalidades-supabase/nivel1/${nivel1Id}`);
  },

  // Listar funcionalidades por escopo (compatibilidade)
  async listarPorEscopo(escopoId: number) {
    return api.get<Funcionalidade[]>(`/funcionalidades-supabase/escopo/${escopoId}`);
  },

  // Buscar funcionalidade por ID
  async buscarPorId(id: number) {
    return api.get<Funcionalidade>(`/funcionalidades-supabase/${id}`);
  },

  // Criar nova funcionalidade
  async criar(funcionalidadeData: Omit<Funcionalidade, 'id' | 'created_at' | 'updated_at'>) {
    return api.post<Funcionalidade>('/funcionalidades-supabase', funcionalidadeData);
  },

  // Atualizar funcionalidade
  async atualizar(id: number, funcionalidadeData: Partial<Omit<Funcionalidade, 'id' | 'created_at' | 'updated_at'>>) {
    return api.put<Funcionalidade>(`/funcionalidades-supabase/${id}`, funcionalidadeData);
  },

  // Excluir funcionalidade
  async excluir(id: number) {
    return api.delete(`/funcionalidades-supabase/${id}`);
  }
}; 