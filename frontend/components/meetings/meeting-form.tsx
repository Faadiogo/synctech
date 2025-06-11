'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

interface MeetingFormProps {
  onClose: () => void;
}

export function MeetingForm({ onClose }: MeetingFormProps) {
  const [formData, setFormData] = useState({
    projeto_id: '',
    titulo: '',
    descricao: '',
    data_reuniao: '',
    horario_inicio: '',
    horario_fim: '',
    tipo: 'online',
    link_reuniao: '',
    participantes: '',
    ata_reuniao: ''
  });

  // Mock data
  const projetos = [
    { id: '1', nome: 'Sistema de Gestão Empresarial', cliente: 'TechCorp Solutions' },
    { id: '2', nome: 'E-commerce Personalizado', cliente: 'Maria Santos' }
  ];

  const tiposReuniao = [
    { value: 'online', label: 'Online' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'telefone', label: 'Telefone' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados da reunião:', formData);
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
          <h2 className="text-2xl font-bold text-gray-900">Nova Reunião</h2>
          <p className="text-gray-600">Agende uma nova reunião com o cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Reunião</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Projeto e Título */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projeto_id">Projeto *</Label>
                <Select 
                  value={formData.projeto_id} 
                  onValueChange={(value) => handleInputChange('projeto_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projetos.map(projeto => (
                      <SelectItem key={projeto.id} value={projeto.id}>
                        {projeto.nome} - {projeto.cliente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Reunião *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  required
                />
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

            {/* Data e Horários */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_reuniao">Data da Reunião *</Label>
                <Input
                  id="data_reuniao"
                  type="date"
                  value={formData.data_reuniao}
                  onChange={(e) => handleInputChange('data_reuniao', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario_inicio">Horário de Início *</Label>
                <Input
                  id="horario_inicio"
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => handleInputChange('horario_inicio', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario_fim">Horário de Fim *</Label>
                <Input
                  id="horario_fim"
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => handleInputChange('horario_fim', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Tipo e Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Reunião *</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value) => handleInputChange('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposReuniao.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.tipo === 'online' && (
                <div className="space-y-2">
                  <Label htmlFor="link_reuniao">Link da Reunião</Label>
                  <Input
                    id="link_reuniao"
                    type="url"
                    value={formData.link_reuniao}
                    onChange={(e) => handleInputChange('link_reuniao', e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}
            </div>

            {/* Participantes */}
            <div className="space-y-2">
              <Label htmlFor="participantes">Participantes</Label>
              <Textarea
                id="participantes"
                value={formData.participantes}
                onChange={(e) => handleInputChange('participantes', e.target.value)}
                placeholder="Liste os participantes da reunião..."
                rows={2}
              />
            </div>

            {/* Ata da Reunião */}
            <div className="space-y-2">
              <Label htmlFor="ata_reuniao">Ata da Reunião</Label>
              <Textarea
                id="ata_reuniao"
                value={formData.ata_reuniao}
                onChange={(e) => handleInputChange('ata_reuniao', e.target.value)}
                placeholder="Pontos discutidos, decisões tomadas, próximos passos..."
                rows={4}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Reunião
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}