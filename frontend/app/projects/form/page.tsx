'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, FolderOpen, User, Calendar, DollarSign, Code, Loader2 } from 'lucide-react';
import { projetosService } from '@/lib/services/projetosService';
import { clientesService } from '@/lib/services/clientesService';
import type { Projeto } from '@/lib/services/projetosService';
import type { Cliente } from '@/lib/services/clientesService';
import { useToast } from '@/hooks/use-toast';
import { EscopoForm } from '@/app/escopos/page';
import { startOfToday } from 'date-fns';

interface ProjectFormProps {
  onClose: () => void;
  projetoId?: number;
  onSuccess?: () => void;
  clienteId?: number;
}

type FormDataType = {
  nome: string;
  cliente_id: string;
  descricao: string;
  status: string;
  data_inicio: string;
  data_alvo: string;
  horas_estimadas: string;
  valor_estimado: string;
  valor_hora: string;
  horas_por_dia: string;
};

type FormDataField = keyof FormDataType;

export function ProjectForm({ onClose, projetoId, onSuccess, clienteId }: ProjectFormProps) {
  const [formData, setFormData] = useState<FormDataType>({
    nome: '',
    cliente_id: '',
    descricao: '',
    status: 'nao_iniciado',
    data_inicio: '',
    data_alvo: '',
    horas_estimadas: '0',
    valor_estimado: '0,00',
    valor_hora: '75,00',
    horas_por_dia: '08:00',
  });

  const [tecnologias, setTecnologias] = useState<string[]>([]);
  const [novaTecnologia, setNovaTecnologia] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!projetoId);
  const [clientesLoading, setClientesLoading] = useState(true);
  const [escopos, setEscopos] = useState<any[]>([]);
  const { toast } = useToast();

  // Estado inicial para reuso
  const emptyForm: FormDataType = {
    nome: '',
    cliente_id: '',
    descricao: '',
    status: 'nao_iniciado',
    data_inicio: '',
    data_alvo: '',
    horas_estimadas: '0',
    valor_estimado: '0,00',
    valor_hora: '75,00',
    horas_por_dia: '08:00',
  };

  // Quando mudar de edição para novo projeto, limpar estados
  useEffect(() => {
    if (!projetoId) {
      setFormData(emptyForm);
      setTecnologias([]);
      setEscopos([]);
      setInitialLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetoId]);

  // Debug: Log do estado dos clientes
  useEffect(() => {
    console.log('📊 Estado atual - Clientes:', clientes.length, 'Loading:', clientesLoading);
  }, [clientes, clientesLoading]);

  // Carregar clientes
  useEffect(() => {
    console.log('🎯 useEffect chamado para carregar clientes');
    loadClientes();
  }, []);

  // Carregar dados do projeto se for edição
  useEffect(() => {
    if (projetoId) {
      loadProjeto();
    }
  }, [projetoId]);

  // Pré-selecionar cliente quando a lista de clientes estiver carregada
  useEffect(() => {
    if (clienteId && !projetoId && !clientesLoading) {
      setFormData(prev => ({
        ...prev,
        cliente_id: clienteId.toString()
      }));
    }
  }, [clienteId, projetoId, clientesLoading]);

  const loadClientes = async () => {
    try {
      setClientesLoading(true);
      console.log('🔍 Carregando clientes...');

      // Teste direto com fetch para debug
      const testUrl = 'http://localhost:3001/api/clientes-supabase?ativo=true&limit=100';
      console.log('🧪 Testando URL direta:', testUrl);

      const directResponse = await fetch(testUrl);
      console.log('📡 Direct fetch status:', directResponse.status);
      const directData = await directResponse.json();
      console.log('📄 Direct fetch data:', directData);

      // Agora usando o service
      const response = await clientesService.listar({
        ativo: true,
        limit: 100
      });
      console.log('📋 Clientes carregados via service:', response.data);
      setClientes(response.data);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setClientesLoading(false);
    }
  };

  const loadProjeto = async () => {
    try {
      setInitialLoading(true);
      const projeto = await projetosService.buscarPorId(projetoId!);
      setFormData({
        nome: projeto.nome,
        cliente_id: projeto.cliente_id.toString(),
        descricao: projeto.descricao || '',
        status: projeto.status,
        data_inicio: projeto.data_inicio || '',
        data_alvo: projeto.data_alvo || '',
        horas_estimadas: projeto.horas_estimadas?.toString() || '',
        valor_estimado: projeto.valor_estimado?.toString() || '',
        valor_hora: projeto.valor_hora?.toString() || '75.00',
        horas_por_dia: projeto.horas_por_dia?.toString() || '11.00',
      });
      setTecnologias(projeto.tecnologias || []);
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do projeto.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };
  

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

  // Função para calcular dias úteis (excluindo sábados e domingos)
  const calcularDiasUteis = (dataInicio: string, dataAlvo: string): number => {
    if (!dataInicio || !dataAlvo) return 0;

    const inicio = new Date(dataInicio);
    const alvo = new Date(dataAlvo);

    // Se data alvo for anterior à data início, retorna 0
    if (alvo < inicio) return 0;

    let diasUteis = 0;
    const dataAtual = new Date(inicio);

    // Loop incluindo o dia inicial e final
    while (dataAtual <= alvo) {
      const diaSemana = dataAtual.getDay();
      if (diaSemana !== 5 && diaSemana !== 6) {
        diasUteis++;
      }
      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    return diasUteis;
  };

  // Função para calcular horas estimadas e valor estimado
  const calcularEstimativas = (dataInicio: string, dataAlvo: string, valorHora: string, horasPorDia: string) => {
    const diasUteis = calcularDiasUteis(dataInicio, dataAlvo);
    const horasEstimadas = diasUteis * parseFloat(horasPorDia || '8');
    const valorEstimado = horasEstimadas * parseFloat(valorHora || '0');

    return {
      horasEstimadas: horasEstimadas.toString(),
      valorEstimado: valorEstimado.toFixed(2)
    };
  };

  // Função para calcular valor/hora baseado no valor total
  const calcularValorHora = (valorTotal: string, horasEstimadas: string): string => {
    const valor = parseFloat(valorTotal || '0');
    const horas = parseFloat(horasEstimadas || '0');

    if (horas === 0) return '0.00';

    return (valor / horas).toFixed(2);
  };

  const formatTime = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '00:00';

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const parseTime = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    return (hours * 60) + minutes;
  };

  const incrementTime = (value: string, step: number) => {
    const totalMinutes = parseTime(value) + step;

    // Aplicar limites (mínimo 30 min, máximo 13h)
    const limitedMinutes = Math.max(30, Math.min(780, totalMinutes));

    return formatTimeFromMinutes(limitedMinutes);
  };

  const formatTimeFromMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const projetoData = {
        nome: formData.nome,
        cliente_id: parseInt(formData.cliente_id),
        descricao: formData.descricao,
        status: formData.status,
        data_inicio: formData.data_inicio || undefined,
        data_alvo: formData.data_alvo || undefined,
        horas_estimadas: formData.horas_estimadas ? parseFloat(formData.horas_estimadas) : undefined,
        valor_estimado: formData.valor_estimado ? parseFloat(formData.valor_estimado) : undefined,
        valor_hora: formData.valor_hora ? parseFloat(formData.valor_hora) : undefined,
        horas_por_dia: formData.horas_por_dia ? parseFloat(formData.horas_por_dia) : undefined,
        tecnologias: tecnologias
      };

      if (projetoId) {
        await projetosService.atualizar(projetoId, projetoData);
        toast({
          title: "Sucesso",
          description: "Projeto atualizado com sucesso.",
        });
      } else {
        // Cria o projeto e armazena resposta para obter o ID gerado
        const response = await projetosService.criar(projetoData);

        toast({
          title: "Sucesso",
          description: "Projeto criado com sucesso.",
        });

        // Salvar escopos se houver algum
        if (response?.id && escopos.length > 0) {
          try {
            for (const escopo of escopos) {
              const escopoData = {
                projeto_id: response.id,
                nome: escopo.nome,
                descricao: escopo.descricao,
                status: escopo.status,
                data_inicio: escopo.data_inicio || null,
                data_alvo: escopo.data_alvo || null,
                ordem: escopo.ordem
              };

              const escopoResponse = await fetch('http://localhost:3001/api/escopos', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(escopoData),
              });

              if (!escopoResponse.ok) {
                throw new Error(`Erro ao salvar escopo: ${escopo.nome}`);
              }
            }

            toast({
              title: "Sucesso",
              description: `Projeto criado e ${escopos.length} escopo(s) salvos com sucesso.`,
            });
          } catch (escopoError) {
            console.error('Erro ao salvar escopos:', escopoError);
            toast({
              title: "Aviso",
              description: "Projeto criado, mas houve erro ao salvar alguns escopos.",
              variant: "destructive",
            });
          }
        }

        // Não redireciona mais automaticamente se há escopos para mostrar
        if (escopos.length === 0 && response?.id) {
          window.location.href = `/projetos/${response.id}/escopo`;
        }
      }

      // Caso algum callback de sucesso ainda seja necessário
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o projeto. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: FormDataField, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Aplicar formatação específica para campos de tempo
      if (field === 'horas_por_dia') {
        const formattedTime = formatTime(value);
        newData[field] = formattedTime;

        // Aplicar limites
        const totalMinutes = parseTime(formattedTime);
        if (totalMinutes < 30) {
          newData[field] = '00:30';
        } else if (totalMinutes > 780) { // 13 * 60
          newData[field] = '13:00';
        }
      }

      // Recalcular quando mudar datas, valor/hora ou horas/dia
      if (field === 'data_inicio' || field === 'data_alvo' || field === 'valor_hora' || field === 'horas_por_dia') {
        const valorHoraLimpo = field === 'valor_hora' ? value.replace(/\./g, '').replace(',', '.') : newData.valor_hora.replace(/\./g, '').replace(',', '.');
        const horasPorDiaDecimal = field === 'horas_por_dia' ? (parseTime(newData[field]) / 60).toString() : (parseTime(newData.horas_por_dia) / 60).toString();

        const { horasEstimadas, valorEstimado } = calcularEstimativas(
          field === 'data_inicio' ? value : newData.data_inicio,
          field === 'data_alvo' ? value : newData.data_alvo,
          valorHoraLimpo,
          horasPorDiaDecimal
        );

        newData.horas_estimadas = horasEstimadas;
        newData.valor_estimado = formatCurrency(valorEstimado);
      }

      // Cálculo inverso: quando alterar valor total, recalcular valor/hora
      if (field === 'valor_estimado') {
        const novoValorHora = calcularValorHora(value.replace(/\./g, '').replace(',', '.'), newData.horas_estimadas);
        newData.valor_hora = formatCurrency(novoValorHora);
      }

      // Recalcular valor total quando alterar horas estimadas manualmente
      if (field === 'horas_estimadas') {
        const valorTotal = parseFloat(newData.valor_hora.replace(/\./g, '').replace(',', '.') || '0') * parseFloat(value || '0');
        newData.valor_estimado = formatCurrency(valorTotal.toFixed(2));
      }

      return newData;
    });
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

  const formatCurrency = (value: string) => {
    // Remove tudo que não for número
    const numericValue = value.replace(/\D/g, '');

    // Se não houver valor numérico, retorna '0,00'
    if (!numericValue) return '0,00';

    // Formata o número com ponto na casa dos milhares e vírgula para decimais
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(numericValue) / 100);

    return formattedValue;
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
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{projetoId ? 'Editar Projeto' : 'Novo Projeto'}</h2>
                <p className="text-muted-foreground">{projetoId ? 'Atualize as informações do projeto' : 'Cadastre um novo projeto no sistema'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {initialLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando dados do projeto...</span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              (e.target as HTMLElement).tagName === 'INPUT' &&
              !(e.target as HTMLElement).dataset.allowEnter
            ) {
              e.preventDefault();
            }
          }}
        >
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <FolderOpen className="h-5 w-5 text-blue-400" />
                </div>
                Informações do Projeto
              </CardTitle>
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
                    disabled={clientesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        clientesLoading
                          ? "Carregando clientes..."
                          : clientes.length === 0
                            ? "Nenhum cliente encontrado"
                            : "Selecione um cliente"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {clientesLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">Carregando...</span>
                        </div>
                      ) : clientes.length === 0 ? (
                        <div className="flex items-center justify-center py-2">
                          <span className="text-sm text-muted-foreground">Nenhum cliente ativo encontrado</span>
                        </div>
                      ) : (
                        clientes.map(cliente => (
                          <SelectItem key={cliente.id} value={cliente.id.toString()}>
                            {cliente.nome_empresa || cliente.nome_completo}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                />
              </div>
              {/* Status e Datas
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
              </div> */}
              {/* Estimativas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <DollarSign className="h-4 w-4 text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium">Estimativas e Valores</h3>
                </div>

                {/* Configurações de Cálculo */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio" className='flex justify-center'>Data de Início *</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      max={formData.data_alvo}
                      value={formData.data_inicio}
                      onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_alvo" className='flex justify-center'>Data Alvo *</Label>
                    <Input
                      id="data_alvo"
                      type="date"
                      min={formData.data_inicio}
                      value={formData.data_alvo}
                      onChange={(e) => handleInputChange('data_alvo', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horas_por_dia" className='flex justify-center'>Horas por Dia *</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="px-3 py-2 text-lg font-bold"
                        onClick={() => handleInputChange('horas_por_dia', incrementTime(formData.horas_por_dia, -30))}
                      >
                        -
                      </Button>
                      <Input
                        id="horas_por_dia"
                        type="text"
                        value={formData.horas_por_dia}
                        onChange={(e) => handleInputChange('horas_por_dia', e.target.value)}
                        placeholder="08:00"
                        className="text-center"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="px-3 py-2 text-lg font-bold"
                        onClick={() => handleInputChange('horas_por_dia', incrementTime(formData.horas_por_dia, 30))}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horas_estimadas" className='flex justify-center'>Horas Estimadas *</Label>
                    <Input
                      id="horas_estimadas"
                      type="text"
                      value={formData.horas_estimadas}
                      title="Calculado automaticamente"
                      className="text-center bg-muted/50"
                      required
                      readOnly={true}
                    />
                  </div>
                  {/* Valores Financeiros */}
                  <div className="space-y-2">
                    <Label htmlFor="valor_hora" className='flex justify-center'>
                      <span> Valor por Hora *</span>
                    </Label>
                    <div className="input-container">
                      <span>R$</span>
                      <Input
                        id="valor_hora"
                        type="text"
                        value={formData.valor_hora}
                        onChange={(e) => handleInputChange('valor_hora', formatCurrency(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor_estimado" className='flex justify-center'>
                      <span>Valor Total *</span>
                    </Label>
                    <div className="input-container">
                      <span>R$</span>
                      <Input
                        id="valor_estimado"
                        type="text"
                        value={formData.valor_estimado}
                        onChange={(e) => handleInputChange('valor_estimado', formatCurrency(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Resumo do Cálculo */}
                {formData.data_inicio && formData.data_alvo && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                      📊 Resumo do Cálculo
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-800 dark:text-blue-200">

                      {/* Coluna 1 */}
                      <div>
                        <strong>Período:</strong> {calcularDiasUteis(formData.data_inicio, formData.data_alvo)} dias úteis
                      </div>

                      {/* Coluna 2 */}
                      <div>
                        <strong>Dias trabalhados (10h):</strong> {(() => {
                          const diasUteis = calcularDiasUteis(formData.data_inicio, formData.data_alvo);
                          const horasPorDia = parseFloat(formData.horas_por_dia || '0');
                          const cargaHorariaPadrao = 10;
                          const diasProporcionais = diasUteis * (horasPorDia / cargaHorariaPadrao);
                          return diasProporcionais.toFixed(1);
                        })()}
                      </div>

                      {/* Coluna 3 */}
                      <div>
                        <strong>Valor/dia (10h):</strong> R$ {(() => {
                          const diasUteis = calcularDiasUteis(formData.data_inicio, formData.data_alvo);
                          const horasPorDia = parseFloat(formData.horas_por_dia || '0');
                          const valorTotal = parseFloat(formData.valor_estimado.replace(/\./g, '').replace(',', '.') || '0');
                          const cargaHorariaPadrao = 10;
                          const diasProporcionais = diasUteis * (horasPorDia / cargaHorariaPadrao);

                          return diasProporcionais > 0
                            ? (valorTotal / diasProporcionais).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })
                            : '0,00';
                        })()}
                      </div>
                      <div>
                        <strong>Valor/mês (23 dias):</strong> R$ {(() => {
                          const diasUteis = calcularDiasUteis(formData.data_inicio, formData.data_alvo);
                          const horasPorDia = parseFloat(formData.horas_por_dia || '0');
                          const valorTotal = parseFloat(formData.valor_estimado.replace(/\./g, '').replace(',', '.') || '0');
                          const cargaHorariaPadrao = 10;
                          const diasProporcionais = diasUteis * (horasPorDia / cargaHorariaPadrao);
                          const totalDias = 23;

                          return diasProporcionais > 0
                            ? (valorTotal / diasProporcionais * totalDias).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })
                            : '0,00';
                        })()}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Tecnologias */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Code className="h-4 w-4 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium">Tecnologias</h3>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma tecnologia e pressione Enter"
                    value={novaTecnologia}
                    onChange={(e) => setNovaTecnologia(e.target.value)}
                    onKeyPress={handleKeyPress}
                    data-allow-enter="true"
                  />
                  <Button type="button" onClick={adicionarTecnologia} variant="outline">
                    Adicionar
                  </Button>
                </div>
                {tecnologias.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 border border-border/50 rounded-lg bg-muted/30">
                    {tecnologias.map((tech) => (
                      <Badge key={tech} variant="secondary" className="gap-1 status-info">
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
                <div>
                  {/* Componente de Escopo */}
                  <EscopoForm
                    projetoId={projetoId}
                    onEscoposChange={setEscopos}
                    disabled={loading}
                  />
                </div>
              </div>
              {/* Botões */}
              <div className="flex justify-center items-center pt-4">
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" disabled={loading || clientesLoading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {loading ? 'Salvando...' : (projetoId ? 'Atualizar Projeto' : 'Salvar Projeto')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
