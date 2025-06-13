import { api } from '../api';

export interface Nivel1 {
  id: number;
  escopo_funcional_id: number;
  nivel1_tipo_id: number;
  nome?: string; // nome específico para este projeto (opcional)
  descricao?: string;
  data_inicio?: string;
  data_alvo?: string;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  ordem: number;
  created_at: string;
  updated_at: string;
}

export const nivel1SupabaseService = {
  // Listar nivel1 por escopo funcional
  async listarPorEscopo(escopoFuncionalId: number) {
    return api.get<Nivel1[]>(`/nivel1-supabase/escopo/${escopoFuncionalId}`);
  },

  // Buscar nivel1 por ID
  async buscarPorId(id: number) {
    return api.get<Nivel1>(`/nivel1-supabase/${id}`);
  },

  // Criar novo nivel1
  async criar(nivel1Data: Omit<Nivel1, 'id' | 'created_at' | 'updated_at'>) {
    return api.post<Nivel1>('/nivel1-supabase', nivel1Data);
  },

  // Atualizar nivel1
  async atualizar(id: number, nivel1Data: Partial<Omit<Nivel1, 'id' | 'created_at' | 'updated_at'>>) {
    return api.put<Nivel1>(`/nivel1-supabase/${id}`, nivel1Data);
  },

  // Excluir nivel1
  async excluir(id: number) {
    return api.delete(`/nivel1-supabase/${id}`);
  }
}; 