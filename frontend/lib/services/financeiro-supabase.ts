import { api } from '../api';

export interface TransacaoFinanceira {
  id: number;
  contrato_numero: string;
  cliente_nome: string;
  cliente_foto?: string;
  tipo_movimento: 'entrada' | 'saida';
  descricao: string;
  valor: number;
  forma_pagamento: string;
  data_vencimento: string;
  data_pagamento?: string;
  status: string;
  numero_parcela?: number;
  contrato_id?: number;
  cliente_id?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const financeiroSupabaseService = {
  // Listar transações financeiras com filtros
  async listar(filtros?: {
    status?: string;
    tipo_movimento?: 'entrada' | 'saida';
    cliente_id?: number;
    contrato_id?: number;
    busca?: string;
    data_inicio?: string;
    data_fim?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, string> = {};
    
    if (filtros?.status) {
      params.status = filtros.status;
    }
    if (filtros?.tipo_movimento) {
      params.tipo_movimento = filtros.tipo_movimento;
    }
    if (filtros?.cliente_id) {
      params.cliente_id = filtros.cliente_id.toString();
    }
    if (filtros?.contrato_id) {
      params.contrato_id = filtros.contrato_id.toString();
    }
    if (filtros?.busca) {
      params.busca = filtros.busca;
    }
    if (filtros?.data_inicio) {
      params.data_inicio = filtros.data_inicio;
    }
    if (filtros?.data_fim) {
      params.data_fim = filtros.data_fim;
    }
    if (filtros?.page) {
      params.page = filtros.page.toString();
    }
    if (filtros?.limit) {
      params.limit = filtros.limit.toString();
    }

    return api.get<TransacaoFinanceira[]>('/financeiro-supabase', params);
  },

  // Buscar transação por ID
  async buscarPorId(id: number) {
    return api.get<TransacaoFinanceira>(`/financeiro-supabase/${id}`);
  },

  // Criar nova transação
  async criar(transacaoData: Omit<TransacaoFinanceira, 'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'cliente_foto'>) {
    return api.post<TransacaoFinanceira>('/financeiro-supabase', transacaoData);
  },

  // Atualizar transação
  async atualizar(id: number, transacaoData: Partial<Omit<TransacaoFinanceira, 'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'cliente_foto'>>) {
    return api.put<TransacaoFinanceira>(`/financeiro-supabase/${id}`, transacaoData);
  },

  // Excluir transação
  async excluir(id: number) {
    return api.delete(`/financeiro-supabase/${id}`);
  }
}; 