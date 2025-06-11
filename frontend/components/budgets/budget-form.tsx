'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Trash2, FileText } from 'lucide-react';

interface BudgetFormProps {
  onClose: () => void;
}

interface BudgetItem {
  id: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

export function BudgetForm({ onClose }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    cliente_id: '',
    projeto_id: '',
    data_validade: '',
    desconto: '',
    observacoes: ''
  });

  const [itens, setItens] = useState<BudgetItem[]>([
    {
      id: '1',
      descricao: '',
      quantidade: 1,
      valor_unitario: 0,
      valor_total: 0
    }
  ]);

  // Mock data
  const clientes = [
    { id: '1', nome: 'TechCorp Solutions' },
    { id: '2', nome: 'Maria Santos' }
  ];

  const projetos = [
    { id: '1', nome: 'Sistema de Gestão Empresarial', cliente_id: '1' },
    { id: '2', nome: 'E-commerce Personalizado', cliente_id: '2' }
  ];

  const projetosFiltrados = projetos.filter(p => p.cliente_id === formData.cliente_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do orçamento:', { ...formData, itens });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const adicionarItem = () => {
    const novoItem: BudgetItem = {
      id: Date.now().toString(),
      descricao: '',
      quantidade: 1,
      valor_unitario: 0,
      valor_total: 0
    };
    setItens([...itens, novoItem]);
  };

  const removerItem = (id: string) => {
    if (itens.length > 1) {
      setItens(itens.filter(item => item.id !== id));
    }
  };

  const atualizarItem = (id: string, campo: keyof BudgetItem, valor: any) => {
    setItens(itens.map(item => {
      if (item.id === id) {
        const itemAtualizado = { ...item, [campo]: valor };
        if (campo === 'quantidade' || campo === 'valor_unitario') {
          itemAtualizado.valor_total = itemAtualizado.quantidade * itemAtualizado.valor_unitario;
        }
        return itemAtualizado;
      }
      return item;
    }));
  };

  const valorSubtotal = itens.reduce((acc, item) => acc + item.valor_total, 0);
  const valorDesconto = parseFloat(formData.desconto) || 0;
  const valorTotal = valorSubtotal - valorDesconto;

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
                <h2 className="text-3xl font-bold">Novo Orçamento</h2>
                <p className="text-muted-foreground">Crie um novo orçamento para o cliente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Informações Básicas */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="projeto_id">Projeto</Label>
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
            </CardContent>
          </Card>

          {/* Itens do Orçamento */}
          <Card className="tech-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Plus className="h-5 w-5 text-green-400" />
                </div>
                Itens do Orçamento
              </CardTitle>
              <Button type="button" onClick={adicionarItem} size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {itens.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 border border-border/50 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="col-span-5">
                    <Label>Descrição</Label>
                    <Input
                      value={item.descricao}
                      onChange={(e) => atualizarItem(item.id, 'descricao', e.target.value)}
                      placeholder="Descrição do item"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Valor Unitário</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.valor_unitario}
                      onChange={(e) => atualizarItem(item.id, 'valor_unitario', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <Input
                      value={`R$ ${item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerItem(item.id)}
                      disabled={itens.length === 1}
                      className="hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Totais */}
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <FileText className="h-5 w-5 text-purple-400" />
                </div>
                Totais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Subtotal</Label>
                  <Input
                    value={`R$ ${valorSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
                  <Label>Total Final</Label>
                  <Input
                    value={`R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    disabled
                    className="font-bold text-lg bg-green-50 border-green-200"
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
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4" />
              Salvar Orçamento
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}