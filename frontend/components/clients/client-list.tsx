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
import { Search, Plus, MoreHorizontal, Building2, User, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';

interface Client {
  id: number;
  tipo_pessoa: 'PF' | 'PJ';
  nome_empresa?: string;
  nome_completo?: string;
  cpf?: string;
  cnpj?: string;
  telefone: string;
  email: string;
  cidade: string;
  uf: string;
  ativo: boolean;
  projetos_count: number;
}

interface ClientListProps {
  onNewClient: () => void;
}

export function ClientList({ onNewClient }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data
  const clients: Client[] = [
    {
      id: 1,
      tipo_pessoa: 'PJ',
      nome_empresa: 'TechCorp Solutions',
      cnpj: '12.345.678/0001-90',
      telefone: '(11) 98765-4321',
      email: 'contato@techcorp.com.br',
      cidade: 'São Paulo',
      uf: 'SP',
      ativo: true,
      projetos_count: 1
    },
    {
      id: 2,
      tipo_pessoa: 'PF',
      nome_completo: 'Maria Santos',
      cpf: '123.456.789-00',
      telefone: '(11) 99876-5432',
      email: 'maria.santos@email.com',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
      ativo: true,
      projetos_count: 1
    }
  ];

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.nome_empresa?.toLowerCase().includes(searchLower) ||
      client.nome_completo?.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.cidade.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-600">Gerencie seus clientes e suas informações</p>
        </div>
        <Button onClick={onNewClient} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredClients.length} cliente(s) encontrado(s)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Projetos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        {client.tipo_pessoa === 'PJ' ? (
                          <Building2 className="h-5 w-5 text-blue-600" />
                        ) : (
                          <User className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {client.nome_empresa || client.nome_completo}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.cnpj || client.cpf}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.tipo_pessoa === 'PJ' ? 'default' : 'secondary'}>
                      {client.tipo_pessoa === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {client.telefone}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {client.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {client.cidade}, {client.uf}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {client.projetos_count} projeto(s)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={client.ativo ? 'default' : 'secondary'}
                      className={client.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {client.ativo ? 'Ativo' : 'Inativo'}
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
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>Ver projetos</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {client.ativo ? 'Desativar' : 'Ativar'}
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