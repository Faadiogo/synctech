'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FolderOpen, 
  FileText, 
  CreditCard, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  DollarSign,
  Target,
  Briefcase,
  Activity,
  Zap
} from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { ClientList } from '@/components/clients/client-list';
import { ClientForm } from '@/components/clients/client-form';
import { ProjectList } from '@/components/projects/project-list';
import { ProjectForm } from '@/components/projects/project-form';
import { BudgetList } from '@/components/budgets/budget-list';
import { BudgetForm } from '@/components/budgets/budget-form';
import { ContractList } from '@/components/contracts/contract-list';
import { ContractForm } from '@/components/contracts/contract-form';
import { FinancialList } from '@/components/financial/financial-list';
import { FinancialForm } from '@/components/financial/financial-form';
import { MeetingList } from '@/components/meetings/meeting-list';
import { MeetingForm } from '@/components/meetings/meeting-form';
import { TaskList } from '@/components/tasks/task-list';
import { TaskForm } from '@/components/tasks/task-form';
import { ScopeList } from '@/components/scopes/scope-list';
import { ScheduleList } from '@/components/schedules/schedule-list';
import { ScopeForm } from '@/components/scopes/scope-form';
import { ScheduleForm } from '@/components/schedules/schedule-form';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Mock data for dashboard
  const stats = {
    clientesAtivos: 2,
    projetosAtivos: 2,
    valorProjetos: 165000,
    tarefasPendentes: 1,
    horasTrabalhadas: 320,
    reunioesHoje: 0,
    taxaSucesso: 94
  };

  const projetosAndamento = [
    {
      id: 1,
      nome: 'Sistema de Gestão Empresarial',
      cliente: 'TechCorp Solutions',
      progresso: 40,
      status: 'em_andamento'
    },
    {
      id: 2,
      nome: 'E-commerce Personalizado',
      cliente: 'Maria Santos',
      progresso: 0,
      status: 'planejamento'
    }
  ];

  const tarefasProximas = [
    {
      id: 1,
      titulo: 'Desenvolvimento da tela de login',
      projeto: 'Sistema de Gestão Empresarial',
      prioridade: 'media',
      status: 'em_andamento',
      prazo: '07/03/2024'
    }
  ];

  const renderContent = () => {
    if (showForm) {
      switch (activePage) {
        case 'clients':
          return <ClientForm onClose={() => setShowForm(false)} />;
        case 'projects':
          return <ProjectForm onClose={() => setShowForm(false)} />;
        case 'budgets':
          return <BudgetForm onClose={() => setShowForm(false)} />;
        case 'contracts':
          return <ContractForm onClose={() => setShowForm(false)} />;
        case 'financial':
          return <FinancialForm onClose={() => setShowForm(false)} />;
        case 'meetings':
          return <MeetingForm onClose={() => setShowForm(false)} />;
        case 'tasks':
          return <TaskForm onClose={() => setShowForm(false)} />;
        case 'scopes':
          return <ScopeForm onClose={() => setShowForm(false)} />;
        case 'schedules':
          return <ScheduleForm onClose={() => setShowForm(false)} />;
        default:
          return null;
      }
    }

    switch (activePage) {
      case 'clients':
        return <ClientList onNewClient={() => setShowForm(true)} />;
      case 'projects':
        return <ProjectList onNewProject={() => setShowForm(true)} />;
      case 'budgets':
        return <BudgetList onNewBudget={() => setShowForm(true)} />;
      case 'contracts':
        return <ContractList onNewContract={() => setShowForm(true)} />;
      case 'financial':
        return <FinancialList onNewTransaction={() => setShowForm(true)} />;
      case 'meetings':
        return <MeetingList onNewMeeting={() => setShowForm(true)} />;
      case 'tasks':
        return <TaskList onNewTask={() => setShowForm(true)} />;
      case 'scopes':
        return <ScopeList />;
      case 'schedules':
        return <ScheduleList />;
      default:
        return (
          <div className="space-y-8 animate-slide-in">
            {/* Header com gradiente */}
            <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold">Dashboard</h1>
                </div>
                <p className="text-muted-foreground">Visão geral dos seus projetos e atividades</p>
              </div>
            </div>

            {/* Stats Grid com efeitos visuais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="tech-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
                  <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.clientesAtivos}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    Total de {stats.clientesAtivos} clientes
                  </p>
                </CardContent>
              </Card>

              <Card className="tech-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Projetos Ativos</CardTitle>
                  <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <FolderOpen className="h-4 w-4 text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.projetosAtivos}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Activity className="h-3 w-3 text-blue-400" />
                    De {stats.projetosAtivos} projetos totais
                  </p>
                </CardContent>
              </Card>

              <Card className="tech-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Valor em Projetos</CardTitle>
                  <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                    <DollarSign className="h-4 w-4 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">R$ {stats.valorProjetos.toLocaleString('pt-BR')}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    Valor total estimado
                  </p>
                </CardContent>
              </Card>

              <Card className="tech-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tarefas Pendentes</CardTitle>
                  <div className="p-2 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                    <CheckCircle className="h-4 w-4 text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.tarefasPendentes}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-orange-400" />
                    De {stats.tarefasPendentes + 5} tarefas totais
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Projetos em Andamento */}
              <Card className="tech-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    Projetos em Andamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projetosAndamento.map(projeto => (
                    <div key={projeto.id} className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-foreground">{projeto.nome}</h3>
                          <p className="text-xs text-muted-foreground">{projeto.cliente}</p>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={projeto.status === 'em_andamento' ? 'status-info' : 'bg-muted text-muted-foreground'}
                        >
                          {projeto.status === 'em_andamento' ? 'Em Andamento' : 'Planejamento'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="text-primary font-medium">{projeto.progresso}%</span>
                        </div>
                        <Progress value={projeto.progresso} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tarefas Próximas */}
              <Card className="tech-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <Clock className="h-5 w-5 text-accent" />
                    </div>
                    Tarefas Próximas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tarefasProximas.map(tarefa => (
                    <div key={tarefa.id} className="flex items-start gap-3 p-4 border border-border/50 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm text-foreground">{tarefa.titulo}</h3>
                        <p className="text-xs text-muted-foreground">{tarefa.projeto}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="status-pending">
                            Média
                          </Badge>
                          <Badge variant="secondary" className="status-info">
                            Em Andamento
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-orange-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>Prazo: {tarefa.prazo}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Stats com visual melhorado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="tech-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Horas Trabalhadas</CardTitle>
                  <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <Clock className="h-4 w-4 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.horasTrabalhadas}h</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Zap className="h-3 w-3 text-blue-400" />
                    Este mês
                  </p>
                </CardContent>
              </Card>

              <Card className="tech-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Reuniões Hoje</CardTitle>
                  <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <Calendar className="h-4 w-4 text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.reunioesHoje}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3 text-purple-400" />
                    Reuniões agendadas
                  </p>
                </CardContent>
              </Card>

              <Card className="tech-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</CardTitle>
                  <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.taxaSucesso}%</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Target className="h-3 w-3 text-green-400" />
                    Projetos entregues no prazo
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        activePage={activePage} 
        onPageChange={(page) => {
          setActivePage(page);
          setShowForm(false);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}