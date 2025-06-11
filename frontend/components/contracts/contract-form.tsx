'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

interface ContractFormProps {
  onClose: () => void;
}

export function ContractForm({ onClose }: ContractFormProps) {
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

  // Mock data
  const clientes = [
    { id: '1', nome: 'TechCorp Solutions' },
    { id: '2', nome: 'Maria Santos' }
  ];

  const projetos = [
    { id: '1', nome: 'Sistema de Gestão Empresarial', cliente_id: '1' },
    { id: '2', nome: 'E-commerce Personalizado', cliente_id: '2' }
  ];

  const orcamentos = [
    { id: '1', numero: 'ORC-2024-001', valor: 80000, projeto_id: '1' },
    { id: '2', numero: 'ORC-2024-002', valor: 80000, projeto_id: '2' }
  ];

  const projetosFiltrados = projetos.filter(p => p.cliente_id === formData.cliente_id);
  const orcamentosFiltrados = orcamentos.filter(o => o.projeto_id === formData.projeto_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do contrato:', formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Calcular valor do contrato automaticamente
      if (field === 'valor_orcado' || field === 'desconto') {
        const valorOrcado = parseFloat(newData.valor_orcado) || 0;
        const desconto = parseFloat(newData.desconto) || 0;
        newData.valor_contrato = (valorOrcado - desconto).toString();
      }
      
      // Preencher valor orçado quando selecionar orçamento
      if (field === 'orcamento_id') {
        const orcamento = orcamentos.find(o => o.id === value);
        if (orcamento) {
          newData.valor_orcado = orcamento.valor.toString();
          const desconto = parseFloat(newData.desconto) || 0;
          newData.valor_contrato = (orcamento.valor - desconto).toString();
        }
      }
      
      return newData;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Novo Contrato</h2>
          <p className="text-gray-600">Crie um novo contrato baseado em um orçamento aprovado</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Contrato</CardTitle>
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
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
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
                    {projetosFiltrados.map(projeto => (
                      <SelectItem key={projeto.id} value={projeto.id}>
                        {projeto.nome}
                      </SelectItem>
                    ))}
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
                    {orcamentosFiltrados.map(orcamento => (
                      <SelectItem key={orcamento.id} value={orcamento.id}>
                        {orcamento.numero} - R$ {orcamento.valor.toLocaleString('pt-BR')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Valores */}
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
                  className="font-bold"
                />
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Contrato
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}