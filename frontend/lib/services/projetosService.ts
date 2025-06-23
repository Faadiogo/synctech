import { projetoSchema, projetoUpdateSchema } from '@/schemas/projetosSchema';
import { z } from 'zod';
import { api } from '@/lib/axios';

export type Projeto = z.infer<typeof projetoSchema> & {
  id: number;
  created_at: string;
  updated_at: string;

  // Campos adicionais vindos da API
  nome_empresa?: string;
  nome_completo?: string;
  cliente_nome?: string;
  cliente_foto?: string;
  progresso_calculado?: number;
};


export type ProjetoCreate = Omit<Projeto, 'id' | 'created_at' | 'updated_at'>;
export type ProjetoUpdate = Partial<ProjetoCreate>;

export const projetosService = {
  async listar(filtros?: {
    cliente_id?: number;
    busca?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, any> = {};
    if (filtros?.cliente_id) params.cliente_id = filtros.cliente_id;
    if (filtros?.busca) params.busca = filtros.busca;
    if (filtros?.page) params.page = filtros.page;
    if (filtros?.limit) params.limit = filtros.limit;

    const response = await api.get<{ data: Projeto[]; pagination: any }>('/projetos', { params });
    return response.data;
  },

  async buscarPorId(id: number) {
    const response = await api.get<Projeto>(`/projetos/${id}`);
    return response.data;
  },

  async criar(projetoData: ProjetoCreate) {
    const parseResult = projetoSchema.safeParse(projetoData);
    if (!parseResult.success) {
      throw new Error(`Dados inválidos: ${parseResult.error.message}`);
    }
    const response = await api.post<Projeto>('/projetos', projetoData);
    return response.data;
  },

  async atualizar(id: number, projetoData: ProjetoUpdate) {
    const parseResult = projetoUpdateSchema.safeParse(projetoData);
    if (!parseResult.success) {
      throw new Error(`Dados inválidos: ${parseResult.error.message}`);
    }
    const response = await api.put<Projeto>(`/projetos/${id}`, projetoData);
    return response.data;
  },

  async excluir(id: number) {
    const response = await api.delete(`/projetos/${id}`);
    return response.data;
  }
};
