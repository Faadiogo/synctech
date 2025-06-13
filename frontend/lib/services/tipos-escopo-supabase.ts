import { api } from '../api';

export interface TipoEscopo {
  id: number;
  nome: string;
  descricao?: string;
  cor_hex?: string;
  icon_name?: string;
  created_at: string;
  updated_at: string;
}

export const tiposEscopoSupabaseService = {
  // Listar todos os tipos de escopo
  async listar() {
    return api.get<TipoEscopo[]>('/tipos-escopo-supabase');
  },

  // Buscar tipo de escopo por ID
  async buscarPorId(id: number) {
    return api.get<TipoEscopo>(`/tipos-escopo-supabase/${id}`);
  },

  // Criar novo tipo de escopo
  async criar(tipoEscopoData: Omit<TipoEscopo, 'id' | 'created_at' | 'updated_at'>) {
    return api.post<TipoEscopo>('/tipos-escopo-supabase', tipoEscopoData);
  },

  // Atualizar tipo de escopo
  async atualizar(id: number, tipoEscopoData: Partial<Omit<TipoEscopo, 'id' | 'created_at' | 'updated_at'>>) {
    return api.put<TipoEscopo>(`/tipos-escopo-supabase/${id}`, tipoEscopoData);
  },

  // Excluir tipo de escopo
  async excluir(id: number) {
    return api.delete(`/tipos-escopo-supabase/${id}`);
  }
}; 