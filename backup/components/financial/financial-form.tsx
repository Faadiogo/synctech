'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

interface FinancialFormProps {
  onClose: () => void;
}

export function FinancialForm({ onClose }: FinancialFormProps) {
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

  // Mock data
  const contratos = [
    { id: '1', numero: 'CONT-2024-001', cliente: 'TechCorp Solutions' }
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados da transação:', formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nova Transação</h2>
          <p className="text-gray-600">Registre uma nova movimentação financeira</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Transação</CardTitle>
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
                      <SelectItem key={contrato.id} value={contrato.id}>
                        {contrato.numero} - {contrato.cliente}
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

            {/* Datas */}
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Transação
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}