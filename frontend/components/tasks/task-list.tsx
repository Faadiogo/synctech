'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/scopes/ui/card';
import { Button } from '@/components/scopes/ui/button';
import { Input } from '@/components/scopes/ui/input';
import { Badge } from '@/components/scopes/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/scopes/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/scopes/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Circle,
  Play,
  Edit,
  Trash2,
  CheckSquare,
  ChevronDown,
  Square,
  ChevronUp
} from 'lucide-react';
import { Checkbox } from '@/components/scopes/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/scopes/ui/select';

interface Task {
  id: number;
  titulo: string;
  projeto_nome: string;
  cliente_nome: string;
  status: string;
  prioridade: string;
  data_inicio?: string;
  data_alvo?: string;
  horas_estimadas?: number;
  horas_trabalhadas?: number;
  responsavel: string;
}

interface TaskListProps {
  onNewTask?: () => void;
  refreshTrigger?: number;
}

export function TaskList({ onNewTask, refreshTrigger }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'nao_iniciada' | 'em_andamento' | 'concluida' | 'cancelada'>('todos');
  
  // Mock data
  const tasks: Task[] = [
    {
      id: 1,
      titulo: 'Desenvolvimento da tela de login',
      projeto_nome: 'Sistema de Gestão Empresarial',
      cliente_nome: 'TechCorp Solutions',
      status: 'em_andamento',
      prioridade: 'media',
      data_inicio: '2024-01-10',
      data_alvo: '2024-03-07',
      horas_estimadas: 16,
      horas_trabalhadas: 8,
      responsavel: 'João Silva'
    },
    {
      id: 2,
      titulo: 'Configuração do banco de dados',
      projeto_nome: 'E-commerce Personalizado',
      cliente_nome: 'Maria Santos',
      status: 'nao_iniciada',
      prioridade: 'alta',
      data_alvo: '2024-01-20',
      horas_estimadas: 8,
      horas_trabalhadas: 0,
      responsavel: 'Maria Santos'
    }
  ];

  const getStatusIcon = (status: string) => {
    const icons = {
      'nao_iniciada': Circle,
      'em_andamento': Play,
      'concluida': CheckCircle,
      'cancelada': AlertCircle
    };
    const Icon = icons[status as keyof typeof icons] || Circle;
    return Icon;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'nao_iniciada': 'text-gray-400',
      'em_andamento': 'text-blue-500',
      'concluida': 'text-green-500',
      'cancelada': 'text-red-500'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'nao_iniciada': 'Não Iniciada',
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída',
      'cancelada': 'Cancelada'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPriorityColor = (prioridade: string) => {
    const colors = {
      'baixa': 'bg-gray-100 text-gray-800',
      'media': 'status-info',
      'alta': 'bg-orange-100 text-orange-800',
      'critica': 'bg-red-100 text-red-800'
    };
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityText = (prioridade: string) => {
    const texts = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta',
      'critica': 'Crítica'
    };
    return texts[prioridade as keyof typeof texts] || prioridade;
  };

  const filteredTasks = tasks.filter(task => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      task.titulo.toLowerCase().includes(searchLower) ||
      task.projeto_nome.toLowerCase().includes(searchLower) ||
      task.cliente_nome.toLowerCase().includes(searchLower) ||
      task.responsavel.toLowerCase().includes(searchLower)
    );
    const matchesStatus = statusFilter === 'todos' ? true : task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTaskCount = (count: number) => {
    if (count === 0) return '0 tarefas';
    if (count === 1) return '1 tarefa';
    return `${count} tarefas`;
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTasks([]);
      setIsAllSelected(false);
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id));
      setIsAllSelected(true);
    }
  };

  const handleSelectTask = (id: number) => {
    setSelectedTasks(prev => {
      const n = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      setIsAllSelected(n.length === filteredTasks.length);
      return n;
    });
  };

  const handleBulkAction = (action: 'concluir' | 'cancelar' | 'excluir') => {
    if (selectedTasks.length === 0) return;
    console.log('bulk', action, selectedTasks);
    setSelectedTasks([]);
    setIsAllSelected(false);
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <CheckSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Tarefas</h2>
                <p className="text-muted-foreground">Gerencie todas as tarefas dos projetos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="status-info w-52 text-center justify-center text-lg">
                Total: {getTaskCount(filteredTasks.length)}
              </Badge>
            </div>
            <Button onClick={onNewTask} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </div>
        </div>
      </div>

      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center gap-4 justify-between">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedTasks.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {selectedTasks.length} selecionada(s)
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      Ações em Lote
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('concluir')}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Concluir Selecionadas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('cancelar')}>
                      <AlertCircle className="mr-2 h-4 w-4 text-orange-600" />
                      Cancelar Selecionadas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('excluir')}>
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      Excluir Selecionadas
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="nao_iniciada">Não Iniciada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="Selecionar todos" />
                </TableHead>
                <TableHead>Tarefa</TableHead>
                <TableHead>Projeto/Cliente</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => {
                const StatusIcon = getStatusIcon(task.status);
                return (
                  <TableRow key={task.id} className={`hover:bg-muted/50 transition-colors ${task.status === 'concluida' ? 'opacity-60' : ''}`}>
                    <TableCell>
                      <Checkbox checked={selectedTasks.includes(task.id)} onCheckedChange={() => handleSelectTask(task.id)} aria-label={`Selecionar tarefa ${task.titulo}`} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className={`font-medium ${task.status === 'concluida' ? 'line-through' : ''}`}>
                            {task.titulo}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getStatusText(task.status)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{task.projeto_nome}</div>
                        <div className="text-sm text-muted-foreground">{task.cliente_nome}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={getPriorityColor(task.prioridade)}
                      >
                        {getPriorityText(task.prioridade)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.data_alvo && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(task.data_alvo).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.horas_estimadas && (
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span>
                              {task.horas_trabalhadas}h / {task.horas_estimadas}h
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {Math.round(((task.horas_trabalhadas || 0) / task.horas_estimadas) * 100)}% concluído
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{task.responsavel}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <Badge variant="outline" className="bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Badge>
                        {task.status !== 'concluida' && (
                          <Badge variant="outline" className="bg-green-500 text-white cursor-pointer hover:bg-green-600" title="Concluir">
                            <CheckCircle className="h-4 w-4" />
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-red-500 text-white cursor-pointer hover:bg-red-600" title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}