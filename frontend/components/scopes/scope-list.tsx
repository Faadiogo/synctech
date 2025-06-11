import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  FolderTree,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar
} from 'lucide-react';

interface ScopeListProps {
  onNewScope: () => void;
}

interface Scope {
  id: number;
  nome: string;
  projeto_nome: string;
  cliente_nome: string;
  tipo_escopo: string;
  status: string;
  data_inicio?: string;
  data_alvo?: string;
  ordem: number;
}

export function ScopeList({ onNewScope }: ScopeListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const scopes: Scope[] = [
    {
      id: 1,
      nome: 'Interface do Usuário',
      projeto_nome: 'Sistema de Gestão Empresarial',
      cliente_nome: 'TechCorp Solutions',
      tipo_escopo: 'Frontend',
      status: 'em_andamento',
      data_inicio: '2024-01-15',
      data_alvo: '2024-03-20',
      ordem: 1
    },
    {
      id: 2,
      nome: 'API de Integração',
      projeto_nome: 'E-commerce Personalizado',
      cliente_nome: 'Maria Santos',
      tipo_escopo: 'Backend',
      status: 'planejado',
      data_alvo: '2024-04-10',
      ordem: 2
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'planejado': 'status-pending',
      'em_andamento': 'status-info',
      'concluido': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
    return (
      scope.nome.toLowerCase().includes(searchLower) ||
      scope.projeto_nome.toLowerCase().includes(searchLower) ||
      scope.cliente_nome.toLowerCase().includes(searchLower) ||
      scope.tipo_escopo.toLowerCase().includes(searchLower)
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
                <FolderTree className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Escopo Funcional</h2>
                <p className="text-muted-foreground">Gerencie os escopos funcionais dos projetos, organizando funcionalidades e entregas.</p>
              </div>
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
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar escopos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="status-info">
                Total: {filteredScopes.length} Escopos
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredScopes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto/Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Açoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScopes.map((scope) => (
                  <TableRow key={scope.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div>
                        <div className="font-medium">{scope.projeto_nome}</div>
                        <div className="text-sm text-muted-foreground">{scope.cliente_nome}</div>
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
                      <Badge variant="outline" className="bg-blue-500 text-white" title="Visualizar" onClick={() => {}}><Eye className="h-4 w-4" /></Badge>
                      <Badge variant="outline" className="bg-yellow-500 text-white" title="Editar" onClick={() => {}}><Edit className="h-4 w-4" /></Badge>
                      <Badge variant="outline" className="bg-red-500 text-white" title="Excluir" onClick={() => {}}><Trash2 className="h-4 w-4" /></Badge>
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
              <div className="text-lg font-semibold text-gray-700">
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