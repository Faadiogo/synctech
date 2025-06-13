import React, { useState, useEffect } from 'react';
import { Button } from '@/components/scopes/ui/button';
import { Input } from '@/components/scopes/ui/input';
import { Badge } from '@/components/scopes/ui/badge';
import { Calendar, Plus, Search, Edit, Trash2, Eye, CheckSquare, Square, ChevronDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/scopes/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/scopes/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/scopes/ui/dropdown-menu';
import { Checkbox } from '@/components/scopes/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/scopes/ui/select';
import { cronogramaSupabaseService, Cronograma } from '@/lib/services/cronograma-supabase';
import { useToast } from '@/hooks/use-toast';

interface ScheduleListProps {
  onNewSchedule: () => void;
  refreshTrigger?: number;
}

export function ScheduleList({ onNewSchedule, refreshTrigger }: ScheduleListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'planejado' | 'em_andamento' | 'concluido' | 'atrasado'>('todos');
  const [schedules, setSchedules] = useState<Cronograma[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await cronogramaSupabaseService.listar({
        status: statusFilter === 'todos' ? undefined : statusFilter,
        busca: searchTerm || undefined,
        page: currentPage,
        limit: 10
      });
      setSchedules(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error('Erro ao carregar cronogramas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os cronogramas. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [currentPage, refreshTrigger, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadSchedules();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset selection when schedules change
  useEffect(() => {
    setSelectedSchedules([]);
    setIsAllSelected(false);
  }, [schedules]);

  const handleExcluirSchedule = async (id: number) => {
    try {
      await cronogramaSupabaseService.excluir(id);
      toast({
        title: "Sucesso",
        description: "Cronograma excluído com sucesso.",
      });
      loadSchedules();
    } catch (error) {
      console.error('Erro ao excluir cronograma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cronograma.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'planejado': 'status-pending',
      'em_andamento': 'status-info',
      'concluido': 'bg-green-100 text-green-800',
      'atrasado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-300';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'planejado': 'Planejado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'atrasado': 'Atrasado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const filteredSchedules = schedules.filter(schedule => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      schedule.fase_nome.toLowerCase().includes(searchLower) ||
      (schedule.projeto_nome && schedule.projeto_nome.toLowerCase().includes(searchLower)) ||
      (schedule.cliente_nome && schedule.cliente_nome.toLowerCase().includes(searchLower))
    );
    const matchesStatus = statusFilter === 'todos' ? true : schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getScheduleCount = (count: number) => {
    if (count === 0) return '0 fases';
    if (count === 1) return '1 fase';
    return `${count} fases`;
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedSchedules([]);
      setIsAllSelected(false);
    } else {
      setSelectedSchedules(filteredSchedules.map(s => s.id));
      setIsAllSelected(true);
    }
  };

  const handleSelectSchedule = (id: number) => {
    setSelectedSchedules(prev => {
      const newSel = prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id];
      setIsAllSelected(newSel.length === filteredSchedules.length);
      return newSel;
    });
  };

  const handleBulkAction = (action: 'concluir' | 'atrasar' | 'excluir') => {
    if (selectedSchedules.length === 0) return;
    console.log('Bulk', action, selectedSchedules);
    setSelectedSchedules([]);
    setIsAllSelected(false);
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Cronograma</h2>
                <p className="text-muted-foreground">Gerencie as fases e entregas dos cronogramas dos projetos.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="status-info w-52 text-center justify-center text-lg">
                Total: {getScheduleCount(filteredSchedules.length)}
              </Badge>
            </div>
            <Button onClick={onNewSchedule} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Nova Fase
            </Button>
          </div>
        </div>
      </div>

      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center gap-4 justify-between">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar fases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedSchedules.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {selectedSchedules.length} selecionada(s)
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      Ações em Lote
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('concluir')}>
                      <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                      Concluir Selecionadas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('atrasar')}>
                      <Square className="mr-2 h-4 w-4 text-orange-600" />
                      Marcar Atrasadas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('excluir')}>
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      Excluir Selecionadas
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="planejado">Planejado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando cronogramas...</span>
            </div>
          ) : filteredSchedules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Projeto/Cliente</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedSchedules.includes(schedule.id)}
                        onCheckedChange={() => handleSelectSchedule(schedule.id)}
                        aria-label={`Selecionar fase ${schedule.fase_nome}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <Calendar className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">{schedule.fase_nome}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                          title={schedule.cliente_nome || 'Cliente não informado'}
                        >
                          {schedule.cliente_foto ? (
                            <img 
                              src={schedule.cliente_foto} 
                              alt={schedule.cliente_nome || 'Cliente'} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-xs font-semibold text-gray-300 ${schedule.cliente_foto ? 'hidden' : ''}`}>
                            {(schedule.cliente_nome || 'CI')[0].toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{schedule.projeto_nome || 'Projeto não informado'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(schedule.data_inicio).toLocaleDateString('pt-BR')} - {new Date(schedule.data_fim).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(schedule.status)}
                      >
                        {getStatusText(schedule.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${schedule.progresso}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10 text-primary">
                          {schedule.progresso}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <Badge variant="outline" className="bg-blue-500 text-white cursor-pointer hover:bg-blue-600" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Badge>
                        <Badge variant="outline" className="bg-red-500 text-white cursor-pointer hover:bg-red-600" title="Excluir" onClick={() => handleExcluirSchedule(schedule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 mb-2 border border-blue-100">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-lg font-semibold text-gray-300">
                {searchTerm ? 'Nenhuma fase encontrada' : 'Nenhuma fase cadastrada ainda'}
              </div>
              <div className="text-muted-foreground max-w-md">
                {searchTerm ?
                  'Tente ajustar sua busca ou criar uma nova fase.' :
                  'Adicione fases ao cronograma para acompanhar o progresso e os prazos das entregas dos seus projetos.'
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 