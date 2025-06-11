'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Search, Plus, MoreHorizontal, Calendar, Clock, DollarSign, Edit, Trash2 } from 'lucide-react';

interface Project {
  id: number;
  nome: string;
  cliente_nome: string;
  status: string;
  data_inicio?: string;
  data_alvo?: string;
  progresso: number;
  valor_estimado?: number;
  tecnologias: string[];
}

interface ProjectListProps {
  onNewProject: () => void;
}

export function ProjectList({ onNewProject }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data
  const projects: Project[] = [
    {
      id: 1,
      nome: 'Sistema de Gestão Empresarial',
      cliente_nome: 'TechCorp Solutions',
      status: 'em_andamento',
      data_inicio: '2024-01-01',
      data_alvo: '2024-04-15',
      progresso: 40,
      valor_estimado: 85000,
      tecnologias: ['React', 'Node.js', 'PostgreSQL']
    },
    {
      id: 2,
      nome: 'E-commerce Personalizado',
      cliente_nome: 'Maria Santos',
      status: 'planejamento',
      data_alvo: '2024-03-20',
      progresso: 0,
      valor_estimado: 80000,
      tecnologias: ['Next.js', 'Stripe', 'MongoDB']
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'nao_iniciado': 'bg-gray-100 text-gray-800',
      'planejamento': 'bg-blue-100 text-blue-800',
      'apresentado': 'bg-purple-100 text-purple-800',
      'orcamento_entregue': 'bg-yellow-100 text-yellow-800',
      'orcamento_aprovado': 'bg-orange-100 text-orange-800',
      'contrato_assinado': 'bg-green-100 text-green-800',
      'em_andamento': 'bg-blue-100 text-blue-800',
      'entregue': 'bg-green-100 text-green-800',
      'suporte_garantia': 'bg-indigo-100 text-indigo-800',
      'concluido': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'nao_iniciado': 'Não Iniciado',
      'planejamento': 'Planejamento',
      'apresentado': 'Apresentado',
      'orcamento_entregue': 'Orçamento Entregue',
      'orcamento_aprovado': 'Orçamento Aprovado',
      'contrato_assinado': 'Contrato Assinado',
      'em_andamento': 'Em Andamento',
      'entregue': 'Entregue',
      'suporte_garantia': 'Suporte/Garantia',
      'concluido': 'Concluído'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    return (
      project.nome.toLowerCase().includes(searchLower) ||
      project.cliente_nome.toLowerCase().includes(searchLower) ||
      project.tecnologias.some(tech => tech.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projetos</h2>
          <p className="text-gray-600">Gerencie todos os seus projetos de desenvolvimento</p>
        </div>
        <Button onClick={onNewProject} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredProjects.length} projeto(s) encontrado(s)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tecnologias</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.nome}</div>
                      <div className="text-sm text-gray-500">ID: #{project.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{project.cliente_nome}</div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(project.status)}
                    >
                      {getStatusText(project.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={project.progresso} className="w-16 h-2" />
                      <span className="text-sm font-medium w-10">
                        {project.progresso}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.data_alvo && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {new Date(project.data_alvo).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.valor_estimado && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        R$ {project.valor_estimado.toLocaleString('pt-BR')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.tecnologias.slice(0, 2).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.tecnologias.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tecnologias.length - 2}
                        </Badge>
                      )}
                    </div>
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
                        <DropdownMenuItem>Ver tarefas</DropdownMenuItem>
                        <DropdownMenuItem>Gerar orçamento</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Arquivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}