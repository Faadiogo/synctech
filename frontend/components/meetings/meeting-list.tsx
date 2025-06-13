'use client';

import { useState } from 'react';
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
  MoreHorizontal,
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  CheckSquare,
  Square
} from 'lucide-react';
import { Checkbox } from '@/components/scopes/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/scopes/ui/select';

interface Meeting {
  id: number;
  titulo: string;
  projeto_nome: string;
  cliente_nome: string;
  data_reuniao: string;
  horario_inicio: string;
  horario_fim: string;
  tipo: string;
  status: string;
  link_reuniao?: string;
}

interface MeetingListProps {
  onNewMeeting?: () => void;
  refreshTrigger?: number;
}

export function MeetingList({ onNewMeeting, refreshTrigger }: MeetingListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeetings, setSelectedMeetings] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'agendada' | 'realizada' | 'cancelada'>('todos');

  // Mock data
  const meetings: Meeting[] = [
    {
      id: 1,
      titulo: 'Reunião de Kickoff - Sistema de Gestão',
      projeto_nome: 'Sistema de Gestão Empresarial',
      cliente_nome: 'TechCorp Solutions',
      data_reuniao: '2024-01-20',
      horario_inicio: '14:00',
      horario_fim: '15:30',
      tipo: 'online',
      status: 'agendada',
      link_reuniao: 'https://meet.google.com/abc-def-ghi'
    },
    {
      id: 2,
      titulo: 'Apresentação do Protótipo',
      projeto_nome: 'E-commerce Personalizado',
      cliente_nome: 'Maria Santos',
      data_reuniao: '2024-01-18',
      horario_inicio: '10:00',
      horario_fim: '11:00',
      tipo: 'presencial',
      status: 'realizada'
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'agendada': 'status-info',
      'realizada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'agendada': 'Agendada',
      'realizada': 'Realizada',
      'cancelada': 'Cancelada'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'online':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'presencial':
        return <MapPin className="h-4 w-4 text-green-600" />;
      case 'telefone':
        return <Phone className="h-4 w-4 text-orange-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTipoText = (tipo: string) => {
    const texts = {
      'online': 'Online',
      'presencial': 'Presencial',
      'telefone': 'Telefone'
    };
    return texts[tipo as keyof typeof texts] || tipo;
  };

  const filteredMeetings = meetings.filter(meeting => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      meeting.titulo.toLowerCase().includes(searchLower) ||
      meeting.projeto_nome.toLowerCase().includes(searchLower) ||
      meeting.cliente_nome.toLowerCase().includes(searchLower)
    );
    const matchesStatus = statusFilter === 'todos' ? true : meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getMeetingCount = (c: number) => c === 0 ? '0 reuniões' : c === 1 ? '1 reunião' : `${c} reuniões`;

  const handleSelectAll = () => { if (isAllSelected) { setSelectedMeetings([]); setIsAllSelected(false); } else { setSelectedMeetings(filteredMeetings.map(m => m.id)); setIsAllSelected(true); } };
  const handleSelectMeeting = (id: number) => { setSelectedMeetings(p => { const n = p.includes(id) ? p.filter(i => i !== id) : [...p, id]; setIsAllSelected(n.length === filteredMeetings.length); return n; }); };
  const handleBulkAction = (action: 'realizar' | 'cancelar' | 'excluir') => { if (selectedMeetings.length === 0) return; console.log('bulk', action, selectedMeetings); setSelectedMeetings([]); setIsAllSelected(false); };

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
                <h2 className="text-3xl font-bold">Reuniões</h2>
                <p className="text-muted-foreground">Gerencie reuniões e compromissos com clientes</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-between">
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
                    <DropdownMenuItem onClick={() => handleBulkAction('realizar')}>
                      <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                      Marcar como realizada
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('cancelar')}>
                      <Square className="mr-2 h-4 w-4 text-orange-600" />
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
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"><Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="Selecionar todos" /></TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Projeto/Cliente</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetings.map((meeting) => (
                <TableRow key={meeting.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell><Checkbox checked={selectedMeetings.includes(meeting.id)} onCheckedChange={() => handleSelectMeeting(meeting.id)} aria-label={`Selecionar reunião ${meeting.id}`} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Calendar className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium">{meeting.titulo}</div>
                        <div className="text-sm text-muted-foreground">ID: #{meeting.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{meeting.projeto_nome}</div>
                      <div className="text-sm text-muted-foreground">{meeting.cliente_nome}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {new Date(meeting.data_reuniao).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {meeting.horario_inicio} - {meeting.horario_fim}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        {getTipoIcon(meeting.tipo)}
                      </div>
                      <span className="text-sm font-medium">{getTipoText(meeting.tipo)}</span>
                    </div>
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
                      <Badge variant="outline" className="bg-blue-500 text-white cursor-pointer hover:bg-blue-600" title="Detalhes"><Eye className="h-4 w-4" /></Badge>
                      <Badge variant="outline" className="bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600" title="Editar"><Edit className="h-4 w-4" /></Badge>
                      {meeting.link_reuniao && <Badge variant="outline" className="bg-purple-500 text-white cursor-pointer hover:bg-purple-600" title="Entrar"><Video className="h-4 w-4" /></Badge>}
                      <Badge variant="outline" className="bg-red-500 text-white cursor-pointer hover:bg-red-600" title="Cancelar"><Trash2 className="h-4 w-4" /></Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}