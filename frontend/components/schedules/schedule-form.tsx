'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/scopes/ui/card';
import { Button } from '@/components/scopes/ui/button';
import { Input } from '@/components/scopes/ui/input';
import { Label } from '@/components/scopes/ui/label';
import { Textarea } from '@/components/scopes/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/scopes/ui/select';
import { ArrowLeft, Save, Calendar, Clock, Target, FileText, Loader2 } from 'lucide-react';
import { projetosSupabaseService } from '@/lib/services/projetos-supabase';
import { cronogramaSupabaseService } from '@/lib/services/cronograma-supabase';
import { useToast } from '@/hooks/use-toast';

interface ScheduleFormProps {
  onClose: () => void;
  scheduleId?: number;
}

interface Projeto {
  id: number;
  nome: string;
}

export function ScheduleForm({ onClose, scheduleId }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    projeto_id: '',
    fase_numero: '',
    nome_fase: '',
    descricao: '',
    data_inicio: '',
    data_alvo: '',
    status: 'nao_iniciada'
  });

  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'nao_iniciada', label: 'Não Iniciada' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluida', label: 'Concluída' },
    { value: 'atrasada', label: 'Atrasada' }
  ];

  useEffect(() => {
    loadInitialData();
    if (scheduleId) {
      loadScheduleData();
    }
  }, [scheduleId]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const projetosResponse = await projetosSupabaseService.listar({ limit: 100 });
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

  const loadScheduleData = async () => {
    if (!scheduleId) return;
    
    try {
      const response = await cronogramaSupabaseService.buscarPorId(scheduleId);
      const schedule = response.data;
      
      setFormData({
        projeto_id: schedule.projeto_id.toString(),
        fase_numero: schedule.ordem?.toString() || '1',
        nome_fase: schedule.fase_nome,
        descricao: schedule.descricao || '',
        data_inicio: schedule.data_inicio,
        data_alvo: schedule.data_fim,
        status: schedule.status
      });
    } catch (error) {
      console.error('Erro ao carregar cronograma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do cronograma.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projeto_id || !formData.fase_numero || !formData.nome_fase || !formData.data_inicio || !formData.data_alvo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const scheduleData = {
        projeto_id: parseInt(formData.projeto_id),
        fase_nome: formData.nome_fase,
        descricao: formData.descricao || undefined,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_alvo,
        status: formData.status as 'nao_iniciada' | 'em_andamento' | 'concluida' | 'atrasada',
        progresso: 0,
        ordem: parseInt(formData.fase_numero)
      };

      if (scheduleId) {
        await cronogramaSupabaseService.atualizar(scheduleId, scheduleData);
        toast({
          title: "Sucesso",
          description: "Cronograma atualizado com sucesso!",
        });
      } else {
        await cronogramaSupabaseService.criar(scheduleData);
        toast({
          title: "Sucesso",
          description: "Cronograma criado com sucesso!",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cronograma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cronograma. Tente novamente.",
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
                <h2 className="text-3xl font-bold">{scheduleId ? 'Editar' : 'Nova'} Fase do Cronograma</h2>
                <p className="text-muted-foreground">{scheduleId ? 'Edite a' : 'Cadastre uma nova'} fase do cronograma do projeto</p>
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
              Informações da Fase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                        {projeto.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fase_numero">Número da Fase *</Label>
                <Input
                  id="fase_numero"
                  type="number"
                  min="1"
                  value={formData.fase_numero}
                  onChange={(e) => handleInputChange('fase_numero', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Nome e Descrição */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <FileText className="h-4 w-4 text-green-400" />
                </div>
                <h3 className="text-lg font-medium">Detalhes da Fase</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_fase">Nome da Fase *</Label>
                  <Input
                    id="nome_fase"
                    value={formData.nome_fase}
                    onChange={(e) => handleInputChange('nome_fase', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Datas e Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Clock className="h-4 w-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium">Prazos e Status</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data de Início *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_alvo">Data Alvo *</Label>
                  <Input
                    id="data_alvo"
                    type="date"
                    value={formData.data_alvo}
                    onChange={(e) => handleInputChange('data_alvo', e.target.value)}
                    required
                  />
                </div>
              </div>
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
            </div>
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
                {loading ? 'Salvando...' : 'Salvar Fase'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 