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
  Briefcase
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
import { SettingsList } from '@/components/settings/settings-list';
import { ScopeForm } from '@/components/scopes/scope-form';
import { ScheduleForm } from '@/components/schedules/schedule-form';
import { SettingsForm } from '@/components/settings/settings-form';

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
        case 'settings':
          return <SettingsForm onClose={() => setShowForm(false)} />;
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
      case 'settings':
        return <SettingsList />;
      default:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Visão geral dos seus projetos e atividades</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Clientes Ativos</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.clientesAtivos}</div>
                  <p className="text-xs text-gray-500">Total de {stats.clientesAtivos} clientes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Projetos Ativos</CardTitle>
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.projetosAtivos}</div>
                  <p className="text-xs text-gray-500">De {stats.projetosAtivos} projetos totais</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Valor em Projetos</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {stats.valorProjetos.toLocaleString('pt-BR')}</div>
                  <p className="text-xs text-gray-500">Valor total estimado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Tarefas Pendentes</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.tarefasPendentes}</div>
                  <p className="text-xs text-gray-500">De {stats.tarefasPendentes + 5} tarefas totais</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Projetos em Andamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Projetos em Andamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projetosAndamento.map(projeto => (
                    <div key={projeto.id} className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{projeto.nome}</h3>
                          <p className="text-xs text-gray-600">{projeto.cliente}</p>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={projeto.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {projeto.status === 'em_andamento' ? 'Em Andamento' : 'Planejamento'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso</span>
                          <span>{projeto.progresso}%</span>
                        </div>
                        <Progress value={projeto.progresso} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tarefas Próximas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Tarefas Próximas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tarefasProximas.map(tarefa => (
                    <div key={tarefa.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{tarefa.titulo}</h3>
                        <p className="text-xs text-gray-600">{tarefa.projeto}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            className="bg-yellow-100 text-yellow-800"
                          >
                            Média
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-800"
                          >
                            Em Andamento
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>Prazo: {tarefa.prazo}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Horas Trabalhadas</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.horasTrabalhadas}h</div>
                  <p className="text-xs text-gray-500">Este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Reuniões Hoje</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.reunioesHoje}</div>
                  <p className="text-xs text-gray-500">Reuniões agendadas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Taxa de Sucesso</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.taxaSucesso}%</div>
                  <p className="text-xs text-gray-500">Projetos entregues no prazo</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        activePage={activePage} 
        onPageChange={(page) => {
          setActivePage(page);
          setShowForm(false);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 bg-purple-500">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}