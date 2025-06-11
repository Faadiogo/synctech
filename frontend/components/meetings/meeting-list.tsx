'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Eye
} from 'lucide-react';

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
  onNewMeeting: () => void;
}

export function MeetingList({ onNewMeeting }: MeetingListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
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
      'agendada': 'bg-blue-100 text-blue-800',
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
    return (
      meeting.titulo.toLowerCase().includes(searchLower) ||
      meeting.projeto_nome.toLowerCase().includes(searchLower) ||
      meeting.cliente_nome.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reuniões</h2>
          <p className="text-gray-600">Gerencie reuniões e compromissos com clientes</p>
        </div>
        <Button onClick={onNewMeeting} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Reunião
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar reuniões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredMeetings.length} reunião(ões) encontrada(s)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Projeto/Cliente</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{meeting.titulo}</div>
                      <div className="text-sm text-gray-500">ID: #{meeting.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{meeting.projeto_nome}</div>
                      <div className="text-sm text-gray-500">{meeting.cliente_nome}</div>
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
                    <div className="flex items-center gap-2">
                      {getTipoIcon(meeting.tipo)}
                      <span className="text-sm">{getTipoText(meeting.tipo)}</span>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {meeting.link_reuniao && (
                          <DropdownMenuItem>
                            <Video className="mr-2 h-4 w-4" />
                            Entrar na reunião
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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