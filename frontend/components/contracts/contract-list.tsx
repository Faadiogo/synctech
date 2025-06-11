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
  Briefcase,
  Download,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  FileText,
} from 'lucide-react';

interface Contract {
  id: number;
  numero_contrato: string;
  cliente_nome: string;
  projeto_nome: string;
  data_assinatura: string;
  valor_contrato: number;
  qtd_parcelas: number;
  status: string;
}

interface ContractListProps {
  onNewContract: () => void;
}

export function ContractList({ onNewContract }: ContractListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const contracts: Contract[] = [
    {
      id: 1,
      numero_contrato: 'CONT-2024-001',
      cliente_nome: 'TechCorp Solutions',
      projeto_nome: 'Sistema de Gestão Empresarial',
      data_assinatura: '2024-01-15',
      valor_contrato: 80000,
      qtd_parcelas: 4,
      status: 'ativo'
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'ativo': 'bg-green-100 text-green-800',
      'concluido': 'status-info',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'ativo': 'Ativo',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const filteredContracts = contracts.filter(contract => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contract.numero_contrato.toLowerCase().includes(searchLower) ||
      contract.cliente_nome.toLowerCase().includes(searchLower) ||
      contract.projeto_nome.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Contratos</h2>
                <p className="text-muted-foreground">Gerencie contratos e documentos legais</p>
              </div>
            </div>
            <Button onClick={onNewContract} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Novo Contrato
            </Button>
          </div>
        </div>
      </div>

      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar contratos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="status-info">
                {filteredContracts.length} contrato(s) encontrado(s)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente/Projeto</TableHead>
                <TableHead>Data Assinatura</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Briefcase className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium">{contract.numero_contrato}</div>
                        <div className="text-sm text-muted-foreground">ID: #{contract.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contract.cliente_nome}</div>
                      <div className="text-sm text-muted-foreground">{contract.projeto_nome}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {new Date(contract.data_assinatura).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-green-600">
                      R$ {contract.valor_contrato.toLocaleString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="status-pending">
                      {contract.qtd_parcelas}x
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(contract.status)}
                    >
                      {getStatusText(contract.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-800 text-white hover:bg-blue-900 cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Ver parcelas
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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