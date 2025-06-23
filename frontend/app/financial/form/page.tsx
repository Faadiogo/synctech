'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, DollarSign, Calendar, CreditCard, FileText, Loader2 } from 'lucide-react';
import { contratosService } from '@/lib/services/contratosService';
import { financeiroService } from '@/lib/services/financeiroService';
import { useToast } from '@/hooks/use-toast';

interface FinancialFormProps {
  onClose: () => void;
  financialId?: number;
}

interface Contrato {
  id: number;
  numero_contrato: string;
  cliente_nome?: string;
}

export function FinancialForm({ onClose, financialId }: FinancialFormProps) {
  const [formData, setFormData] = useState({
    contrato_id: '',
    tipo_movimento: 'entrada',
    descricao: '',
    valor: '',
    forma_pagamento: 'pix',
    data_vencimento: '',
    data_pagamento: '',
    status: 'em_aberto',
    numero_parcela: '',
    observacoes: ''
  });

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  const formasPagamento = [
    { value: 'pix', label: 'PIX' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'transferencia', label: 'Transferência' }
  ];

  const statusOptions = [
    { value: 'em_aberto', label: 'Em Aberto' },
    { value: 'pago', label: 'Pago' },
    { value: 'atrasado', label: 'Atrasado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  useEffect(() => {
    loadInitialData();
    if (financialId) {
      loadFinancialData();
    }
  }, [financialId]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const contratosResponse = await contratosService.listar({ limit: 100 });
      setContratos(contratosResponse.data);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contratos. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadFinancialData = async () => {
    if (!financialId) return;
    
    try {
      const response = await financeiroService.buscarPorId(financialId);
      const financial = response.data;
      
      setFormData({
        contrato_id: financial.contrato_id?.toString() || '',
        tipo_movimento: financial.tipo_movimento,
        descricao: financial.descricao,
        valor: financial.valor.toString(),
        forma_pagamento: financial.forma_pagamento,
        data_vencimento: financial.data_vencimento,
        data_pagamento: financial.data_pagamento || '',
        status: financial.status,
        numero_parcela: financial.numero_parcela?.toString() || '',
        observacoes: financial.observacoes || ''
      });
    } catch (error) {
      console.error('Erro ao carregar transação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da transação.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.valor || !formData.data_vencimento) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const contratoSelecionado = contratos.find(c => c.id === parseInt(formData.contrato_id || '0'));
      
      const financialData = {
        contrato_id: formData.contrato_id ? parseInt(formData.contrato_id) : undefined,
        contrato_numero: contratoSelecionado?.numero_contrato || 'N/A',
        tipo_movimento: formData.tipo_movimento as 'entrada' | 'saida',
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        forma_pagamento: formData.forma_pagamento as 'pix' | 'cartao_credito' | 'boleto' | 'dinheiro' | 'transferencia',
        data_vencimento: formData.data_vencimento,
        data_pagamento: formData.data_pagamento || undefined,
        status: formData.status as 'em_aberto' | 'pago' | 'atrasado' | 'cancelado',
        numero_parcela: formData.numero_parcela ? parseInt(formData.numero_parcela) : undefined,
        observacoes: formData.observacoes || undefined
      };

      if (financialId) {
        await financeiroService.atualizar(financialId, financialData);
        toast({
          title: "Sucesso",
          description: "Transação atualizada com sucesso!",
        });
      } else {
        await financeiroService.criar(financialData);
        toast({
          title: "Sucesso",
          description: "Transação criada com sucesso!",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a transação. Tente novamente.",
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

  const getContratoLabel = (contrato: Contrato) => {
    return `${contrato.numero_contrato}${contrato.cliente_nome ? ` - ${contrato.cliente_nome}` : ''}`;
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
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{financialId ? 'Editar' : 'Nova'} Transação</h2>
                <p className="text-muted-foreground">{financialId ? 'Edite a' : 'Registre uma nova'} movimentação financeira</p>
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
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
              Informações da Transação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tipo e Contrato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_movimento">Tipo de Movimento *</Label>
                <Select 
                  value={formData.tipo_movimento} 
                  onValueChange={(value) => handleInputChange('tipo_movimento', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada (Receita)</SelectItem>
                    <SelectItem value="saida">Saída (Despesa)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contrato_id">Contrato</Label>
                <Select 
                  value={formData.contrato_id} 
                  onValueChange={(value) => handleInputChange('contrato_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    {contratos.map(contrato => (
                      <SelectItem key={contrato.id} value={contrato.id.toString()}>
                        {getContratoLabel(contrato)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                required
              />
            </div>

            {/* Valor e Forma de Pagamento */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CreditCard className="h-4 w-4 text-green-400" />
                </div>
                <h3 className="text-lg font-medium">Pagamento</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => handleInputChange('valor', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
                  <Select 
                    value={formData.forma_pagamento} 
                    onValueChange={(value) => handleInputChange('forma_pagamento', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formasPagamento.map(forma => (
                        <SelectItem key={forma.value} value={forma.value}>
                          {forma.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Datas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Calendar className="h-4 w-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium">Datas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => handleInputChange('data_vencimento', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_pagamento">Data de Pagamento</Label>
                  <Input
                    id="data_pagamento"
                    type="date"
                    value={formData.data_pagamento}
                    onChange={(e) => handleInputChange('data_pagamento', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Status e Parcela */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_parcela">Número da Parcela</Label>
                <Input
                  id="numero_parcela"
                  type="number"
                  min="1"
                  value={formData.numero_parcela}
                  onChange={(e) => handleInputChange('numero_parcela', e.target.value)}
                />
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
                {loading ? 'Salvando...' : 'Salvar Transação'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
