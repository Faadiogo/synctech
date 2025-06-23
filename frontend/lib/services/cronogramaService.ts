import { api } from '@/lib/axios';
import { cronogramaSchema, type CronogramaData } from '@/schemas/cronogramasSchema';

type CronogramaCreate = CronogramaData;
type CronogramaUpdate = Partial<CronogramaData>;

export const cronogramaService = {
  async listar(filtros?: {
    status?: string;
    projeto_id?: number;
    busca?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, any> = {};
    if (filtros?.status) params.status = filtros.status;
    if (filtros?.projeto_id) params.projeto_id = filtros.projeto_id;
    if (filtros?.busca) params.busca = filtros.busca;
    if (filtros?.page) params.page = filtros.page;
    if (filtros?.limit) params.limit = filtros.limit;

    return api.get<CronogramaData[]>('/api/cronograma', { params });
  },

  async buscarPorId(id: number) {
    return api.get<CronogramaData>(`/api/cronograma/${id}`);
  },

  async criar(cronogramaData: CronogramaCreate) {
    const parsed = cronogramaSchema.safeParse(cronogramaData);
    if (!parsed.success) {
      throw new Error(`Dados inválidos: ${parsed.error.message}`);
    }
    return api.post<CronogramaData>('/api/cronograma', cronogramaData);
  },

  async atualizar(id: number, cronogramaData: CronogramaUpdate) {
    const parsed = cronogramaSchema.partial().safeParse(cronogramaData);
    if (!parsed.success) {
      throw new Error(`Dados inválidos: ${parsed.error.message}`);
    }
    return api.put<CronogramaData>(`/api/cronograma/${id}`, cronogramaData);
  },

  async excluir(id: number) {
    return api.delete(`/api/cronograma/${id}`);
  }
};
