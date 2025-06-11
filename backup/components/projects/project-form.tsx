'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';

interface ProjectFormProps {
  onClose: () => void;
}

export function ProjectForm({ onClose }: ProjectFormProps) {
  const [formData, setFormData] = useState({
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

  // Mock data para clientes
  const clientes = [
    { id: '1', nome: 'TechCorp Solutions' },
    { id: '2', nome: 'Maria Santos' }
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do projeto:', { ...formData, tecnologias });
    // Aqui você implementaria a lógica para salvar o projeto
    onClose();
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Novo Projeto</h2>
          <p className="text-gray-600">Cadastre um novo projeto no sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
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

            {/* Tecnologias */}
            <div className="space-y-4">
              <Label>Tecnologias</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma tecnologia e pressione Enter"
                  value={novaTecnologia}
                  onChange={(e) => setNovaTecnologia(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={adicionarTecnologia}>
                  Adicionar
                </Button>
              </div>
              {tecnologias.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tecnologias.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1">
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Projeto
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}