'use client';

import { useState, useEffect } from 'react';
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
import { Search, Plus, MoreHorizontal, Calendar, Clock, DollarSign, Edit, Trash2, FolderOpen, Loader2 } from 'lucide-react';
import { projetosService } from '@/lib/services/projetos';
import { Projeto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProjectListProps {
  onNewProject: () => void;
  refreshTrigger?: number;
}

export function ProjectList({ onNewProject, refreshTrigger }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projetosService.listar({
        busca: searchTerm || undefined,
        page: currentPage,
        limit: 10
      });
      setProjects(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentPage, refreshTrigger]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadProjects();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleExcluirProjeto = async (id: number) => {
    try {
      await projetosService.excluir(id);
      toast({
        title: "Sucesso",
        description: "Projeto excluído com sucesso.",
      });
      loadProjects();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o projeto.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'nao_iniciado': 'bg-gray-100 text-gray-800',
      'planejamento': 'status-info',
      'apresentado': 'bg-purple-100 text-purple-800',
      'orcamento_entregue': 'status-pending',
      'orcamento_aprovado': 'bg-orange-100 text-orange-800',
      'contrato_assinado': 'bg-green-100 text-green-800',
      'em_andamento': 'status-info',
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

  const filteredProjects = projects;

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Projetos</h2>
                <p className="text-muted-foreground">Gerencie todos os seus projetos de desenvolvimento</p>
              </div>
            </div>
            <Button onClick={onNewProject} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Novo Projeto
            </Button>
          </div>
        </div>
      </div>

      <Card className="tech-card">
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
              <Badge variant="outline" className="status-info">
                {filteredProjects.length} projeto(s) encontrado(s)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando projetos...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
            </div>
          ) : (
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
                  <TableRow key={project.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <FolderOpen className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">{project.nome}</div>
                          <div className="text-sm text-muted-foreground">ID: #{project.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{project.nome_empresa || project.nome_completo || project.cliente_nome || 'Cliente não informado'}</div>
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
                        <Progress value={project.progresso_calculado || project.progresso || 0} className="w-16 h-2" />
                        <span className="text-sm font-medium w-10 text-primary">
                          {Math.round(project.progresso_calculado || project.progresso || 0)}%
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
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          R$ {project.valor_estimado.toLocaleString('pt-BR')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.tecnologias && project.tecnologias.length > 0 ? (
                          <>
                            {project.tecnologias.slice(0, 2).map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs status-pending">
                                {tech}
                              </Badge>
                            ))}
                            {project.tecnologias.length > 2 && (
                              <Badge variant="outline" className="text-xs bg-muted">
                                +{project.tecnologias.length - 2}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Não informado</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-muted">
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
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleExcluirProjeto(project.id)}
                          >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}