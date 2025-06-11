'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, FolderOpen, User, Calendar, DollarSign, Code, Loader2 } from 'lucide-react';
import { projetosService } from '@/lib/services/projetos';
import { clientesService } from '@/lib/services/clientes';
import { Projeto, Cliente } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProjectFormProps {
  onClose: () => void;
  projetoId?: number;
  onSuccess?: () => void;
  clienteId?: number;
}

export function ProjectForm({ onClose, projetoId, onSuccess, clienteId }: ProjectFormProps) {
  const [formData, setFormData] = useState<{
    nome: string;
    cliente_id: string;
    descricao: string;
    status: string;
    data_inicio: string;
    data_alvo: string;
    horas_estimadas: string;
    valor_estimado: string;
    observacoes: string;
  }>({
    nome: '',
    cliente_id: '',
    descricao: '',
    status: 'nao_iniciado',
    data_inicio: '',
    data_alvo: '',
    horas_estimadas: '',
    valor_estimado: '',
    observacoes: ''
  });

  const [tecnologias, setTecnologias] = useState<string[]>([]);
  const [novaTecnologia, setNovaTecnologia] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!projetoId);
  const [clientesLoading, setClientesLoading] = useState(true);
  const { toast } = useToast();

  // Debug: Log do estado dos clientes
  useEffect(() => {
    console.log('📊 Estado atual - Clientes:', clientes.length, 'Loading:', clientesLoading);
  }, [clientes, clientesLoading]);

  // Carregar clientes
  useEffect(() => {
    console.log('🎯 useEffect chamado para carregar clientes');
    loadClientes();
  }, []);

  // Carregar dados do projeto se for edição
  useEffect(() => {
    if (projetoId) {
      loadProjeto();
    }
  }, [projetoId]);

  // Pré-selecionar cliente se clienteId for fornecido
  useEffect(() => {
    if (clienteId && !projetoId) {
      setFormData(prev => ({
        ...prev,
        cliente_id: clienteId.toString()
      }));
    }
  }, [clienteId, projetoId]);

  const loadClientes = async () => {
    try {
      setClientesLoading(true);
      console.log('🔍 Carregando clientes...');
      
      // Teste direto com fetch para debug
      const testUrl = 'http://localhost:3001/api/clientes-supabase?ativo=true&limit=100';
      console.log('🧪 Testando URL direta:', testUrl);
      
      const directResponse = await fetch(testUrl);
      console.log('📡 Direct fetch status:', directResponse.status);
      const directData = await directResponse.json();
      console.log('📄 Direct fetch data:', directData);
      
      // Agora usando o service
      const response = await clientesService.listar({
        ativo: true,
        limit: 100
      });
      console.log('📋 Clientes carregados via service:', response.data);
      setClientes(response.data);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setClientesLoading(false);
    }
  };

  const loadProjeto = async () => {
    try {
      setInitialLoading(true);
      const response = await projetosService.buscarPorId(projetoId!);
      const projeto = response.data;
      setFormData({
        nome: projeto.nome,
        cliente_id: projeto.cliente_id.toString(),
        descricao: projeto.descricao || '',
        status: projeto.status,
        data_inicio: projeto.data_inicio || '',
        data_alvo: projeto.data_alvo || '',
        horas_estimadas: projeto.horas_estimadas?.toString() || '',
        valor_estimado: projeto.valor_estimado?.toString() || '',
        observacoes: projeto.observacoes || ''
      });
      setTecnologias(projeto.tecnologias || []);
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do projeto.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const statusOptions = [
    { value: 'nao_iniciado', label: 'Não Iniciado' },
    { value: 'planejamento', label: 'Planejamento' },
    { value: 'apresentado', label: 'Apresentado' },
    { value: 'orcamento_entregue', label: 'Orçamento Entregue' },
    { value: 'orcamento_aprovado', label: 'Orçamento Aprovado' },
    { value: 'contrato_assinado', label: 'Contrato Assinado' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'entregue', label: 'Entregue' },
    { value: 'suporte_garantia', label: 'Suporte/Garantia' },
    { value: 'concluido', label: 'Concluído' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const projetoData = {
        nome: formData.nome,
        cliente_id: parseInt(formData.cliente_id),
        descricao: formData.descricao,
        status: formData.status,
        data_inicio: formData.data_inicio || undefined,
        data_alvo: formData.data_alvo || undefined,
        horas_estimadas: formData.horas_estimadas ? parseFloat(formData.horas_estimadas) : undefined,
        valor_estimado: formData.valor_estimado ? parseFloat(formData.valor_estimado) : undefined,
        observacoes: formData.observacoes,
        tecnologias: tecnologias
      };
      
      if (projetoId) {
        await projetosService.atualizar(projetoId, projetoData);
        toast({
          title: "Sucesso",
          description: "Projeto atualizado com sucesso.",
        });
      } else {
        await projetosService.criar(projetoData);
        toast({
          title: "Sucesso",
          description: "Projeto criado com sucesso.",
        });
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o projeto. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const adicionarTecnologia = () => {
    if (novaTecnologia.trim() && !tecnologias.includes(novaTecnologia.trim())) {
      setTecnologias([...tecnologias, novaTecnologia.trim()]);
      setNovaTecnologia('');
    }
  };

  const removerTecnologia = (tech: string) => {
    setTecnologias(tecnologias.filter(t => t !== tech));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarTecnologia();
    }
  };

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
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{projetoId ? 'Editar Projeto' : 'Novo Projeto'}</h2>
                <p className="text-muted-foreground">{projetoId ? 'Atualize as informações do projeto' : 'Cadastre um novo projeto no sistema'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {initialLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando dados do projeto...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="tech-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FolderOpen className="h-5 w-5 text-blue-400" />
              </div>
              Informações do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Projeto *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cliente_id">Cliente *</Label>
                <Select 
                  value={formData.cliente_id} 
                  onValueChange={(value) => handleInputChange('cliente_id', value)}
                  disabled={clientesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      clientesLoading 
                        ? "Carregando clientes..." 
                        : clientes.length === 0 
                          ? "Nenhum cliente encontrado" 
                          : "Selecione um cliente"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {clientesLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Carregando...</span>
                      </div>
                    ) : clientes.length === 0 ? (
                      <div className="flex items-center justify-center py-2">
                        <span className="text-sm text-muted-foreground">Nenhum cliente ativo encontrado</span>
                      </div>
                    ) : (
                      clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nome_empresa || cliente.nome_completo}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                rows={3}
              />
            </div>

            {/* Status e Datas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_alvo">Data Alvo</Label>
                <Input
                  id="data_alvo"
                  type="date"
                  value={formData.data_alvo}
                  onChange={(e) => handleInputChange('data_alvo', e.target.value)}
                />
              </div>
            </div>

            {/* Estimativas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="h-4 w-4 text-green-400" />
                </div>
                <h3 className="text-lg font-medium">Estimativas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horas_estimadas">Horas Estimadas</Label>
                  <Input
                    id="horas_estimadas"
                    type="number"
                    value={formData.horas_estimadas}
                    onChange={(e) => handleInputChange('horas_estimadas', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_estimado">Valor Estimado (R$)</Label>
                  <Input
                    id="valor_estimado"
                    type="number"
                    step="0.01"
                    value={formData.valor_estimado}
                    onChange={(e) => handleInputChange('valor_estimado', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tecnologias */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Code className="h-4 w-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium">Tecnologias</h3>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma tecnologia e pressione Enter"
                  value={novaTecnologia}
                  onChange={(e) => setNovaTecnologia(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={adicionarTecnologia} variant="outline">
                  Adicionar
                </Button>
              </div>
              {tecnologias.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 border border-border/50 rounded-lg bg-muted/30">
                  {tecnologias.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1 status-info">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removerTecnologia(tech)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" disabled={loading || clientesLoading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? 'Salvando...' : (projetoId ? 'Atualizar Projeto' : 'Salvar Projeto')}
              </Button>
            </div>
          </CardContent>
                  </Card>
        </form>
      )}
    </div>
  );
}