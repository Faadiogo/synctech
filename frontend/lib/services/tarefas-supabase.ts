import { api } from '../api';

export interface Tarefa {
  id: number;
  titulo: string;
  projeto_id: number;
  projeto_nome?: string;
  cliente_nome?: string;
  cliente_foto?: string;
  status: string;
  prioridade: string;
  data_inicio?: string;
  data_alvo?: string;
  horas_estimadas?: number;
  horas_trabalhadas?: number;
  responsavel: string;
  descricao?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const tarefasSupabaseService = {
  // Listar tarefas com filtros
  async listar(filtros?: {
    status?: string;
    prioridade?: string;
    projeto_id?: number;
    responsavel?: string;
    busca?: string;
    page?: number;
    limit?: number;
  }) {
    const params: Record<string, string> = {};
    
    if (filtros?.status) {
      params.status = filtros.status;
    }
    if (filtros?.prioridade) {
      params.prioridade = filtros.prioridade;
    }
    if (filtros?.projeto_id) {
      params.projeto_id = filtros.projeto_id.toString();
    }
    if (filtros?.responsavel) {
      params.responsavel = filtros.responsavel;
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

    return api.get<Tarefa[]>('/tarefas-supabase', params);
  },

  // Buscar tarefa por ID
  async buscarPorId(id: number) {
    return api.get<Tarefa>(`/tarefas-supabase/${id}`);
  },

  // Criar nova tarefa
  async criar(tarefaData: Omit<Tarefa, 'id' | 'created_at' | 'updated_at' | 'projeto_nome' | 'cliente_nome' | 'cliente_foto'>) {
    return api.post<Tarefa>('/tarefas-supabase', tarefaData);
  },

  // Atualizar tarefa
  async atualizar(id: number, tarefaData: Partial<Omit<Tarefa, 'id' | 'created_at' | 'updated_at' | 'projeto_nome' | 'cliente_nome' | 'cliente_foto'>>) {
    return api.put<Tarefa>(`/tarefas-supabase/${id}`, tarefaData);
  },

  // Excluir tarefa
  async excluir(id: number) {
    return api.delete(`/tarefas-supabase/${id}`);
  }
}; 