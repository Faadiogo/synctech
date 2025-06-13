import { api } from '../api';

export interface Orcamento {
  id: number;
  numero_orcamento: string;
  cliente_id: number;
  cliente_nome?: string;
  cliente_foto?: string;
  projeto_id: number;
  projeto_nome?: string;
  escopo_funcional_id?: number;
  data_envio?: string;
  data_validade: string;
  valor_total: number;
  desconto?: number;
  valor_final: number;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const orcamentosSupabaseService = {
  // Listar orçamentos com filtros
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

    return api.get<Orcamento[]>('/orcamentos-supabase', params);
  },

  // Buscar orçamento por ID
  async buscarPorId(id: number) {
    return api.get<Orcamento>(`/orcamentos-supabase/${id}`);
  },

  // Criar novo orçamento
  async criar(orcamentoData: Omit<Orcamento, 'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'cliente_foto' | 'projeto_nome'>) {
    return api.post<Orcamento>('/orcamentos-supabase', orcamentoData);
  },

  // Atualizar orçamento
  async atualizar(id: number, orcamentoData: Partial<Omit<Orcamento, 'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'cliente_foto' | 'projeto_nome'>>) {
    return api.put<Orcamento>(`/orcamentos-supabase/${id}`, orcamentoData);
  },

  // Excluir orçamento
  async excluir(id: number) {
    return api.delete(`/orcamentos-supabase/${id}`);
  }
}; 