'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Search, Plus, Building2, User, Phone, Mail, MapPin, Edit, Trash2, Loader2, FolderPlus, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { clientesService } from '@/lib/services/clientesService';
import { cloudinaryService } from '@/lib/services/cloudinaryService';
import type { Cliente } from '@/lib/services/clientesService';
import { useToast } from '@/hooks/use-toast';
import { ClientForm } from './form/page';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface ClientListProps {
  onNewClient?: () => void;
  onEditClient?: (clientId: number) => void;
  onViewProjects?: (clientId: number, clientName: string) => void;
  onNewProject?: (clientId: number, clientName: string) => void;
  refreshTrigger?: number;
}

export function ClientList({ onNewClient, onEditClient, onViewProjects, onNewProject, refreshTrigger }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const { toast } = useToast();
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClientIdState, setEditingClientIdState] = useState<number | undefined>();
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [projectClientId, setProjectClientId] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<'ativos' | 'inativos' | 'todos'>('todos');

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientesService.listar({
        ativo: statusFilter === 'todos' ? undefined : statusFilter === 'ativos' ? true : false,
        busca: searchTerm || undefined,
        page: currentPage,
        limit: 10
      });
      setClients(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [currentPage, refreshTrigger, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadClients();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset selection when clients change
  useEffect(() => {
    setSelectedClients([]);
    setIsAllSelected(false);
  }, [clients]);

  const handleToggleAtivo = async (clienteId: number, novoStatus: boolean) => {
    try {
      if (!novoStatus) {
        // Desativar cliente
        await clientesService.desativar(clienteId);
        toast({
          title: "Sucesso",
          description: "Cliente desativado com sucesso.",
        });
      } else {
        // Ativar cliente - apenas enviar o campo ativo
        await clientesService.atualizar(clienteId, {
          ativo: true
        });
        toast({
          title: "Sucesso",
          description: "Cliente ativado com sucesso.",
        });
      }
      loadClients();
    } catch (error: any) {
      console.error('Erro ao alterar status do cliente:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      toast({
        title: "Erro",
        description: `Não foi possível alterar o status do cliente: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleExcluirCliente = async (clienteId: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await clientesService.desativar(clienteId, true);
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso.",
      });
      setSelectedClients(prev => prev.filter(id => id !== clienteId));
      loadClients();
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      toast({
        title: "Erro",
        description: `Não foi possível excluir o cliente: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (action: 'ativar' | 'desativar' | 'excluir') => {
    if (selectedClients.length === 0) {
      toast({
        title: "Nenhum cliente selecionado",
        description: "Selecione pelo menos um cliente para executar esta ação.",
        variant: "destructive",
      });
      return;
    }

    const actionText = action === 'ativar' ? 'ativar' :
      action === 'desativar' ? 'desativar' :
        'excluir permanentemente';

    const confirmMessage = action === 'excluir'
      ? `Tem certeza que deseja excluir permanentemente ${selectedClients.length} cliente(s) selecionado(s)? Esta ação não pode ser desfeita!`
      : `Tem certeza que deseja ${actionText} ${selectedClients.length} cliente(s) selecionado(s)?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const promises = selectedClients.map(async (clienteId) => {
        if (action === 'excluir') {
          return clientesService.desativar(clienteId, true); // true para exclusão permanente
        } else if (action === 'desativar') {
          return clientesService.desativar(clienteId);
        } else {
          // Ativar cliente - apenas enviar o campo ativo
          return clientesService.atualizar(clienteId, {
            ativo: true
          });
        }
      });

      await Promise.all(promises);

      const successMessage = action === 'ativar' ? 'ativado(s)' :
        action === 'desativar' ? 'desativado(s)' :
          'excluído(s)';

      toast({
        title: "Sucesso",
        description: `${selectedClients.length} cliente(s) ${successMessage} com sucesso.`,
      });

      setSelectedClients([]);
      setIsAllSelected(false);
      loadClients();
    } catch (error: any) {
      console.error(`Erro ao ${actionText} clientes:`, error);
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      toast({
        title: "Erro",
        description: `Não foi possível ${actionText} alguns clientes: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedClients([]);
      setIsAllSelected(false);
    } else {
      setSelectedClients(filteredClients.map(client => client.id));
      setIsAllSelected(true);
    }
  };

  const handleSelectClient = (clienteId: number) => {
    setSelectedClients(prev => {
      const newSelection = prev.includes(clienteId)
        ? prev.filter(id => id !== clienteId)
        : [...prev, clienteId];

      setIsAllSelected(newSelection.length === filteredClients.length);
      return newSelection;
    });
  };

  const getProjetosText = (count: number) => {
    if (count === 0) return '0 projetos';
    if (count === 1) return '1 projeto';
    return `${count} projetos`;
  };
  const getClientCount = (count: number) => {
    if (count === 0) return '0 clientes';
    if (count === 1) return '1 cliente';
    return `${count} clientes`;
  };

  const handleEditClient = (clientId: number) => {
    setEditingClientIdState(clientId);
    setClientFormOpen(true);
  };

  const handleNewClient = () => {
    setEditingClientIdState(undefined); // Limpar ID para indicar novo cliente
    setClientFormOpen(true);
  };

  const handleNewProject = (clientId: number, clientName: string) => {
    setProjectClientId(clientId);
    setProjectFormOpen(true);
  };


  const handleViewProjects = (clientId: number, clientName: string) => {
    if (onViewProjects) {
      onViewProjects(clientId, clientName);
    } else {
      // Fallback simples - apenas log sem alert
      console.log(`Ver projetos do cliente ${clientName} (ID: ${clientId})`);
    }
  };

  const filteredClients = clients;

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Clientes</h2>
                <p className="text-muted-foreground">Gerencie seus clientes e suas informações</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="status-info w-52 text-center justify-center text-lg">
                Total: {getClientCount(filteredClients.length)}
              </Badge>
            </div>
            <Button
              onClick={handleNewClient}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Novo Cliente
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
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedClients.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {selectedClients.length} selecionado(s)
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      Ações em Lote
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('ativar')}>
                      <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                      Ativar Selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('desativar')}>
                      <Square className="mr-2 h-4 w-4 text-orange-600" />
                      Desativar Selecionados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('excluir')}>
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      Excluir Selecionados
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <div className="flex justify-end w-36">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativos">Ativos</SelectItem>
                  <SelectItem value="inativos">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando clientes...</span>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Projetos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedClients.includes(client.id)}
                        onCheckedChange={() => handleSelectClient(client.id)}
                        aria-label={`Selecionar cliente ${client.nome_empresa || client.nome_completo}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center bg-blue-100 overflow-hidden rounded-lg">
                          {client.foto_url ? (
                            <img
                              src={cloudinaryService.getOptimizedImageUrl(client.foto_url, 40, 40)}
                              alt={client.nome_empresa || client.nome_completo || 'Cliente'}
                              className="w-full h-full object-cover"
                            />
                          ) : client.tipo_pessoa === 'PJ' ? (
                            <Building2 className="h-5 w-5 text-blue-600" />
                          ) : (
                            <User className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {client.nome_empresa || client.nome_completo}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {client.cnpj || client.cpf}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.tipo_pessoa === 'PJ' ? 'default' : 'secondary'} className={client.tipo_pessoa === 'PJ' ? 'status-info' : 'status-soft-green'}>
                        {client.tipo_pessoa === 'PJ' ? 'PJ' : 'PF'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {client.telefone || 'Não informado'}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {client.email || 'Não informado'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {client.cidade && client.uf ? `${client.cidade}, ${client.uf}` : 'Não informado'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="status-pending cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        onClick={() => handleViewProjects(client.id, client.nome_empresa || client.nome_completo || '')}
                        title="Clique para ver projetos"
                      >
                        {getProjetosText(client.projetos_count || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={client.ativo}
                          onCheckedChange={(checked) => handleToggleAtivo(client.id, checked)}
                          aria-label={`${client.ativo ? 'Desativar' : 'Ativar'} cliente`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {client.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-500 text-white cursor-pointer hover:bg-green-600"
                        title="Novo Projeto"
                        onClick={() => handleNewProject(client.id, client.nome_empresa || client.nome_completo || '')}
                      >
                        <FolderPlus className="h-4 w-4" />
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600"
                        title="Editar"
                        onClick={() => handleEditClient(client.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-red-500 text-white cursor-pointer hover:bg-red-600"
                        title="Excluir Cliente"
                        onClick={() => handleExcluirCliente(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal para formulário de cliente */}
      <Dialog open={clientFormOpen} onOpenChange={setClientFormOpen}>
        <DialogContent className="max-w-[70vw] max-h-[90vh] overflow-y-auto p-6">
          <ClientForm
            onClose={() => setClientFormOpen(false)}
            clienteId={editingClientIdState}
            onSuccess={() => {
              setClientFormOpen(false);
              loadClients();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export default para Next.js
export default function ClientsPage() {
  return <ClientList />;
}
