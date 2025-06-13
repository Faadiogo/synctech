'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/scopes/ui/card';
import { Button } from '@/components/scopes/ui/button';
import { Input } from '@/components/scopes/ui/input';
import { Badge } from '@/components/scopes/ui/badge';
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
import { 
  Search, 
  Plus, 
  Calendar,
  Video,
  Users,
  MapPin,
  Link,
  Clock,
  Edit,
  Trash2,
  Eye,
  CheckSquare,
  ChevronDown,
  Square,
  Play,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Checkbox } from '@/components/scopes/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/scopes/ui/select';
import { reunioesSupabaseService, Reuniao } from '@/lib/services/reunioes-supabase';
import { useToast } from '@/hooks/use-toast';

interface MeetingListProps {
  onNewMeeting?: () => void;
  refreshTrigger?: number;
}

export function MeetingList({ onNewMeeting, refreshTrigger }: MeetingListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeetings, setSelectedMeetings] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'>('todos');
  const [meetings, setMeetings] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await reunioesSupabaseService.listar({
        status: statusFilter === 'todos' ? undefined : statusFilter,
        busca: searchTerm || undefined,
        page: currentPage,
        limit: 10
      });
      setMeetings(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error('Erro ao carregar reuniões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as reuniões. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [currentPage, refreshTrigger, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadMeetings();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset selection when meetings change
  useEffect(() => {
    setSelectedMeetings([]);
    setIsAllSelected(false);
  }, [meetings]);

  const handleExcluirMeeting = async (id: number) => {
    try {
      await reunioesSupabaseService.excluir(id);
      toast({
        title: "Sucesso",
        description: "Reunião excluída com sucesso.",
      });
      loadMeetings();
    } catch (error) {
      console.error('Erro ao excluir reunião:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a reunião.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'agendada': 'status-pending',
      'em_andamento': 'status-info',
      'concluida': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-300';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'agendada': 'Agendada',
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída',
      'cancelada': 'Cancelada'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getMeetingTypeText = (tipo: string) => {
    const types = {
      'online': 'Online',
      'presencial': 'Presencial',
      'hibrida': 'Híbrida'
    };
    return types[tipo as keyof typeof types] || tipo;
  };

  const getMeetingTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'online':
        return Video;
      case 'presencial':
        return MapPin;
      case 'hibrida':
        return Users;
      default:
        return Users;
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      meeting.titulo.toLowerCase().includes(searchLower) ||
      (meeting.projeto_nome && meeting.projeto_nome.toLowerCase().includes(searchLower)) ||
      (meeting.cliente_nome && meeting.cliente_nome.toLowerCase().includes(searchLower))
    );
    const matchesStatus = statusFilter === 'todos' ? true : meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getMeetingCount = (count: number) => {
    if (count === 0) return '0 reuniões';
    if (count === 1) return '1 reunião';
    return `${count} reuniões`;
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedMeetings([]);
      setIsAllSelected(false);
    } else {
      setSelectedMeetings(filteredMeetings.map(m => m.id));
      setIsAllSelected(true);
    }
  };

  const handleSelectMeeting = (id: number) => {
    setSelectedMeetings(prev => {
      const n = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      setIsAllSelected(n.length === filteredMeetings.length);
      return n;
    });
  };

  const handleBulkAction = (action: 'concluir' | 'cancelar' | 'excluir') => {
    if (selectedMeetings.length === 0) return;
    console.log('bulk', action, selectedMeetings);
    setSelectedMeetings([]);
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
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Reuniões</h2>
                <p className="text-muted-foreground">Gerencie reuniões e encontros com clientes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="status-info w-52 text-center justify-center text-lg">
                Total: {getMeetingCount(filteredMeetings.length)}
              </Badge>
            </div>
            <Button onClick={onNewMeeting} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Nova Reunião
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
                placeholder="Buscar reuniões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedMeetings.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {selectedMeetings.length} selecionada(s)
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
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Concluir Selecionadas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('cancelar')}>
                      <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                      Cancelar Selecionadas
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
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando reuniões...</span>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma reunião encontrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="Selecionar todos" />
                  </TableHead>
                  <TableHead>Reunião</TableHead>
                  <TableHead>Projeto/Cliente</TableHead>
                  <TableHead>Data/Horário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.map((meeting) => {
                  const TypeIcon = getMeetingTypeIcon(meeting.tipo);
                  const meetingDateTime = new Date(`${meeting.data_reuniao}T${meeting.horario_inicio}`);
                  const isToday = new Date().toDateString() === meetingDateTime.toDateString();
                  const isPast = meetingDateTime < new Date();
                  
                  return (
                    <TableRow key={meeting.id} className={`hover:bg-muted/50 transition-colors ${isToday ? 'bg-blue-50/50' : ''}`}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedMeetings.includes(meeting.id)} 
                          onCheckedChange={() => handleSelectMeeting(meeting.id)} 
                          aria-label={`Selecionar reunião ${meeting.titulo}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isToday ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                            <Users className={`h-4 w-4 ${isToday ? 'text-blue-400' : 'text-purple-400'}`} />
                          </div>
                          <div>
                            <div className="font-medium">{meeting.titulo}</div>
                            {isToday && <Badge variant="outline" className="status-info text-xs mt-1">Hoje</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                            title={meeting.cliente_nome || 'Cliente não informado'}
                          >
                            {meeting.cliente_foto ? (
                              <img 
                                src={meeting.cliente_foto} 
                                alt={meeting.cliente_nome || 'Cliente'} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling!.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`text-xs font-semibold text-gray-300 ${meeting.cliente_foto ? 'hidden' : ''}`}>
                              {(meeting.cliente_nome || 'CI')[0].toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{meeting.projeto_nome || 'Projeto não informado'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-2 font-medium">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(meeting.data_reuniao).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {meeting.horario_inicio} - {meeting.horario_fim}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{getMeetingTypeText(meeting.tipo)}</span>
                        </div>
                        {meeting.tipo === 'online' && meeting.link_reuniao && (
                          <div className="flex items-center gap-1 mt-1">
                            <Link className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-blue-500 cursor-pointer hover:underline">
                              Link da reunião
                            </span>
                          </div>
                        )}
                        {meeting.tipo === 'presencial' && meeting.local && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {meeting.local}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(meeting.status)}
                        >
                          {getStatusText(meeting.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Badge variant="outline" className="bg-blue-500 text-white cursor-pointer hover:bg-blue-600" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Badge>
                          {meeting.tipo === 'online' && meeting.link_reuniao && meeting.status !== 'cancelada' && (
                            <Badge variant="outline" className="bg-green-500 text-white cursor-pointer hover:bg-green-600" title="Entrar na reunião">
                              <Play className="h-4 w-4" />
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Badge>
                          {meeting.status === 'agendada' && (
                            <Badge variant="outline" className="bg-green-500 text-white cursor-pointer hover:bg-green-600" title="Marcar como concluída">
                              <CheckCircle className="h-4 w-4" />
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-red-500 text-white cursor-pointer hover:bg-red-600" title="Excluir" onClick={() => handleExcluirMeeting(meeting.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}