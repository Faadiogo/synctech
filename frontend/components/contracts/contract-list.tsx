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
  Briefcase,
  Download,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  FileText,
  ChevronDown,
  CheckSquare,
  Square,
  Send,
} from 'lucide-react';
import { Checkbox } from '@/components/scopes/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/scopes/ui/select';

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
  onNewContract?: () => void;
  refreshTrigger?: number;
}

export function ContractList({ onNewContract, refreshTrigger }: ContractListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContracts, setSelectedContracts] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'concluido' | 'cancelado'>('todos');

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
    const matchesSearch = (
      contract.numero_contrato.toLowerCase().includes(searchLower) ||
      contract.cliente_nome.toLowerCase().includes(searchLower) ||
      contract.projeto_nome.toLowerCase().includes(searchLower)
    );
    const matchesStatus = statusFilter === 'todos' ? true : contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getContractCount = (count: number) => {
    if (count === 0) return '0 contratos';
    if (count === 1) return '1 contrato';
    return `${count} contratos`;
  };

  // Seleção
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedContracts([]);
      setIsAllSelected(false);
    } else {
      setSelectedContracts(filteredContracts.map(c => c.id));
      setIsAllSelected(true);
    }
  };

  const handleSelectContract = (id: number) => {
    setSelectedContracts(prev => {
      const newSel = prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id];
      setIsAllSelected(newSel.length === filteredContracts.length);
      return newSel;
    });
  };

  const handleBulkAction = (action: 'concluir' | 'cancelar' | 'excluir') => {
    if (selectedContracts.length === 0) return;
    console.log('Bulk', action, selectedContracts);
    setSelectedContracts([]);
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
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Contratos</h2>
                <p className="text-muted-foreground">Gerencie contratos e documentos legais</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="status-info w-52 text-center justify-center text-lg">
                Total: {getContractCount(filteredContracts.length)}
              </Badge>
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
          <div className="flex items-center gap-4 justify-between">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar contratos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedContracts.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {selectedContracts.length} selecionado(s)
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
                      Concluir Selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('cancelar')}>
                      <Square className="mr-2 h-4 w-4 text-orange-600" />
                      Cancelar Selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('excluir')}>
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      Excluir Selecionados
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
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                    <Checkbox
                      checked={selectedContracts.includes(contract.id)}
                      onCheckedChange={() => handleSelectContract(contract.id)}
                      aria-label={`Selecionar contrato ${contract.numero_contrato}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Briefcase className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium">{contract.numero_contrato}</div>
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
                    <div className="flex items-center gap-2 justify-center">
                      <Badge variant="outline" className="bg-blue-500 text-white cursor-pointer hover:bg-blue-600" title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600" title="Editar">
                        <Edit className="h-4 w-4" />
                      </Badge>
                      <Badge variant="outline" className="bg-purple-500 text-white cursor-pointer hover:bg-purple-600" title="Download PDF">
                        <Download className="h-4 w-4" />
                      </Badge>
                      <Badge variant="outline" className="bg-teal-500 text-white cursor-pointer hover:bg-teal-600" title="Ver Parcelas">
                        <DollarSign className="h-4 w-4" />
                      </Badge>
                      <Badge variant="outline" className="bg-red-500 text-white cursor-pointer hover:bg-red-600" title="Cancelar">
                        <Trash2 className="h-4 w-4" />
                      </Badge>
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