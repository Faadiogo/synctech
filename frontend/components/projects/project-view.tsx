'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/scopes/ui/card';
import { Button } from '@/components/scopes/ui/button';
import { Badge } from '@/components/scopes/ui/badge';
import { Progress } from '@/components/scopes/ui/progress';
import { Separator } from '@/components/scopes/ui/separator';
import { ArrowLeft, Edit, FolderOpen, Calendar, Clock, DollarSign, User, Loader2, CheckSquare } from 'lucide-react';
import { projetosSupabaseService } from '@/lib/services/projetos-supabase';
import { Projeto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProjectViewProps {
  projectId: number;
  onClose: () => void;
  onEdit: () => void;
}

export function ProjectView({ projectId, onClose, onEdit }: ProjectViewProps) {
  const [project, setProject] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await projetosSupabaseService.buscarPorId(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do projeto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'nao_iniciado': 'bg-gray-100 text-black',
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
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-black';
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

  if (loading) {
    return (
      <div className="space-y-8 animate-slide-in">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando projeto...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-8 animate-slide-in">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Projeto não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{project.nome}</h2>
                  <p className="text-muted-foreground">Detalhes do projeto</p>
                </div>
              </div>
            </div>
            <Button onClick={onEdit} className="gap-2 bg-yellow-600 hover:bg-yellow-700">
              <Edit className="h-4 w-4" />
              Editar Projeto
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card className="tech-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FolderOpen className="h-5 w-5 text-blue-400" />
              </div>
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Cliente</label>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {project.cliente_foto ? (
                    <img 
                      src={project.cliente_foto} 
                      alt={project.nome_empresa || project.nome_completo || 'Cliente'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs font-semibold text-gray-300">
                      {(project.nome_empresa || project.nome_completo || 'CI')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="font-medium">{project.nome_empresa || project.nome_completo || 'Cliente não informado'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant="secondary" className={getStatusColor(project.status)}>
                {getStatusText(project.status)}
              </Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Progresso</label>
              <div className="flex items-center gap-2">
                <Progress value={project.progresso_calculado || project.progresso || 0} className="flex-1 h-3" />
                <span className="text-sm font-medium text-primary min-w-[40px]">
                  {Math.round(project.progresso_calculado || project.progresso || 0)}%
                </span>
              </div>
            </div>

            {project.descricao && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <p className="text-sm bg-muted/30 p-3 rounded-lg">{project.descricao}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Datas e Prazos */}
        <Card className="tech-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              Prazos e Cronograma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.data_inicio && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Data de Início</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(project.data_inicio).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            )}

            {project.data_alvo && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Data Alvo</label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(project.data_alvo).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            )}

            {project.horas_estimadas && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Horas Estimadas</label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{project.horas_estimadas}h</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financeiro */}
        {project.valor_estimado && (
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Valor Estimado</label>
                <div className="text-2xl font-bold text-green-600">
                  R$ {project.valor_estimado.toLocaleString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tecnologias */}
        {project.tecnologias && project.tecnologias.length > 0 && (
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <CheckSquare className="h-5 w-5 text-orange-400" />
                </div>
                Tecnologias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.tecnologias.map((tech) => (
                  <Badge key={tech} variant="outline" className="status-pending">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        {project.observacoes && (
          <Card className="tech-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <User className="h-5 w-5 text-indigo-400" />
                </div>
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">{project.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 