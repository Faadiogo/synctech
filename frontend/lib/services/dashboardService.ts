import { api } from '@/lib/axios';

export interface DashboardStats {
  total_clientes: number;
  clientes_ativos: number;
  total_projetos: number;
  projetos_em_andamento: number;
  projetos_concluidos: number;
  receita_total: number;
  receita_mes_atual: number;
  valor_pendente: number;
}

export interface ProjetoRecente {
  id: number;
  nome: string;
  cliente_nome: string;
  status: string;
  progresso: number;
  data_inicio: string;
  data_alvo?: string;
}

export interface TaskRecente {
  id: number;
  titulo: string;
  projeto_nome: string;
  status: string;
  prioridade: string;
  data_prazo?: string;
}

export interface ReuniaoProxima {
  id: number;
  titulo: string;
  projeto_nome?: string;
  cliente_nome?: string;
  data_reuniao: string;
  tipo: string;
}

export interface DashboardData {
  stats: DashboardStats;
  projetos_recentes: ProjetoRecente[];
  tasks_recentes: TaskRecente[];
  reunioes_proximas: ReuniaoProxima[];
}

export const dashboardService = {
  // Buscar todos os dados do dashboard
  async buscarDados() {
    return api.get<DashboardData>('/dashboard');
  },

  // Buscar apenas estatísticas
  async buscarEstatisticas() {
    return api.get<DashboardStats>('/dashboard/stats');
  },

  // Buscar projetos recentes
  async buscarProjetosRecentes(limit: number = 5) {
    return api.get<ProjetoRecente[]>('/dashboard/projetos-recentes', { limit: limit.toString() });
  },

  // Buscar tarefas recentes
  async buscarTasksRecentes(limit: number = 5) {
    return api.get<TaskRecente[]>('/dashboard/tasks-recentes', { limit: limit.toString() });
  },

  // Buscar próximas reuniões
  async buscarReuniaoesProximas(limit: number = 5) {
    return api.get<ReuniaoProxima[]>('/dashboard/reunioes-proximas', { limit: limit.toString() });
  }
}; 