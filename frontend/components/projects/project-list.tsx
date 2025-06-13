'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/scopes/ui/card';
import { Button } from '@/components/scopes/ui/button';
import { Input } from '@/components/scopes/ui/input';
import { Badge } from '@/components/scopes/ui/badge';
import { Progress } from '@/components/scopes/ui/progress';
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/scopes/ui/select';
import { Checkbox } from '@/components/scopes/ui/checkbox';
import { Search, Plus, MoreHorizontal, Calendar, Clock, DollarSign, Edit, Trash2, FolderOpen, Loader2, ArrowLeft, Eye, Download, ChevronDown, CheckSquare, Square, FileText} from 'lucide-react';
import { projetosSupabaseService } from '@/lib/services/projetos-supabase';
import { Projeto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProjectListProps {
  onNewProject: () => void;
  refreshTrigger?: number;
  clienteId?: number;
  clienteName?: string;
  onBack?: () => void;
}

export function ProjectList({ onNewProject, refreshTrigger, clienteId, clienteName, onBack }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'nao_iniciado' | 'planejamento' | 'apresentado' | 'orcamento_entregue' | 'orcamento_aprovado' | 'contrato_assinado' | 'em_andamento' | 'entregue' | 'suporte_garantia' | 'concluido'>('todos');
  const { toast } = useToast();

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projetosSupabaseService.listar({
        cliente_id: clienteId,
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

  const getProjectCount = (count: number) => {
    if (count === 0) return '0 projetos';
    if (count === 1) return '1 projeto';
    return `${count} projetos`;
  };

  // Seleção
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProjects([]);
      setIsAllSelected(false);
    } else {
      setSelectedProjects(filteredProjects.map(p => p.id));
      setIsAllSelected(true);
    }
  };

  const handleSelectProject = (id: number) => {
    setSelectedProjects(prev => {
      const newSel = prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id];
      setIsAllSelected(newSel.length === filteredProjects.length);
      return newSel;
    });
  };

  const handleBulkAction = (action: 'concluir' | 'arquivar' | 'excluir') => {
    if (selectedProjects.length === 0) return;
    console.log('Bulk', action, selectedProjects);
    setSelectedProjects([]);
    setIsAllSelected(false);
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

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedProjects([]);
    setIsAllSelected(false);
  }, [statusFilter, searchTerm]);

  const handleExcluirProjeto = async (id: number) => {
    try {
      await projetosSupabaseService.excluir(id);
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

  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      project.nome.toLowerCase().includes(searchLower) ||
      (project.nome_empresa && project.nome_empresa.toLowerCase().includes(searchLower)) ||
      (project.nome_completo && project.nome_completo.toLowerCase().includes(searchLower)) ||
      (project.cliente_nome && project.cliente_nome.toLowerCase().includes(searchLower))
    );
    const matchesStatus = statusFilter === 'todos' ? true : project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
                      <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-2">
                {clienteName && onBack && (
                  <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-white/20">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="p-2 rounded-lg bg-primary/20">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">
                    {clienteName ? `Projetos de ${clienteName}` : 'Projetos'}
                  </h2>
                  <p className="text-muted-foreground">
                    {clienteName ? `Projetos do cliente ${clienteName}` : 'Gerencie todos os seus projetos de desenvolvimento'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="status-info w-52 text-center justify-center text-lg">
                  Total: {getProjectCount(filteredProjects.length)}
                </Badge>
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
          <div className="flex items-center gap-4 justify-between">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedProjects.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {selectedProjects.length} selecionado(s)
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
                      <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                      Concluir Selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('arquivar')}>
                      <Square className="mr-2 h-4 w-4 text-orange-600" />
                      Arquivar Selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('excluir')}>
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      Excluir Selecionados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
                  <SelectItem value="planejamento">Planejamento</SelectItem>
                  <SelectItem value="apresentado">Apresentado</SelectItem>
                  <SelectItem value="orcamento_entregue">Orçamento Entregue</SelectItem>
                  <SelectItem value="orcamento_aprovado">Orçamento Aprovado</SelectItem>
                  <SelectItem value="contrato_assinado">Contrato Assinado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="suporte_garantia">Suporte/Garantia</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
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
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tecnologias</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedProjects.includes(project.id)}
                        onCheckedChange={() => handleSelectProject(project.id)}
                        aria-label={`Selecionar projeto ${project.nome}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <FolderOpen className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">{project.nome}</div>
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
                      <div className="flex items-center gap-2 justify-center">
                        <Badge variant="outline" className="bg-blue-500 text-white cursor-pointer hover:bg-blue-600" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Badge>
                        <Badge variant="outline" className="bg-purple-500 text-white cursor-pointer hover:bg-purple-600" title="Ver Tarefas">
                          <CheckSquare className="h-4 w-4" />
                        </Badge>
                        <Badge variant="outline" className="bg-green-500 text-white cursor-pointer hover:bg-green-600" title="Gerar Orçamento">
                          <FileText className="h-4 w-4" />
                        </Badge>
                        <Badge variant="outline" className="bg-red-500 text-white cursor-pointer hover:bg-red-600" title="Arquivar" onClick={() => handleExcluirProjeto(project.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Badge>
                      </div>
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