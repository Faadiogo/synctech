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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';

interface FinancialTransaction {
  id: number;
  contrato_numero: string;
  cliente_nome: string;
  tipo_movimento: 'entrada' | 'saida';
  descricao: string;
  valor: number;
  forma_pagamento: string;
  data_vencimento: string;
  data_pagamento?: string;
  status: string;
  numero_parcela?: number;
}

interface FinancialListProps {
  onNewTransaction: () => void;
}

export function FinancialList({ onNewTransaction }: FinancialListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data
  const transactions: FinancialTransaction[] = [
    {
      id: 1,
      contrato_numero: 'CONT-2024-001',
      cliente_nome: 'TechCorp Solutions',
      tipo_movimento: 'entrada',
      descricao: 'Parcela 1/4 - Sistema de Gestão',
      valor: 20000,
      forma_pagamento: 'pix',
      data_vencimento: '2024-02-15',
      data_pagamento: '2024-02-14',
      status: 'pago',
      numero_parcela: 1
    },
    {
      id: 2,
      contrato_numero: 'CONT-2024-001',
      cliente_nome: 'TechCorp Solutions',
      tipo_movimento: 'entrada',
      descricao: 'Parcela 2/4 - Sistema de Gestão',
      valor: 20000,
      forma_pagamento: 'pix',
      data_vencimento: '2024-03-15',
      status: 'em_aberto',
      numero_parcela: 2
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'em_aberto': 'bg-yellow-100 text-yellow-800',
      'pago': 'bg-green-100 text-green-800',
      'atrasado': 'bg-red-100 text-red-800',
      'cancelado': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'em_aberto': 'Em Aberto',
      'pago': 'Pago',
      'atrasado': 'Atrasado',
      'cancelado': 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methods = {
      'pix': 'PIX',
      'cartao_credito': 'Cartão de Crédito',
      'boleto': 'Boleto',
      'dinheiro': 'Dinheiro',
      'transferencia': 'Transferência'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.contrato_numero.toLowerCase().includes(searchLower) ||
      transaction.cliente_nome.toLowerCase().includes(searchLower) ||
      transaction.descricao.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financeiro</h2>
          <p className="text-gray-600">Controle de receitas, despesas e pagamentos</p>
        </div>
        <Button onClick={onNewTransaction} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredTransactions.length} transação(ões) encontrada(s)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente/Contrato</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {transaction.tipo_movimento === 'entrada' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={transaction.tipo_movimento === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.tipo_movimento === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.descricao}</div>
                      <div className="text-sm text-gray-500">
                        {getPaymentMethodText(transaction.forma_pagamento)}
                        {transaction.numero_parcela && ` • Parcela ${transaction.numero_parcela}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.cliente_nome}</div>
                      <div className="text-sm text-gray-500">{transaction.contrato_numero}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${transaction.tipo_movimento === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.tipo_movimento === 'entrada' ? '+' : '-'}R$ {transaction.valor.toLocaleString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {new Date(transaction.data_vencimento).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.data_pagamento ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        {new Date(transaction.data_pagamento).toLocaleDateString('pt-BR')}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Não pago</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(transaction.status)}
                    >
                      {getStatusText(transaction.status)}
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
                        {transaction.status === 'em_aberto' && (
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como pago
                          </DropdownMenuItem>
                        )}
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