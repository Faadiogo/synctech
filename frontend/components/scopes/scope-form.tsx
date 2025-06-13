'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/scopes/ui/card';
import { Button } from '@/components/scopes/ui/button';
import { Input } from '@/components/scopes/ui/input';
import { Label } from '@/components/scopes/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/scopes/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/scopes/ui/dropdown-menu';
import { 
  ArrowLeft, 
  Save, 
  FolderTree, 
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Code,
  Palette,
  Zap,
  Monitor,
  Database,
  Users,
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';

interface ScopeFormProps {
  onClose: () => void;
}

interface ScopeItem {
  id: string;
  type: 'escopo' | 'funcionalidade' | 'subfuncionalidade' | 'subitem';
  nome: string;
  descricao?: string;
  icon: string;
  data_inicio?: string;
  data_alvo?: string;
  status: string;
  ordem: number;
  expanded: boolean;
  children: ScopeItem[];
  parent_id?: string;
}

const iconOptions = [
  { value: 'FolderTree', icon: FolderTree },
  { value: 'Code', icon: Code },
  { value: 'Palette', icon: Palette },
  { value: 'Settings', icon: Settings },
  { value: 'Zap', icon: Zap },
  { value: 'Monitor', icon: Monitor },
  { value: 'Database', icon: Database },
  { value: 'Users', icon: Users },
];

const getIconComponent = (iconName: string) => {
  const iconOption = iconOptions.find(opt => opt.value === iconName);
  return iconOption ? iconOption.icon : FolderTree;
};

export function ScopeForm({ onClose }: ScopeFormProps) {
  const [selectedProject, setSelectedProject] = useState('');

  // Estados para o editor hierárquico
  const [scopeData, setScopeData] = useState<ScopeItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [selectedScopeType, setSelectedScopeType] = useState('');

  // Mock data para projetos e tipos de escopo
  const projetos = [
    { id: '1', nome: 'Sistema de Gestão Empresarial', cliente: 'TechCorp Solutions' },
    { id: '2', nome: 'E-commerce Personalizado', cliente: 'Maria Santos' }
  ];
  
  const tiposEscopo = [
    { id: '1', nome: 'Frontend' },
    { id: '2', nome: 'Backend' },
    { id: '3', nome: 'Integrações' },
    { id: '4', nome: 'Automações' },
    { id: '5', nome: 'Design' }
  ];

  // Funções do editor hierárquico
  const addNewItem = (parentId?: string, type: ScopeItem['type'] = 'funcionalidade') => {
    if (type === 'escopo' && !selectedScopeType) return;
    if (type !== 'escopo' && !newItemName.trim()) return;

    const tipoSelecionado = tiposEscopo.find(t => t.id === selectedScopeType);
    const nome = type === 'escopo' ? tipoSelecionado?.nome || '' : newItemName;

    const newItem: ScopeItem = {
      id: Date.now().toString(),
      type,
      nome,
      icon: 'FolderTree',
      status: 'planejado',
      ordem: 1,
      expanded: false,
      children: [],
      parent_id: parentId
    };

    if (parentId) {
      setScopeData(prev => updateItemChildren(prev, parentId, newItem));
    } else {
      setScopeData(prev => [...prev, newItem]);
    }

    setNewItemName('');
    setSelectedScopeType('');
    setEditingItem(null);
  };

  const updateItemChildren = (items: ScopeItem[], parentId: string, newChild: ScopeItem): ScopeItem[] => {
    return items.map(item => {
      if (item.id === parentId) {
        return { ...item, children: [...item.children, newChild] };
      }
      return { ...item, children: updateItemChildren(item.children, parentId, newChild) };
    });
  };

  const toggleExpanded = (itemId: string) => {
    setScopeData(prev => toggleItemExpanded(prev, itemId));
  };

  const toggleItemExpanded = (items: ScopeItem[], itemId: string): ScopeItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, expanded: !item.expanded };
      }
      return { ...item, children: toggleItemExpanded(item.children, itemId) };
    });
  };

  const updateItemIcon = (itemId: string, newIcon: string) => {
    setScopeData(prev => updateItemProperty(prev, itemId, 'icon', newIcon));
  };

  const updateItemProperty = (items: ScopeItem[], itemId: string, property: keyof ScopeItem, value: any): ScopeItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, [property]: value };
      }
      return { ...item, children: updateItemProperty(item.children, itemId, property, value) };
    });
  };

  const removeItem = (itemId: string) => {
    setScopeData(prev => removeItemById(prev, itemId));
  };

  const removeItemById = (items: ScopeItem[], itemId: string): ScopeItem[] => {
    return items.filter(item => item.id !== itemId).map(item => ({
      ...item,
      children: removeItemById(item.children, itemId)
    }));
  };

  const renderScopeItem = (item: ScopeItem, level: number = 0) => {
    const IconComponent = getIconComponent(item.icon);
    const hasChildren = item.children.length > 0;
    const canHaveChildren = item.type !== 'subitem';

    return (
      <div key={item.id} className="space-y-2">
        <div 
          className={`flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors`}
          style={{ marginLeft: level * 24 }}
        >
          {/* Expand/Collapse Button */}
          {canHaveChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleExpanded(item.id)}
            >
              {hasChildren ? (
                item.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Icon Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <IconComponent className="h-4 w-4 text-blue-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {iconOptions.map(iconOpt => {
                const Icon = iconOpt.icon;
                return (
                  <DropdownMenuItem
                    key={iconOpt.value}
                    onClick={() => updateItemIcon(item.id, iconOpt.value)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Item Name */}
          <div className="flex-1">
            <div className="font-medium text-sm">{item.nome}</div>
            {item.type && (
              <div className="text-xs text-muted-foreground capitalize">
                {item.type.replace('_', ' ')}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={item.data_inicio || ''}
              onChange={(e) => updateItemProperty([item], item.id, 'data_inicio', e.target.value)}
              className="w-32 h-8 text-xs"
              placeholder="Início"
            />
            <Input
              type="date"
              value={item.data_alvo || ''}
              onChange={(e) => updateItemProperty([item], item.id, 'data_alvo', e.target.value)}
              className="w-32 h-8 text-xs"
              placeholder="Fim"
            />
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canHaveChildren && item.type !== 'subitem' && (
                <>
                  <DropdownMenuItem onClick={() => setEditingItem(item.id + '-funcionalidade')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar {item.type === 'escopo' ? 'Funcionalidade' : item.type === 'funcionalidade' ? 'Subfuncionalidade' : 'Subitem'}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => removeItem(item.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Add New Item Form */}
        {editingItem === item.id + '-funcionalidade' && (
          <div className="ml-8 p-3 border border-dashed border-border/50 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nome do item..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const nextType = item.type === 'escopo' ? 'funcionalidade' : 
                                   item.type === 'funcionalidade' ? 'subfuncionalidade' : 'subitem';
                    addNewItem(item.id, nextType);
                  }
                  if (e.key === 'Escape') {
                    setEditingItem(null);
                    setNewItemName('');
                  }
                }}
                autoFocus
              />
              <Button 
                size="sm"
                onClick={() => {
                  const nextType = item.type === 'escopo' ? 'funcionalidade' : 
                                 item.type === 'funcionalidade' ? 'subfuncionalidade' : 'subitem';
                  addNewItem(item.id, nextType);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEditingItem(null);
                  setNewItemName('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Children */}
        {item.expanded && item.children.map(child => renderScopeItem(child, level + 1))}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      alert('Por favor, selecione um projeto');
      return;
    }
    console.log('Projeto selecionado:', selectedProject);
    console.log('Estrutura hierárquica:', scopeData);
    onClose();
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <FolderTree className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Novo Escopo Funcional</h2>
                <p className="text-muted-foreground">Selecione um projeto e organize sua estrutura hierárquica</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seleção de Projeto */}
        <Card className="tech-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              Configuração do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="projeto_id">Projeto *</Label>
              <Select 
                value={selectedProject} 
                onValueChange={setSelectedProject}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projetos.map(projeto => (
                    <SelectItem key={projeto.id} value={projeto.id}>
                      {projeto.nome} - {projeto.cliente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Editor Hierárquico */}
        {selectedProject && (
          <Card className="tech-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <FolderTree className="h-5 w-5 text-green-400" />
                  </div>
                  Estrutura Hierárquica
                </CardTitle>
                <Button 
                  type="button"
                  onClick={() => setEditingItem('root')}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Escopo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Root Item */}
              {editingItem === 'root' && (
                <div className="p-4 border border-dashed border-border/50 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Select 
                      value={selectedScopeType} 
                      onValueChange={setSelectedScopeType}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione o tipo de escopo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEscopo.map(tipo => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {tipo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => addNewItem(undefined, 'escopo')}
                      disabled={!selectedScopeType}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingItem(null);
                        setSelectedScopeType('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Scope Items */}
              <div className="space-y-2">
                {scopeData.map(item => renderScopeItem(item))}
              </div>

              {scopeData.length === 0 && !editingItem && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 mb-2 border border-blue-100">
                    <FolderTree className="h-8 w-8 text-blue-600" />
                  </div>
                                  <div className="text-lg font-semibold text-gray-700">Estrutura hierárquica vazia</div>
                <div className="text-muted-foreground max-w-md">
                  Clique em "Adicionar Escopo" para começar criando um tipo de escopo (Frontend, Backend, etc.).
                </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botões de ação */}
        <Card className="tech-card">
          <CardContent className="pt-6">
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4" />
                Salvar Escopo Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 