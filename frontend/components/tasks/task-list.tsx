'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Trash2
} from 'lucide-react';

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
  onNewTask: () => void;
}

export function TaskList({ onNewTask }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
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
      'media': 'bg-blue-100 text-blue-800',
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
    return (
      task.titulo.toLowerCase().includes(searchLower) ||
      task.projeto_nome.toLowerCase().includes(searchLower) ||
      task.cliente_nome.toLowerCase().includes(searchLower) ||
      task.responsavel.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tarefas</h2>
          <p className="text-gray-600">Gerencie todas as tarefas dos projetos</p>
        </div>
        <Button onClick={onNewTask} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredTasks.length} tarefa(s) encontrada(s)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Tarefa</TableHead>
                <TableHead>Projeto/Cliente</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => {
                const StatusIcon = getStatusIcon(task.status);
                return (
                  <TableRow key={task.id} className={task.status === 'concluida' ? 'opacity-60' : ''}>
                    <TableCell>
                      <StatusIcon className={`h-5 w-5 ${getStatusColor(task.status)}`} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className={`font-medium ${task.status === 'concluida' ? 'line-through' : ''}`}>
                          {task.titulo}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getStatusText(task.status)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{task.projeto_nome}</div>
                        <div className="text-sm text-gray-500">{task.cliente_nome}</div>
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
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(((task.horas_trabalhadas || 0) / task.horas_estimadas) * 100)}% concluído
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{task.responsavel}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>Registrar tempo</DropdownMenuItem>
                          {task.status !== 'concluida' && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como concluída
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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