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
  MoreHorizontal, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  CheckCircle,
  ChevronDown,
  CheckSquare,
  Square,
  Wallet,
  CreditCard,
  Filter,
  X,
  Eraser,
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
import { financeiroSupabaseService, TransacaoFinanceira } from '@/lib/services/financeiro-supabase';
import { useToast } from '@/hooks/use-toast';

interface FinancialListProps {
  onNewTransaction?: () => void;
  refreshTrigger?: number;
}

export function FinancialList({ onNewTransaction, refreshTrigger }: FinancialListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<'todos' | 'mes_atual' | 'mes_anterior' | 'ultimos_30_dias' | 'ultimos_90_dias'>('mes_atual');
  
  // Filtros avançados
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'em_aberto' | 'pago' | 'atrasado' | 'cancelado'>('todos');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [clientFilter, setClientFilter] = useState('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [transactions, setTransactions] = useState<TransacaoFinanceira[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await financeiroSupabaseService.listar({
        status: statusFilter === 'todos' ? undefined : statusFilter,
        tipo_movimento: typeFilter === 'todos' ? undefined : typeFilter,
        busca: searchTerm || undefined,
        data_inicio: startDate || undefined,
        data_fim: endDate || undefined,
        page: currentPage,
        limit: 10
      });
      setTransactions(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error('Erro ao carregar transações financeiras:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [currentPage, refreshTrigger, statusFilter, typeFilter, startDate, endDate]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadTransactions();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset selection when transactions change
  useEffect(() => {
    setSelectedTransactions([]);
    setIsAllSelected(false);
  }, [transactions]);

  const handleExcluirTransaction = async (id: number) => {
    try {
      await financeiroSupabaseService.excluir(id);
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso.",
      });
      loadTransactions();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'em_aberto': 'status-pending',
      'pago': 'bg-green-100 text-green-800',
      'atrasado': 'bg-red-100 text-red-800',
      'cancelado': 'bg-gray-100 text-gray-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-300';
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

  const filterByPeriod = (transaction: TransacaoFinanceira) => {
    const transactionDate = new Date(transaction.data_vencimento);
    
    // Filtro por data inicial e final (prioritário)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return transactionDate >= start && transactionDate <= end;
    }
    
    // Filtro por período predefinido
    if (periodFilter === 'todos') return true;
    
    const now = new Date();
    
    switch (periodFilter) {
      case 'mes_atual':
        return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
      case 'mes_anterior':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return transactionDate.getMonth() === lastMonth.getMonth() && transactionDate.getFullYear() === lastMonth.getFullYear();
      case 'ultimos_30_dias':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return transactionDate >= thirtyDaysAgo;
      case 'ultimos_90_dias':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return transactionDate >= ninetyDaysAgo;
      default:
        return true;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      transaction.contrato_numero.toLowerCase().includes(searchLower) ||
      transaction.cliente_nome.toLowerCase().includes(searchLower) ||
      transaction.descricao.toLowerCase().includes(searchLower)
    );
    const matchesStatus = statusFilter === 'todos' ? true : transaction.status === statusFilter;
    const matchesType = typeFilter === 'todos' ? true : transaction.tipo_movimento === typeFilter;
    const matchesClient = clientFilter === 'todos' ? true : transaction.cliente_nome.toLowerCase().includes(clientFilter.toLowerCase());
    const matchesPeriod = filterByPeriod(transaction);
    return matchesSearch && matchesStatus && matchesType && matchesClient && matchesPeriod;
  });

  // Cálculos financeiros
  const totalEntradas = filteredTransactions
    .filter(t => t.tipo_movimento === 'entrada')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalSaidas = filteredTransactions
    .filter(t => t.tipo_movimento === 'saida')
    .reduce((sum, t) => sum + t.valor, 0);

  const saldo = totalEntradas - totalSaidas;

  const getTransactionCount = (count: number) => {
    if (count === 0) return '0 transações';
    if (count === 1) return '1 transação';
    return `${count} transações`;
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTransactions([]);
      setIsAllSelected(false);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
      setIsAllSelected(true);
    }
  };

  const handleSelectTransaction = (id: number) => {
    setSelectedTransactions(prev => {
      const n = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      setIsAllSelected(n.length === filteredTransactions.length);
      return n;
    });
  };

  const handleBulkAction = (action: 'marcar_pago' | 'cancelar' | 'excluir') => {
    if (selectedTransactions.length === 0) return;
    console.log('bulk', action, selectedTransactions);
    setSelectedTransactions([]);
    setIsAllSelected(false);
  };

  const clearAdvancedFilters = () => {
    setStatusFilter('todos');
    setTypeFilter('todos');
    setClientFilter('todos');
    setStartDate('');
    setEndDate('');
  };

  // Obter lista única de clientes para o filtro
  const uniqueClients = Array.from(new Set(transactions.map(t => t.cliente_nome)));

  // Verificar se há filtros avançados ativos
  const hasActiveAdvancedFilters = 
    statusFilter !== 'todos' || 
    typeFilter !== 'todos' || 
    clientFilter !== 'todos' || 
    startDate !== '' || 
    endDate !== '';

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header reduzido */}
      <div className="relative mb-8 p-4 rounded-2xl gradient-bg border border-border/50">
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Financeiro</h2>
              <p className="text-muted-foreground">Controle de receitas, despesas e pagamentos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="tech-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalEntradas.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="tech-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalSaidas.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/20">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="tech-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {saldo.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${saldo >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <Wallet className={`h-6 w-6 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center gap-4 justify-between">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedTransactions.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {selectedTransactions.length} selecionada(s)
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      Ações em Lote
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('marcar_pago')}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Marcar como pago
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
              <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todo o período</SelectItem>
                  <SelectItem value="mes_atual">Mês Atual</SelectItem>
                  <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
                  <SelectItem value="ultimos_30_dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="ultimos_90_dias">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              
              <DropdownMenu open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={hasActiveAdvancedFilters ? "default" : "outline"} 
                    size="sm" 
                    className={`gap-2 ${hasActiveAdvancedFilters ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                  >
                    <Filter className="h-4 w-4" />
                    Mais Filtros
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filtros Avançados</h4>
                      <Button variant="ghost" size="sm" onClick={clearAdvancedFilters}>
                        <Eraser className="h-4 w-4" />
                        Limpar
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Data Inicial</label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full pr-10"
                            style={{
                              WebkitAppearance: 'none',
                              MozAppearance: 'none',
                              appearance: 'none'
                            }}
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Data Final</label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full pr-10"
                            style={{
                              WebkitAppearance: 'none',
                              MozAppearance: 'none',
                              appearance: 'none'
                            }}
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Cliente</label>
                      <Select value={clientFilter} onValueChange={setClientFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os clientes</SelectItem>
                          {uniqueClients.map((client) => (
                            <SelectItem key={client} value={client}>
                              {client}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Status</label>
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="em_aberto">Em Aberto</SelectItem>
                            <SelectItem value="pago">Pago</SelectItem>
                            <SelectItem value="atrasado">Atrasado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Tipo</label>
                        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="entrada">Entrada</SelectItem>
                            <SelectItem value="saida">Saída</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={onNewTransaction} className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando transações...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="Selecionar todos" />
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cliente/Contrato</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Checkbox checked={selectedTransactions.includes(transaction.id)} onCheckedChange={() => handleSelectTransaction(transaction.id)} aria-label={`Selecionar transação ${transaction.id}`} />
                    </TableCell>
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
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                          title={transaction.cliente_nome}
                        >
                          {transaction.cliente_foto ? (
                            <img 
                              src={transaction.cliente_foto} 
                              alt={transaction.cliente_nome} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-xs font-semibold text-gray-300 ${transaction.cliente_foto ? 'hidden' : ''}`}>
                            {(transaction.cliente_nome || 'CI')[0].toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{transaction.contrato_numero}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${transaction.tipo_movimento === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.tipo_movimento === 'entrada' ? '+' : '-'}R$ {transaction.valor.toLocaleString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.status === 'pago' && transaction.data_pagamento ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <div>
                            <div className="font-medium">Pago em</div>
                            <div>{new Date(transaction.data_pagamento).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-2 text-sm ${
                          transaction.status === 'atrasado' ? 'text-red-600' :
                          transaction.status === 'em_aberto' ? 'text-gray-300' :
                          'text-gray-400'
                        }`}>
                          <Calendar className={`h-3 w-3 ${
                            transaction.status === 'atrasado' ? 'text-red-400' :
                            transaction.status === 'em_aberto' ? 'text-gray-300' :
                            'text-gray-400'
                          }`} />
                          <div>
                            <div className="font-medium">Vence em</div>
                            <div>{new Date(transaction.data_vencimento).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
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
                      <div className="flex items-center gap-2 justify-center">
                        <Badge variant="outline" className="bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Badge>
                        {transaction.status === 'em_aberto' && (
                          <Badge variant="outline" className="bg-green-500 text-white cursor-pointer hover:bg-green-600" title="Marcar pago">
                            <CheckCircle className="h-4 w-4" />
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-red-500 text-white cursor-pointer hover:bg-red-600" title="Excluir" onClick={() => handleExcluirTransaction(transaction.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}