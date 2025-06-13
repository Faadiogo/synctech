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
  Search,
  Plus,
  Calendar,
  FileText,
  Download,
  Eye,
  Send,
  Edit,
  Trash2,
  ChevronDown,
  CheckSquare,
  Square,
  FilePenLine,
  Loader2,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/scopes/ui/dialog';
import { BudgetForm } from './budget-form';
import { Checkbox } from '@/components/scopes/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/scopes/ui/dropdown-menu';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/scopes/ui/select';
import { orcamentosSupabaseService, Orcamento } from '@/lib/services/orcamentos-supabase';
import { useToast } from '@/hooks/use-toast';

interface BudgetListProps {
  onNewBudget?: () => void;
  refreshTrigger?: number;
}

export function BudgetList({ onNewBudget, refreshTrigger }: BudgetListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [selectedBudgets, setSelectedBudgets] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'expirado'>('todos');
  const [budgets, setBudgets] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await orcamentosSupabaseService.listar({
        status: statusFilter === 'todos' ? undefined : statusFilter,
        busca: searchTerm || undefined,
        page: currentPage,
        limit: 10
      });
      setBudgets(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os orçamentos. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [currentPage, refreshTrigger, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadBudgets();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset selection when budgets change
  useEffect(() => {
    setSelectedBudgets([]);
    setIsAllSelected(false);
  }, [budgets]);

  const handleExcluirBudget = async (id: number) => {
    try {
      await orcamentosSupabaseService.excluir(id);
      toast({
        title: "Sucesso",
        description: "Orçamento excluído com sucesso.",
      });
      loadBudgets();
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o orçamento.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'rascunho': 'bg-gray-200 text-gray-300',
      'enviado': 'bg-blue-400 text-blue-800',
      'aprovado': 'bg-green-400 text-green-800',
      'recusado': 'bg-red-400 text-red-800',
      'expirado': 'status-pending'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-300';
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

  const getBudgetCount = (count: number) => {
    if (count === 0) return '0 orçamentos';
    if (count === 1) return '1 orçamento';
    return `${count} orçamentos`;
  };

  const filteredBudgets = budgets.filter(budget => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      budget.numero_orcamento.toLowerCase().includes(searchLower) ||
      (budget.cliente_nome && budget.cliente_nome.toLowerCase().includes(searchLower)) ||
      (budget.projeto_nome && budget.projeto_nome.toLowerCase().includes(searchLower))
    );

    const matchesStatus = statusFilter === 'todos' ? true : budget.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleNewBudget = () => {
    setBudgetFormOpen(true);
  };

  const handleEditBudget = (id: number) => {
    setBudgetFormOpen(true);
  };

  // Seleção
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBudgets([]);
      setIsAllSelected(false);
    } else {
      setSelectedBudgets(filteredBudgets.map(b => b.id));
      setIsAllSelected(true);
    }
  };

  const handleSelectBudget = (id: number) => {
    setSelectedBudgets(prev => {
      const newSel = prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id];
      setIsAllSelected(newSel.length === filteredBudgets.length);
      return newSel;
    });
  };

  const handleBulkAction = (action: 'enviar' | 'aprovar' | 'recusar' | 'excluir') => {
    if (selectedBudgets.length === 0) return;
    console.log('Bulk', action, selectedBudgets);
    setSelectedBudgets([]);
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
                <h2 className="text-3xl font-bold">Orçamentos</h2>
                <p className="text-muted-foreground">Gerencie orçamentos e propostas comerciais</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="status-info w-52 text-center justify-center text-lg">
                Total: {getBudgetCount(filteredBudgets.length)}
              </Badge>
            </div>
            <Button onClick={() => handleNewBudget()} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Novo Orçamento
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
                placeholder="Buscar orçamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedBudgets.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {selectedBudgets.length} selecionado(s)
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      Ações em Lote
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('enviar')}>
                      <Send className="mr-2 h-4 w-4 text-green-600" />
                      Enviar Selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('aprovar')}>
                      <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                      Aprovar Selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('recusar')}>
                      <Square className="mr-2 h-4 w-4 text-orange-600" />
                      Recusar Selecionados
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
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="recusado">Recusado</SelectItem>
                  <SelectItem value="expirado">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando orçamentos...</span>
            </div>
          ) : filteredBudgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum orçamento encontrado.</p>
            </div>
          ) : (
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
                  <TableHead>Data Envio</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.map((budget) => (
                  <TableRow key={budget.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedBudgets.includes(budget.id)}
                        onCheckedChange={() => handleSelectBudget(budget.id)}
                        aria-label={`Selecionar orçamento ${budget.numero_orcamento}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <FileText className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">{budget.numero_orcamento}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                          title={budget.cliente_nome || 'Cliente não informado'}
                        >
                          {budget.cliente_foto ? (
                            <img 
                              src={budget.cliente_foto} 
                              alt={budget.cliente_nome || 'Cliente'} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-xs font-semibold text-gray-300 ${budget.cliente_foto ? 'hidden' : ''}`}>
                            {(budget.cliente_nome || 'CI')[0].toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{budget.projeto_nome || 'Projeto não informado'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {budget.data_envio ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(budget.data_envio).toLocaleDateString('pt-BR')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não enviado</span>
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
                        {budget.desconto && budget.desconto > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <span className="line-through">
                              R$ {budget.valor_total.toLocaleString('pt-BR')}
                            </span>
                            <span className="ml-1 text-green-600">
                              -{((budget.desconto / budget.valor_total) * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                        <div className="font-medium">
                          R$ {budget.valor_final.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(budget.status)}
                      >
                        {getStatusText(budget.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <Badge
                          variant="outline"
                          className="bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
                          title="Visualizar"
                          onClick={() => console.log('Visualizar', budget.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600"
                          title="Editar"
                          onClick={() => handleEditBudget(budget.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-purple-500 text-white cursor-pointer hover:bg-purple-600"
                          title="Download PDF"
                          onClick={() => console.log('Download PDF', budget.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Badge>
                        {budget.status === 'rascunho' && (
                          <Badge
                            variant="outline"
                            className="bg-green-500 text-white cursor-pointer hover:bg-green-600"
                            title="Enviar"
                            onClick={() => console.log('Enviar', budget.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-green-500 text-white cursor-pointer hover:bg-green-600" title="Gerar Contrato">
                          <FilePenLine className="h-4 w-4" />
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-red-500 text-white cursor-pointer hover:bg-red-600"
                          title="Excluir"
                          onClick={() => handleExcluirBudget(budget.id)}
                        >
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

      {/* Modal para formulário de orçamento */}
      <Dialog open={budgetFormOpen} onOpenChange={setBudgetFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <BudgetForm
            onClose={() => setBudgetFormOpen(false)}
          /* futuro: budgetId={editingBudgetId} */
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}