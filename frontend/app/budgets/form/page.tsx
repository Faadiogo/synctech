'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowLeft, Save, FileText, Loader2, FolderPlus, FolderTree } from 'lucide-react';
import { projetosService } from '@/lib/services/projetosService';
import { orcamentosService } from '@/lib/services/orcamentosService';
import { ProjectForm } from '@/app/projects/form/page';
import { useToast } from '@/hooks/use-toast';

interface BudgetFormProps {
  onClose: () => void;
  budgetId?: number;
  projectData?: {
    projectId: number;
    clienteId: number;
    valorEstimado?: number;
  } | null;
}

interface Projeto {
  id: number;
  nome: string;
  cliente_id: number;
  cliente_nome?: string;
  nome_empresa?: string;
  nome_completo?: string;
  valor_estimado?: number;
}

export function BudgetForm({ onClose, budgetId, projectData }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    projeto_id: '',
    escopo_funcional_id: '',
    valor_orcamento: '',
    data_validade: '',
    observacoes: ''
  });

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const { toast } = useToast();

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
    if (budgetId) {
      loadBudgetData();
    }
  }, [budgetId]);

  // Pré-preencher dados quando projectData estiver disponível
  useEffect(() => {
    if (projectData && !budgetId) {
      setFormData(prev => ({
        ...prev,
        projeto_id: projectData.projectId.toString(),
        valor_orcamento: projectData.valorEstimado?.toString() || ''
      }));
    }
  }, [projectData, budgetId]);


  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const projetosResponse = await projetosService.listar({ limit: 100 });
      setProjetos(projetosResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadBudgetData = async () => {
    if (!budgetId) return;
    
    try {
      const response = await orcamentosService.buscarPorId(budgetId);
      const budget = response.data;
      
      setFormData({
        projeto_id: budget.projeto_id?.toString() || '',
        escopo_funcional_id: budget.escopo_funcional_id?.toString() || '',
        valor_orcamento: budget.valor_final?.toString() || '',
        data_validade: budget.data_validade,
        observacoes: budget.observacoes || ''
      });

      
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do orçamento.",
        variant: "destructive",
      });
    }
  };

  const generateBudgetNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-4);
    return `ORC-${year}${month}${day}-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projeto_id || !formData.valor_orcamento || !formData.data_validade) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const valorOrcamento = parseFloat(formData.valor_orcamento);
    if (isNaN(valorOrcamento) || valorOrcamento <= 0) {
      toast({
        title: "Erro",
        description: "Valor do orçamento deve ser um número positivo.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Buscar dados do projeto selecionado para obter o cliente_id
      const projetoSelecionado = projetos.find(p => p.id.toString() === formData.projeto_id);
      if (!projetoSelecionado) {
        throw new Error('Projeto não encontrado');
      }
      
      if (budgetId) {
        const updateData = {
          cliente_id: projetoSelecionado.cliente_id,
          projeto_id: parseInt(formData.projeto_id),
          escopo_funcional_id: formData.escopo_funcional_id ? parseInt(formData.escopo_funcional_id) : undefined,
          data_validade: formData.data_validade,
          valor_total: valorOrcamento,
          valor_final: valorOrcamento,
          status: 'rascunho' as const,
          observacoes: formData.observacoes || undefined
        };
        
        await orcamentosService.atualizar(budgetId, updateData);
        toast({
          title: "Sucesso",
          description: "Orçamento atualizado com sucesso!",
        });
      } else {
        const budgetData = {
          numero_orcamento: generateBudgetNumber(),
          cliente_id: projetoSelecionado.cliente_id,
          projeto_id: parseInt(formData.projeto_id),
          escopo_funcional_id: formData.escopo_funcional_id ? parseInt(formData.escopo_funcional_id) : undefined,
          data_validade: formData.data_validade,
          valor_total: valorOrcamento,
          valor_final: valorOrcamento,
          status: 'rascunho' as const,
          observacoes: formData.observacoes || undefined
        };
        
        await orcamentosService.criar(budgetData);
        toast({
          title: "Sucesso",
          description: "Orçamento criado com sucesso!",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o orçamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      return newData;
    });
  };

  const getProjectDisplayName = (projeto: Projeto) => {
    const clienteName = projeto.nome_empresa || projeto.nome_completo || projeto.cliente_nome || 'Cliente';
    return `${projeto.nome} (${clienteName})`;
  };

  const handleProjectFormSuccess = () => {
    setShowProjectForm(false);
    loadInitialData(); // Recarregar lista de projetos
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{budgetId ? 'Editar' : 'Novo'} Orçamento</h2>
                <p className="text-muted-foreground">{budgetId ? 'Edite o' : 'Crie um novo'} orçamento para o projeto</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Informações do Orçamento */}
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                Informações do Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projeto_id">Projeto *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.projeto_id} 
                    onValueChange={(value) => handleInputChange('projeto_id', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projetos?.map(projeto => (
                        <SelectItem key={projeto.id} value={projeto.id.toString()}>
                          {getProjectDisplayName(projeto)}
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowProjectForm(true)}
                    className="gap-2"
                  >
                    <FolderPlus className="h-4 w-4" />
                    Novo Projeto
                  </Button>
                </div>
                {projetos?.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum projeto encontrado. Crie um projeto primeiro para gerar o orçamento.
                  </p>
                )}
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_orcamento">Valor do Orçamento *</Label>
                  <Input
                    id="valor_orcamento"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_orcamento}
                    onChange={(e) => handleInputChange('valor_orcamento', e.target.value)}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_validade">Data de Validade *</Label>
                  <Input
                    id="data_validade"
                    type="date"
                    value={formData.data_validade}
                    onChange={(e) => handleInputChange('data_validade', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  rows={3}
                  placeholder="Observações adicionais sobre o orçamento..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumo do Valor */}
          {formData.valor_orcamento && (
            <Card className="tech-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <FileText className="h-5 w-5 text-green-400" />
                  </div>
                  Resumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Valor Total do Orçamento</div>
                  <div className="text-3xl font-bold text-green-600">
                    R$ {parseFloat(formData.valor_orcamento || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? 'Salvando...' : 'Salvar Orçamento'}
            </Button>
          </div>
        </div>
      </form>

      {/* Modal para formulário de projeto */}
      <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <ProjectForm
            onClose={() => setShowProjectForm(false)}
            onSuccess={handleProjectFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
