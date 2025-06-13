'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/scopes/ui/card';
import { Button } from '@/components/scopes/ui/button';
import { Input } from '@/components/scopes/ui/input';
import { Label } from '@/components/scopes/ui/label';
import { Textarea } from '@/components/scopes/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/scopes/ui/select';
import { ArrowLeft, Save, Calendar, Clock, Video, Users } from 'lucide-react';

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
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Nova Reunião</h2>
                <p className="text-muted-foreground">Agende uma nova reunião com o cliente</p>
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
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              Informações da Reunião
            </CardTitle>
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
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Clock className="h-4 w-4 text-green-400" />
                </div>
                <h3 className="text-lg font-medium">Data e Horários</h3>
              </div>
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
            </div>

            {/* Tipo e Link */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Video className="h-4 w-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium">Configurações</h3>
              </div>
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
            </div>

            {/* Participantes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Users className="h-4 w-4 text-orange-400" />
                </div>
                <h3 className="text-lg font-medium">Participantes e Ata</h3>
              </div>
              <div className="space-y-4">
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
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90">
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