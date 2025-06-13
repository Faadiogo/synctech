import React, { useState, useEffect } from 'react';
import { Button } from '@/components/scopes/ui/button';
import { Input } from '@/components/scopes/ui/input';
import { Badge } from '@/components/scopes/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/scopes/ui/card';
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
import { Checkbox } from '@/components/scopes/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/scopes/ui/select';
import {
  FolderTree,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  ChevronDown,
  CheckSquare,
  Square,
  Loader2
} from 'lucide-react';
import { escoposSupabaseService, Escopo } from '@/lib/services/escopos-supabase';
import { useToast } from '@/hooks/use-toast';

interface ScopeListProps {
  onNewScope?: () => void;
  refreshTrigger?: number;
}

export function ScopeList({ onNewScope, refreshTrigger }: ScopeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'>('todos');
  const [scopes, setScopes] = useState<Escopo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const loadScopes = async () => {
    try {
      setLoading(true);
      const response = await escoposSupabaseService.listar({
        status: statusFilter === 'todos' ? undefined : statusFilter,
        busca: searchTerm || undefined,
        page: currentPage,
        limit: 10
      });
      setScopes(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error('Erro ao carregar escopos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os escopos. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScopes();
  }, [currentPage, refreshTrigger, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadScopes();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset selection when scopes change
  useEffect(() => {
    setSelectedScopes([]);
    setIsAllSelected(false);
  }, [scopes]);

  const handleExcluirScope = async (id: number) => {
    try {
      await escoposSupabaseService.excluir(id);
      toast({
        title: "Sucesso",
        description: "Escopo excluído com sucesso.",
      });
      loadScopes();
    } catch (error) {
      console.error('Erro ao excluir escopo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o escopo.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'planejado': 'status-pending',
      'em_andamento': 'status-info',
      'concluido': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-300';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'planejado': 'Planejado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const filteredScopes = scopes.filter(scope => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      scope.nome.toLowerCase().includes(searchLower) ||
      (scope.projeto_nome && scope.projeto_nome.toLowerCase().includes(searchLower)) ||
      (scope.cliente_nome && scope.cliente_nome.toLowerCase().includes(searchLower))
    );
    const matchesStatus = statusFilter === 'todos' ? true : scope.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getScopeCount = (count: number) => {
    if (count === 0) return '0 escopos';
    if (count === 1) return '1 escopo';
    return `${count} escopos`;
  };

  // Seleção
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedScopes([]);
      setIsAllSelected(false);
    } else {
      setSelectedScopes(filteredScopes.map(s => s.id));
      setIsAllSelected(true);
    }
  };

  const handleSelectScope = (id: number) => {
    setSelectedScopes(prev => {
      const newSel = prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id];
      setIsAllSelected(newSel.length === filteredScopes.length);
      return newSel;
    });
  };

  const handleBulkAction = (action: 'concluir' | 'cancelar' | 'excluir') => {
    if (selectedScopes.length === 0) return;
    console.log('Bulk', action, selectedScopes);
    setSelectedScopes([]);
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
                <FolderTree className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Escopo Funcional</h2>
                <p className="text-muted-foreground">Gerencie os escopos funcionais dos projetos.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="status-info w-52 text-center justify-center text-lg">
                Total: {getScopeCount(filteredScopes.length)}
              </Badge>
            </div>
            <Button onClick={onNewScope} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Novo Escopo Funcional
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
                placeholder="Buscar escopos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedScopes.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {selectedScopes.length} selecionado(s)
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
                  <SelectItem value="planejado">Planejado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando escopos...</span>
            </div>
          ) : filteredScopes.length > 0 ? (
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
                  <TableHead>Escopo</TableHead>
                  <TableHead>Projeto/Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScopes.map((scope) => (
                  <TableRow key={scope.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedScopes.includes(scope.id)}
                        onCheckedChange={() => handleSelectScope(scope.id)}
                        aria-label={`Selecionar escopo ${scope.nome}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <FolderTree className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium">{scope.nome}</div>
                          <div className="text-sm text-muted-foreground">Escopo Funcional</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                          title={scope.cliente_nome || 'Cliente não informado'}
                        >
                          {scope.cliente_foto ? (
                            <img 
                              src={scope.cliente_foto} 
                              alt={scope.cliente_nome || 'Cliente'} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-xs font-semibold text-gray-300 ${scope.cliente_foto ? 'hidden' : ''}`}>
                            {(scope.cliente_nome || 'CI')[0].toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{scope.projeto_nome || 'Projeto não informado'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(scope.status)}
                      >
                        {getStatusText(scope.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {scope.data_alvo && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(scope.data_alvo).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-500 text-white cursor-pointer hover:bg-blue-600" title="Visualizar" onClick={() => {}}>
                        <Eye className="h-4 w-4" />
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600" title="Editar" onClick={() => {}}>
                        <Edit className="h-4 w-4" />
                      </Badge>
                      <Badge variant="outline" className="bg-red-500 text-white cursor-pointer hover:bg-red-600" title="Excluir" onClick={() => handleExcluirScope(scope.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 mb-2 border border-blue-100">
                <FolderTree className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-lg font-semibold text-gray-300">
                {searchTerm ? 'Nenhum escopo encontrado' : 'Nenhum escopo funcional cadastrado ainda'}
              </div>
              <div className="text-muted-foreground max-w-md">
                {searchTerm ?
                  'Tente ajustar sua busca ou criar um novo escopo funcional.' :
                  'Crie e organize os escopos funcionais dos seus projetos para facilitar o acompanhamento das funcionalidades e entregas.'
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 