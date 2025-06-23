'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, FileText, DollarSign, Loader2 } from 'lucide-react';
import { clientesService, type Cliente } from '@/lib/services/clientesService';
import { projetosService } from '@/lib/services/projetosService';
import { orcamentosService } from '@/lib/services/orcamentosService';
import { contratosService } from '@/lib/services/contratosService';
import { useToast } from '@/hooks/use-toast';

interface ContractFormProps {
  onClose: () => void;
  contractId?: number;
}

interface Projeto {
  id: number;
  nome: string;
  cliente_id: number;
}

interface Orcamento {
  id: number;
  numero_orcamento: string;
  valor_final: number;
  projeto_id: number;
}

interface ContratoComClienteExtendido {
  id: number;
  numero_contrato: string;
  cliente_id: number;
  projeto_id?: number | null;
  orcamento_id?: number | null;
  valor_orcado?: number | null;
  desconto?: number;
  valor_contrato: number;
  data_assinatura?: string | null;
  qtd_parcelas: number;
  status: 'ativo' | 'concluido' | 'cancelado';
  observacoes?: string;
}

export function ContractForm({ onClose, contractId }: ContractFormProps) {
  const [formData, setFormData] = useState({
    cliente_id: '',
    projeto_id: '',
    orcamento_id: '',
    valor_orcado: '',
    desconto: '',
    valor_contrato: '',
    data_assinatura: '',
    qtd_parcelas: '1',
    observacoes: ''
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
    if (contractId) {
      loadContractData();
    }
  }, [contractId]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [clientesResponse, projetosResponse, orcamentosResponse] = await Promise.all([
        clientesService.listar({ limit: 100 }),
        projetosService.listar({ limit: 100 }),
        orcamentosService.listar({ limit: 100 })
      ]);

      setClientes(clientesResponse.data as Cliente[]);
      setProjetos(projetosResponse.data);
      setOrcamentos(orcamentosResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadContractData = async () => {
    if (!contractId) return;

    try {
      const contract = await contratosService.buscarPorId(contractId) as ContratoComClienteExtendido;

      setFormData({
        cliente_id: contract.cliente_id.toString(),
        projeto_id: contract.projeto_id?.toString() || '',
        orcamento_id: contract.orcamento_id?.toString() || '',
        valor_orcado: contract.valor_orcado?.toString() || '',
        desconto: contract.desconto?.toString() || '',
        valor_contrato: contract.valor_contrato.toString(),
        data_assinatura: contract.data_assinatura ?? '',
        qtd_parcelas: contract.qtd_parcelas.toString(),
        observacoes: contract.observacoes || ''
      });
    } catch (error) {
      console.error('Erro ao carregar contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do contrato.",
        variant: "destructive",
      });
    }
  };

  const projetosFiltrados = projetos?.filter(p => p.cliente_id.toString() === formData.cliente_id) || [];
  const orcamentosFiltrados = orcamentos?.filter(o => o.projeto_id?.toString() === formData.projeto_id) || [];

  const generateContractNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-4);
    return `CONT-${year}${month}${day}-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cliente_id || !formData.data_assinatura || !formData.valor_contrato) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (contractId) {
        const updateData = {
          cliente_id: parseInt(formData.cliente_id),
          projeto_id: formData.projeto_id ? parseInt(formData.projeto_id) : undefined,
          orcamento_id: formData.orcamento_id ? parseInt(formData.orcamento_id) : undefined,
          valor_orcado: parseFloat(formData.valor_orcado) || undefined,
          desconto: parseFloat(formData.desconto) || 0,
          valor_contrato: parseFloat(formData.valor_contrato),
          data_assinatura: formData.data_assinatura,
          qtd_parcelas: parseInt(formData.qtd_parcelas),
          status: 'ativo' as const,
          observacoes: formData.observacoes || undefined
        };

        await contratosService.atualizar(contractId, updateData);
        toast({
          title: "Sucesso",
          description: "Contrato atualizado com sucesso!",
        });
      } else {
        const contractData = {
          numero_contrato: generateContractNumber(),
          cliente_id: parseInt(formData.cliente_id),
          projeto_id: formData.projeto_id ? parseInt(formData.projeto_id) : undefined,
          orcamento_id: formData.orcamento_id ? parseInt(formData.orcamento_id) : undefined,
          valor_orcado: parseFloat(formData.valor_orcado) || undefined,
          desconto: parseFloat(formData.desconto) || 0,
          valor_contrato: parseFloat(formData.valor_contrato),
          data_assinatura: formData.data_assinatura,
          qtd_parcelas: parseInt(formData.qtd_parcelas),
          status: 'ativo' as const,
          observacoes: formData.observacoes || undefined
        };

        await contratosService.criar(contractData);
        toast({
          title: "Sucesso",
          description: "Contrato criado com sucesso!",
        });
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o contrato. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      if (field === 'valor_orcado' || field === 'desconto') {
        const valorOrcado = parseFloat(newData.valor_orcado) || 0;
        const desconto = parseFloat(newData.desconto) || 0;
        newData.valor_contrato = (valorOrcado - desconto).toString();
      }

      if (field === 'orcamento_id') {
        const orcamento = orcamentos.find(o => o.id.toString() === value);
        if (orcamento) {
          newData.valor_orcado = orcamento.valor_final.toString();
          const desconto = parseFloat(newData.desconto) || 0;
          newData.valor_contrato = (orcamento.valor_final - desconto).toString();
        }
      }

      if (field === 'cliente_id') {
        newData.projeto_id = '';
        newData.orcamento_id = '';
        newData.valor_orcado = '';
        newData.valor_contrato = '';
      }

      if (field === 'projeto_id') {
        newData.orcamento_id = '';
        newData.valor_orcado = '';
        newData.valor_contrato = '';
      }

      return newData;
    });
  };

  const getClienteName = (cliente: Cliente) => {
    return cliente.nome_empresa || cliente.nome_completo || `Cliente ${cliente.id}`;
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
                <h2 className="text-3xl font-bold">{contractId ? 'Editar' : 'Novo'} Contrato</h2>
                <p className="text-muted-foreground">{contractId ? 'Edite o' : 'Crie um novo'} contrato baseado em um orçamento aprovado</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="tech-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              Informações do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seleção de Cliente, Projeto e Orçamento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_id">Cliente *</Label>
                <Select 
                  value={formData.cliente_id} 
                  onValueChange={(value) => handleInputChange('cliente_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                                          {clientes?.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {getClienteName(cliente)}
                        </SelectItem>
                      )) || []}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projeto_id">Projeto *</Label>
                <Select 
                  value={formData.projeto_id} 
                  onValueChange={(value) => handleInputChange('projeto_id', value)}
                  disabled={!formData.cliente_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                                          {projetosFiltrados?.map(projeto => (
                        <SelectItem key={projeto.id} value={projeto.id.toString()}>
                          {projeto.nome}
                        </SelectItem>
                      )) || []}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orcamento_id">Orçamento *</Label>
                <Select 
                  value={formData.orcamento_id} 
                  onValueChange={(value) => handleInputChange('orcamento_id', value)}
                  disabled={!formData.projeto_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um orçamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {orcamentosFiltrados?.map(orcamento => (
                      <SelectItem key={orcamento.id} value={orcamento.id.toString()}>
                        {orcamento.numero_orcamento} - R$ {orcamento.valor_final.toLocaleString('pt-BR')}
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Valores */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="h-4 w-4 text-green-400" />
                </div>
                <h3 className="text-lg font-medium">Valores</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_orcado">Valor Orçado (R$)</Label>
                  <Input
                    id="valor_orcado"
                    type="number"
                    step="0.01"
                    value={formData.valor_orcado}
                    onChange={(e) => handleInputChange('valor_orcado', e.target.value)}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desconto">Desconto (R$)</Label>
                  <Input
                    id="desconto"
                    type="number"
                    step="0.01"
                    value={formData.desconto}
                    onChange={(e) => handleInputChange('desconto', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_contrato">Valor do Contrato (R$)</Label>
                  <Input
                    id="valor_contrato"
                    type="number"
                    step="0.01"
                    value={formData.valor_contrato}
                    disabled
                    className="font-bold bg-green-50 border-green-200"
                  />
                </div>
              </div>
            </div>

            {/* Data e Parcelas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_assinatura">Data de Assinatura *</Label>
                <Input
                  id="data_assinatura"
                  type="date"
                  value={formData.data_assinatura}
                  onChange={(e) => handleInputChange('data_assinatura', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qtd_parcelas">Quantidade de Parcelas *</Label>
                <Select 
                  value={formData.qtd_parcelas} 
                  onValueChange={(value) => handleInputChange('qtd_parcelas', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 10, 12].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}x - R$ {(parseFloat(formData.valor_contrato) / num || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? 'Salvando...' : 'Salvar Contrato'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
