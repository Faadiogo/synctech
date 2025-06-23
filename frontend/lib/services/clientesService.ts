import { clienteSchema, clienteUpdateSchema } from '@/schemas/clientesSchema';
import { z } from 'zod';
import { api } from '@/lib/axios';

export type Cliente = z.infer<typeof clienteSchema> & {
  id: number;
  created_at: string;
  updated_at: string;
  projetos_count?: number;
};

export type ClienteCreate = Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'projetos_count'>;
export type ClienteUpdate = Partial<ClienteCreate>;

export const clientesService = {
  async listar(filtros?: {
    ativo?: boolean;
    tipo_pessoa?: 'PF' | 'PJ';
    busca?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, any> = {};
    if (filtros?.ativo !== undefined) params.ativo = filtros.ativo;
    if (filtros?.tipo_pessoa) params.tipo_pessoa = filtros.tipo_pessoa;
    if (filtros?.busca) params.busca = filtros.busca;
    if (filtros?.page) params.page = filtros.page;
    if (filtros?.limit) params.limit = filtros.limit;

    const response = await api.get<{ data: Cliente[]; pagination: any }>('/clientes', { params });
    return response.data;
  },

  async buscarPorId(id: number) {
    const response = await api.get<Cliente>(`/clientes/${id}`);
    return response.data;
  },

  async criar(clienteData: ClienteCreate) {
    const parseResult = clienteSchema.safeParse(clienteData);
    if (!parseResult.success) {
      throw new Error(`Dados inválidos: ${parseResult.error.message}`);
    }
    const response = await api.post<Cliente>('/clientes', clienteData);
    return response.data;
  },

  async atualizar(id: number, clienteData: ClienteUpdate) {
    const parseResult = clienteUpdateSchema.safeParse(clienteData);
    if (!parseResult.success) {
      throw new Error(`Dados inválidos: ${parseResult.error.message}`);
    }
    const response = await api.put<Cliente>(`/clientes/${id}`, clienteData);
    return response.data;
  },

  async desativar(id: number, permanent = false) {
    const url = permanent ? `/clientes/${id}?hard=true` : `/clientes/${id}`;
    const response = await api.delete(url);
    return response.data;
  },

  async buscarProjetos(id: number) {
    const response = await api.get(`/clientes/${id}/projetos`);
    return response.data;
  }
};
