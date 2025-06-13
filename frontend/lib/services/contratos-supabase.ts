import { api } from '../api';

export interface Contrato {
  id: number;
  numero_contrato: string;
  cliente_id: number;
  cliente_nome?: string;
  cliente_foto?: string;
  projeto_id?: number;
  projeto_nome?: string;
  orcamento_id?: number;
  valor_orcado?: number;
  desconto?: number;
  data_assinatura: string;
  valor_contrato: number;
  qtd_parcelas: number;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const contratosSupabaseService = {
  // Listar contratos com filtros
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

    return api.get<Contrato[]>('/contratos-supabase', params);
  },

  // Buscar contrato por ID
  async buscarPorId(id: number) {
    return api.get<Contrato>(`/contratos-supabase/${id}`);
  },

  // Criar novo contrato
  async criar(contratoData: Omit<Contrato, 'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'cliente_foto' | 'projeto_nome'>) {
    return api.post<Contrato>('/contratos-supabase', contratoData);
  },

  // Atualizar contrato
  async atualizar(id: number, contratoData: Partial<Omit<Contrato, 'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'cliente_foto' | 'projeto_nome'>>) {
    return api.put<Contrato>(`/contratos-supabase/${id}`, contratoData);
  },

  // Excluir contrato
  async excluir(id: number) {
    return api.delete(`/contratos-supabase/${id}`);
  }
}; 