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
      'em_aberto': 'status-pending',
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
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Financeiro</h2>
                <p className="text-muted-foreground">Controle de receitas, despesas e pagamentos</p>
              </div>
            </div>
            <Button onClick={onNewTransaction} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Nova Transação
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
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="status-info">
                {filteredTransactions.length} transação(ões) encontrada(s)
              </Badge>
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
                <TableRow key={transaction.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${transaction.tipo_movimento === 'entrada' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {transaction.tipo_movimento === 'entrada' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <span className={transaction.tipo_movimento === 'entrada' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {transaction.tipo_movimento === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.descricao}</div>
                      <div className="text-sm text-muted-foreground">
                        {getPaymentMethodText(transaction.forma_pagamento)}
                        {transaction.numero_parcela && ` • Parcela ${transaction.numero_parcela}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.cliente_nome}</div>
                      <div className="text-sm text-muted-foreground">{transaction.contrato_numero}</div>
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
                      <span className="text-muted-foreground text-sm">Não pago</span>
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
                        <Button variant="ghost" size="sm" className="hover:bg-muted">
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