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
  FileText,
  Download,
  Eye,
  Send,
  Edit,
  Trash2
} from 'lucide-react';

interface Budget {
  id: number;
  numero_orcamento: string;
  cliente_nome: string;
  projeto_nome: string;
  data_envio?: string;
  data_validade: string;
  valor_total: number;
  desconto?: number;
  valor_final: number;
  status: string;
}

interface BudgetListProps {
  onNewBudget: () => void;
}

export function BudgetList({ onNewBudget }: BudgetListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data
  const budgets: Budget[] = [
    {
      id: 1,
      numero_orcamento: 'ORC-2024-001',
      cliente_nome: 'TechCorp Solutions',
      projeto_nome: 'Sistema de Gestão Empresarial',
      data_envio: '2024-01-10',
      data_validade: '2024-02-10',
      valor_total: 85000,
      desconto: 5000,
      valor_final: 80000,
      status: 'aprovado'
    },
    {
      id: 2,
      numero_orcamento: 'ORC-2024-002',
      cliente_nome: 'Maria Santos',
      projeto_nome: 'E-commerce Personalizado',
      data_validade: '2024-01-25',
      valor_total: 80000,
      valor_final: 80000,
      status: 'enviado'
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'rascunho': 'bg-gray-100 text-gray-800',
      'enviado': 'bg-blue-100 text-blue-800',
      'aprovado': 'bg-green-100 text-green-800',
      'recusado': 'bg-red-100 text-red-800',
      'expirado': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'rascunho': 'Rascunho',
      'enviado': 'Enviado',
      'aprovado': 'Aprovado',
      'recusado': 'Recusado',
      'expirado': 'Expirado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const filteredBudgets = budgets.filter(budget => {
    const searchLower = searchTerm.toLowerCase();
    return (
      budget.numero_orcamento.toLowerCase().includes(searchLower) ||
      budget.cliente_nome.toLowerCase().includes(searchLower) ||
      budget.projeto_nome.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orçamentos</h2>
          <p className="text-gray-600">Gerencie orçamentos e propostas comerciais</p>
        </div>
        <Button onClick={onNewBudget} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar orçamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredBudgets.length} orçamento(s) encontrado(s)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente/Projeto</TableHead>
                <TableHead>Data Envio</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{budget.numero_orcamento}</div>
                        <div className="text-sm text-gray-500">ID: #{budget.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{budget.cliente_nome}</div>
                      <div className="text-sm text-gray-500">{budget.projeto_nome}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {budget.data_envio ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {new Date(budget.data_envio).toLocaleDateString('pt-BR')}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Não enviado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {new Date(budget.data_validade).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        R$ {budget.valor_final.toLocaleString('pt-BR')}
                      </div>
                      {budget.desconto && (
                        <div className="text-sm text-gray-500">
                          <span className="line-through">
                            R$ {budget.valor_total.toLocaleString('pt-BR')}
                          </span>
                          <span className="ml-1 text-green-600">
                            -{((budget.desconto / budget.valor_total) * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(budget.status)}
                    >
                      {getStatusText(budget.status)}
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
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        {budget.status === 'rascunho' && (
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
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