'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Calendar, Clock, Video, Users, Loader2 } from 'lucide-react';
import { projetosService } from '@/lib/services/projetosService';
import { reunioesService } from '@/lib/services/reunioesService';
import { useToast } from '@/hooks/use-toast';

interface MeetingFormProps {
  onClose: () => void;
  meetingId?: number;
}

interface Projeto {
  id: number;
  nome: string;
  cliente_nome?: string;
}

export function MeetingForm({ onClose, meetingId }: MeetingFormProps) {
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

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  const tiposReuniao = [
    { value: 'online', label: 'Online' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'telefone', label: 'Telefone' }
  ];

  useEffect(() => {
    loadInitialData();
    if (meetingId) {
      loadMeetingData();
    }
  }, [meetingId]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const projetosResponse = await projetosService.listar({ limit: 100 });
      setProjetos(projetosResponse.data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadMeetingData = async () => {
    if (!meetingId) return;
    
    try {
      const response = await reunioesService.buscarPorId(meetingId);
      const meeting = response.data;
      
      setFormData({
        projeto_id: meeting.projeto_id.toString(),
        titulo: meeting.titulo,
        descricao: meeting.agenda || '',
        data_reuniao: meeting.data_reuniao,
        horario_inicio: meeting.horario_inicio,
        horario_fim: meeting.horario_fim,
        tipo: meeting.tipo,
        link_reuniao: meeting.link_reuniao || '',
        participantes: meeting.local || '',
        ata_reuniao: meeting.observacoes || ''
      });
    } catch (error) {
      console.error('Erro ao carregar reunião:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da reunião.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projeto_id || !formData.titulo || !formData.data_reuniao || !formData.horario_inicio || !formData.horario_fim) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const meetingData = {
        projeto_id: parseInt(formData.projeto_id),
        titulo: formData.titulo,
        agenda: formData.descricao || undefined,
        data_reuniao: formData.data_reuniao,
        horario_inicio: formData.horario_inicio,
        horario_fim: formData.horario_fim,
        tipo: formData.tipo,
        status: 'agendada',
        link_reuniao: formData.link_reuniao || undefined,
        local: formData.participantes || undefined,
        observacoes: formData.ata_reuniao || undefined
      };

      if (meetingId) {
        await reunioesService.atualizar(meetingId, meetingData);
        toast({
          title: "Sucesso",
          description: "Reunião atualizada com sucesso!",
        });
      } else {
        await reunioesService.criar(meetingData);
        toast({
          title: "Sucesso",
          description: "Reunião criada com sucesso!",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar reunião:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a reunião. Tente novamente.",
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

  const getProjetoLabel = (projeto: Projeto) => {
    return `${projeto.nome}${projeto.cliente_nome ? ` - ${projeto.cliente_nome}` : ''}`;
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
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{meetingId ? 'Editar' : 'Nova'} Reunião</h2>
                <p className="text-muted-foreground">{meetingId ? 'Edite a' : 'Agende uma nova'} reunião com o cliente</p>
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
                      <SelectItem key={projeto.id} value={projeto.id.toString()}>
                        {getProjetoLabel(projeto)}
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
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? 'Salvando...' : 'Salvar Reunião'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
