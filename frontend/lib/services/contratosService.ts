import { api } from '@/lib/axios';
import { contratoSchema } from '@/schemas/contratosSchema';
import { z } from 'zod';

export type Contrato = z.infer<typeof contratoSchema>;

export type ContratoComCliente = Contrato & {
  id: number;
  numero_contrato: string;
  cliente_nome?: string;
  cliente_foto?: string;
  projeto_nome?: string;
};

type ListaContratosResponse = {
  data: ContratoComCliente[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export const contratosService = {
  async listar(filtros?: {
    status?: string;
    cliente_id?: number;
    busca?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, string> = {};
    
    if (filtros?.status) params.status = filtros.status;
    if (filtros?.cliente_id) params.cliente_id = filtros.cliente_id.toString();
    if (filtros?.busca) params.busca = filtros.busca;
    if (filtros?.page) params.page = filtros.page.toString();
    if (filtros?.limit) params.limit = filtros.limit.toString();

    const response = await api.get<ListaContratosResponse>('/api/contratos', { params });
    return response.data;
  },

  async buscarPorId(id: number) {
    const response = await api.get<ContratoComCliente>(`/api/contratos/${id}`);
    return response.data;
  },

  async criar(
    contratoData: Omit<
      Contrato,
      'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'cliente_foto' | 'projeto_nome'
    >
  ) {
    const response = await api.post<ContratoComCliente>('/api/contratos', contratoData);
    return response.data;
  },

  async atualizar(
    id: number,
    contratoData: Partial<
      Omit<Contrato, 'id' | 'created_at' | 'updated_at' | 'cliente_nome' | 'cliente_foto' | 'projeto_nome'>
    >
  ) {
    const response = await api.put<ContratoComCliente>(`/api/contratos/${id}`, contratoData);
    return response.data;
  },

  async excluir(id: number) {
    await api.delete(`/api/contratos/${id}`);
  }
};
