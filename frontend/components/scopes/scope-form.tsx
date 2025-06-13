'use client';

import { useState, useEffect } from 'react';
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
  Edit,
  Loader2,
  FileText,
  Calendar,
  Smartphone,
  Globe,
  Shield,
  Cloud,
  Cpu,
  Layers,
  Terminal,
  Briefcase,
  Target,
  Lock,
  Wifi,
  Server,
  HardDrive,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Search,
  Bell,
  Mail,
  MessageSquare,
  Camera,
  Image,
  Video,
  Music,
  Download,
  Upload,
  Share,
  Star,
  Heart,
  ThumbsUp,
  CheckCircle
} from 'lucide-react';
import { projetosSupabaseService } from '@/lib/services/projetos-supabase';
import { escoposSupabaseService } from '@/lib/services/escopos-supabase';
import { tiposEscopoSupabaseService, TipoEscopo } from '@/lib/services/tipos-escopo-supabase';
import { nivel1SupabaseService } from '@/lib/services/nivel1-supabase';
import { funcionalidadesSupabaseService } from '@/lib/services/funcionalidades-supabase';
import { subfuncionalidadesSupabaseService } from '@/lib/services/subfuncionalidades-supabase';
import { subitensSupabaseService } from '@/lib/services/subitens-supabase';
import { useToast } from '@/hooks/use-toast';

interface ScopeFormProps {
  onClose: () => void;
  scopeId?: number;
  onSuccess?: () => void;
  prefilledData?: {
    projectId: number;
    projectName: string;
    clienteName: string;
    valorOrcamento?: number;
  } | null;
}

interface ScopeItem {
  id: string;
  type: 'escopo' | 'funcionalidade' | 'subfuncionalidade' | 'subitem';
  nome: string;
  descricao?: string;
  icon: string;
  iconColor?: string;
  data_inicio?: string;
  data_alvo?: string;
  status: string;
  ordem: number;
  expanded: boolean;
  children: ScopeItem[];
  parent_id?: string;
}

interface Projeto {
  id: number;
  nome: string;
  cliente_nome?: string;
}

const iconOptions = [
  { value: 'FolderTree', icon: FolderTree, category: 'General' },
  { value: 'Code', icon: Code, category: 'Development' },
  { value: 'Palette', icon: Palette, category: 'Design' },
  { value: 'Settings', icon: Settings, category: 'System' },
  { value: 'Zap', icon: Zap, category: 'System' },
  { value: 'Monitor', icon: Monitor, category: 'Device' },
  { value: 'Database', icon: Database, category: 'Data' },
  { value: 'Users', icon: Users, category: 'People' },
  { value: 'FileText', icon: FileText, category: 'Files' },
  { value: 'Save', icon: Save, category: 'Actions' },
  { value: 'Edit', icon: Edit, category: 'Actions' },
  { value: 'Plus', icon: Plus, category: 'Actions' },
  { value: 'Smartphone', icon: Smartphone, category: 'Device' },
  { value: 'Globe', icon: Globe, category: 'Network' },
  { value: 'Shield', icon: Shield, category: 'Security' },
  { value: 'Cloud', icon: Cloud, category: 'Network' },
  { value: 'Cpu', icon: Cpu, category: 'System' },
  { value: 'Layers', icon: Layers, category: 'Structure' },
  { value: 'Terminal', icon: Terminal, category: 'Development' },
  { value: 'Briefcase', icon: Briefcase, category: 'Business' },
  { value: 'Target', icon: Target, category: 'Goals' },
  { value: 'Lock', icon: Lock, category: 'Security' },
  { value: 'Wifi', icon: Wifi, category: 'Network' },
  { value: 'Server', icon: Server, category: 'Infrastructure' },
  { value: 'HardDrive', icon: HardDrive, category: 'Data' },
  { value: 'Activity', icon: Activity, category: 'Analytics' },
  { value: 'BarChart3', icon: BarChart3, category: 'Analytics' },
  { value: 'PieChart', icon: PieChart, category: 'Analytics' },
  { value: 'TrendingUp', icon: TrendingUp, category: 'Analytics' },
  { value: 'Search', icon: Search, category: 'Actions' },
  { value: 'Bell', icon: Bell, category: 'Communication' },
  { value: 'Mail', icon: Mail, category: 'Communication' },
  { value: 'MessageSquare', icon: MessageSquare, category: 'Communication' },
  { value: 'Camera', icon: Camera, category: 'Media' },
  { value: 'Image', icon: Image, category: 'Media' },
  { value: 'Video', icon: Video, category: 'Media' },
  { value: 'Music', icon: Music, category: 'Media' },
  { value: 'Download', icon: Download, category: 'Transfer' },
  { value: 'Upload', icon: Upload, category: 'Transfer' },
  { value: 'Share', icon: Share, category: 'Transfer' },
  { value: 'Star', icon: Star, category: 'Rating' },
  { value: 'Heart', icon: Heart, category: 'Rating' },
  { value: 'ThumbsUp', icon: ThumbsUp, category: 'Rating' },
  { value: 'CheckCircle', icon: CheckCircle, category: 'Status' },
];

const getIconComponent = (iconName: string) => {
  const iconOption = iconOptions.find(opt => opt.value === iconName);
  return iconOption ? iconOption.icon : FolderTree;
};

export function ScopeForm({ onClose, scopeId, onSuccess, prefilledData }: ScopeFormProps) {
  const [selectedProject, setSelectedProject] = useState('');
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [tiposEscopo, setTiposEscopo] = useState<TipoEscopo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  // Estados para o editor hierárquico
  const [scopeData, setScopeData] = useState<ScopeItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [selectedScopeType, setSelectedScopeType] = useState('');
  const [editingDatesItem, setEditingDatesItem] = useState<string | null>(null);
  const [editingNameItem, setEditingNameItem] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
    if (scopeId) {
      loadScopeData();
    }
  }, [scopeId]);

  // Pré-preencher projeto quando prefilledData estiver disponível
  useEffect(() => {
    if (prefilledData && !scopeId) {
      setSelectedProject(prefilledData.projectId.toString());
    }
  }, [prefilledData, scopeId]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [projetosResponse, tiposResponse] = await Promise.all([
        projetosSupabaseService.listar({ limit: 100 }),
        tiposEscopoSupabaseService.listar()
      ]);
      setProjetos(projetosResponse.data);
      setTiposEscopo(tiposResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados. Verifique se o backend está rodando.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadScopeData = async () => {
    if (!scopeId) return;
    
    try {
      const response = await escoposSupabaseService.buscarPorId(scopeId);
      const scope = response.data;
      
      setSelectedProject(scope.projeto_id.toString());
      // TODO: Implementar carregamento da estrutura hierárquica quando backend suportar
      
    } catch (error) {
      console.error('Erro ao carregar escopo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do escopo.",
        variant: "destructive",
      });
    }
  };

  // Função para adicionar novo item hierárquico
  const addNewItem = (parentId?: string, type: ScopeItem['type'] = 'funcionalidade') => {
    if (type === 'escopo' && !selectedScopeType) return;
    if (type !== 'escopo' && !newItemName.trim()) return;

    const tipoSelecionado = tiposEscopo.find(t => t.id.toString() === selectedScopeType);
    const nome = type === 'escopo' ? (tipoSelecionado?.nome || '') : newItemName.trim();
    
    // Definir ícone e cor baseados no tipo
    let defaultIcon = 'FolderTree';
    let defaultColor = '#6B7280';

    if (type === 'escopo' && tipoSelecionado) {
      defaultIcon = tipoSelecionado.icon_name || 'FolderTree';
      defaultColor = tipoSelecionado.cor_hex || '#6B7280';
    } else if (parentId) {
      // Para filhos, herdar ícone e cor do pai
      const parentItem = findItemById(scopeData, parentId);
      if (parentItem) {
        defaultIcon = parentItem.icon;
        defaultColor = parentItem.iconColor || '#6B7280';
      }
    }

    const newItem: ScopeItem = {
      id: Date.now().toString(),
      type,
      nome,
      icon: defaultIcon,
      iconColor: defaultColor,
      status: 'planejado',
      ordem: 1,
      expanded: true,
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

  // Função para adicionar novo item com datas
  const addNewItemWithDates = (parentId?: string, type: ScopeItem['type'] = 'funcionalidade', dataInicio?: string, dataAlvo?: string) => {
    if (type === 'escopo' && !selectedScopeType) return;
    if (type !== 'escopo' && !newItemName.trim()) return;

    const tipoSelecionado = tiposEscopo.find(t => t.id.toString() === selectedScopeType);
    const nome = type === 'escopo' ? (tipoSelecionado?.nome || '') : newItemName.trim();
    
    // Definir ícone e cor baseados no tipo
    let defaultIcon = 'FolderTree';
    let defaultColor = '#6B7280';

    if (type === 'escopo' && tipoSelecionado) {
      defaultIcon = tipoSelecionado.icon_name || 'FolderTree';
      defaultColor = tipoSelecionado.cor_hex || '#6B7280';
    } else if (parentId) {
      // Para filhos, herdar ícone e cor do pai
      const parentItem = findItemById(scopeData, parentId);
      if (parentItem) {
        defaultIcon = parentItem.icon;
        defaultColor = parentItem.iconColor || '#6B7280';
      }
    }

    const newItem: ScopeItem = {
      id: Date.now().toString(),
      type,
      nome,
      icon: defaultIcon,
      iconColor: defaultColor,
      data_inicio: dataInicio || undefined,
      data_alvo: dataAlvo || undefined,
      status: 'planejado',
      ordem: 1,
      expanded: true,
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

  // Função para atualizar nome do item
  const updateItemName = (itemId: string, newName: string) => {
    setScopeData(prev => updateItemNameRecursive(prev, itemId, newName));
    setEditingNameItem(null);
  };

  const updateItemNameRecursive = (items: ScopeItem[], itemId: string, newName: string): ScopeItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, nome: newName };
      }
      return { ...item, children: updateItemNameRecursive(item.children, itemId, newName) };
    });
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

  const removeItem = (itemId: string) => {
    const item = findItemById(scopeData, itemId);
    if (!item) return;

    const hasChildren = item.children && item.children.length > 0;
    const childrenCount = countAllChildren(item);
    
    let confirmMessage = `Tem certeza que deseja excluir "${item.nome}"?`;
    
    if (hasChildren) {
      confirmMessage += `\n\nEsta ação também excluirá ${childrenCount} item(s) filho(s).`;
    }

    if (confirm(confirmMessage)) {
      setScopeData(prev => removeItemById(prev, itemId));
    }
  };

  const removeItemById = (items: ScopeItem[], itemId: string): ScopeItem[] => {
    return items.filter(item => item.id !== itemId).map(item => ({
      ...item,
      children: removeItemById(item.children, itemId)
    }));
  };

  const updateItemDates = (itemId: string, dataInicio: string, dataAlvo: string) => {
    setScopeData(prev => updateItemDatesRecursive(prev, itemId, dataInicio, dataAlvo));
    setEditingDatesItem(null);
  };

  const updateItemDatesRecursive = (items: ScopeItem[], itemId: string, dataInicio: string, dataAlvo: string): ScopeItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          data_inicio: dataInicio || undefined, 
          data_alvo: dataAlvo || undefined 
        };
      }
      return { ...item, children: updateItemDatesRecursive(item.children, itemId, dataInicio, dataAlvo) };
    });
  };

  // Função para validar se data alvo é maior ou igual à data início
  const validateDates = (dataInicio: string, dataAlvo: string): boolean => {
    if (!dataInicio || !dataAlvo) return true; // Se alguma data estiver vazia, não valida
    return new Date(dataAlvo) >= new Date(dataInicio);
  };

  const findItemById = (items: ScopeItem[], itemId: string): ScopeItem | null => {
    for (const item of items) {
      if (item.id === itemId) {
        return item;
      }
      const found = findItemById(item.children, itemId);
      if (found) {
        return found;
      }
    }
    return null;
  };

  const countAllChildren = (item: ScopeItem): number => {
    let count = item.children.length;
    for (const child of item.children) {
      count += countAllChildren(child);
    }
    return count;
  };

  const getAvailableScopeTypes = () => {
    const usedTypes = scopeData
      .filter(item => item.type === 'escopo')
      .map(item => item.nome.toLowerCase());
    
    return tiposEscopo.filter(tipo => 
      !usedTypes.includes(tipo.nome.toLowerCase())
    );
  };

  const renderScopeItem = (item: ScopeItem, level: number = 0) => {
    const IconComponent = getIconComponent(item.icon);
    const hasChildren = item.children.length > 0;
    const canHaveChildren = item.type !== 'subitem';

    const hierarchyStyles = {
      marginLeft: level * 32,
      fontSize: level === 0 ? 'text-base' : 'text-sm',
      fontWeight: level === 0 ? 'font-bold' : level === 1 ? 'font-semibold' : 'font-medium'
    };

    return (
      <div key={item.id} className="space-y-2">
        <div 
          className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
          style={{ 
            marginLeft: hierarchyStyles.marginLeft,
            backgroundColor: item.iconColor ? `${item.iconColor}10` : 'transparent'
          }}
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

          {/* Icon */}
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.iconColor}20` }}>
            <IconComponent 
              className="h-4 w-4" 
              style={{ color: item.iconColor || '#6B7280' }}
            />
          </div>

          {/* Item Name and Dates */}
          <div className="flex-1">
            {/* Nome editável */}
            {editingNameItem === item.id ? (
              <div className="space-y-2">
                <Input
                  defaultValue={item.nome}
                  className="text-sm font-medium"
                  id={`edit-name-${item.id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const newName = (document.getElementById(`edit-name-${item.id}`) as HTMLInputElement)?.value || '';
                      updateItemName(item.id, newName);
                    }
                    if (e.key === 'Escape') {
                      setEditingNameItem(null);
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      const newName = (document.getElementById(`edit-name-${item.id}`) as HTMLInputElement)?.value || '';
                      updateItemName(item.id, newName);
                    }}
                  >
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setEditingNameItem(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className={`${hierarchyStyles.fontSize} ${hierarchyStyles.fontWeight}`}
                style={{ color: item.iconColor || '#374151' }}
              >
                {item.nome}
              </div>
            )}            
            {/* Dates Display/Edit */}
            {!editingNameItem && (editingDatesItem === item.id ? (
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Data Início</Label>
                    <Input
                      type="date"
                      defaultValue={item.data_inicio}
                      className="h-7 text-xs"
                      id={`data-inicio-${item.id}`}
                      onChange={(e) => {
                        const dataAlvo = (document.getElementById(`data-alvo-${item.id}`) as HTMLInputElement)?.value || '';
                        if (dataAlvo && !validateDates(e.target.value, dataAlvo)) {
                          e.target.setCustomValidity('Data de início deve ser menor ou igual à data alvo');
                        } else {
                          e.target.setCustomValidity('');
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Data Alvo</Label>
                    <Input
                      type="date"
                      defaultValue={item.data_alvo}
                      className="h-7 text-xs"
                      id={`data-alvo-${item.id}`}
                      onChange={(e) => {
                        const dataInicio = (document.getElementById(`data-inicio-${item.id}`) as HTMLInputElement)?.value || '';
                        if (dataInicio && !validateDates(dataInicio, e.target.value)) {
                          e.target.setCustomValidity('Data alvo deve ser maior ou igual à data de início');
                        } else {
                          e.target.setCustomValidity('');
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      const dataInicio = (document.getElementById(`data-inicio-${item.id}`) as HTMLInputElement)?.value || '';
                      const dataAlvo = (document.getElementById(`data-alvo-${item.id}`) as HTMLInputElement)?.value || '';
                      
                      if (!validateDates(dataInicio, dataAlvo)) {
                        toast({
                          title: "Erro de Validação",
                          description: "A data alvo deve ser maior ou igual à data de início.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      updateItemDates(item.id, dataInicio, dataAlvo);
                    }}
                  >
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setEditingDatesItem(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Início: {item.data_inicio ? new Date(item.data_inicio).toLocaleDateString('pt-BR') : 'Não definida'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Alvo: {item.data_alvo ? new Date(item.data_alvo).toLocaleDateString('pt-BR') : 'Não definida'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
              onClick={() => setEditingNameItem(editingNameItem === item.id ? null : item.id)}
              title="Editar nome"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
              onClick={() => setEditingDatesItem(editingDatesItem === item.id ? null : item.id)}
              title="Editar datas"
            >
              <Calendar className="h-3 w-3" />
            </Button>
            {canHaveChildren && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 bg-green-500 hover:bg-green-600 text-white border-green-500"
                onClick={() => setEditingItem(item.id + '-child')}
                title={`Adicionar ${getNextLevelName(item.type)}`}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
              onClick={() => removeItem(item.id)}
              title="Remover"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Add New Item Form */}
        {editingItem === item.id + '-child' && (
          <div 
            className="p-3 border border-dashed border-border/50 rounded-lg bg-muted/30"
            style={{ marginLeft: hierarchyStyles.marginLeft + 32 }}
          >
            <div className="space-y-3">
              {/* Nome e Datas na mesma linha */}
              <div className="grid grid-cols-4 gap-2 items-end">
                <div className="col-span-2">
                  <Label className="text-xs">Nome do {getNextLevelName(item.type)}</Label>
                  <Input
                    placeholder={`Nome do ${getNextLevelName(item.type).toLowerCase()}...`}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const dataInicio = (document.getElementById(`new-data-inicio-${item.id}`) as HTMLInputElement)?.value || '';
                        const dataAlvo = (document.getElementById(`new-data-alvo-${item.id}`) as HTMLInputElement)?.value || '';
                        
                        if (!validateDates(dataInicio, dataAlvo)) {
                          toast({
                            title: "Erro de Validação",
                            description: "A data alvo deve ser maior ou igual à data de início.",
                            variant: "destructive",
                          });
                          return;
                        }
                        
                        addNewItemWithDates(item.id, getNextLevelType(item.type), dataInicio, dataAlvo);
                      }
                      if (e.key === 'Escape') {
                        setEditingItem(null);
                        setNewItemName('');
                      }
                    }}
                    className="h-9"
                    autoFocus
                  />
                </div>
                <div>
                  <Label className="text-xs">Data Início</Label>
                  <Input
                    type="date"
                    className="h-9 text-xs"
                    id={`new-data-inicio-${item.id}`}
                    onChange={(e) => {
                      const dataAlvo = (document.getElementById(`new-data-alvo-${item.id}`) as HTMLInputElement)?.value || '';
                      if (dataAlvo && !validateDates(e.target.value, dataAlvo)) {
                        e.target.setCustomValidity('Data de início deve ser menor ou igual à data alvo');
                      } else {
                        e.target.setCustomValidity('');
                      }
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Data Alvo</Label>
                  <Input
                    type="date"
                    className="h-9 text-xs"
                    id={`new-data-alvo-${item.id}`}
                    onChange={(e) => {
                      const dataInicio = (document.getElementById(`new-data-inicio-${item.id}`) as HTMLInputElement)?.value || '';
                      if (dataInicio && !validateDates(dataInicio, e.target.value)) {
                        e.target.setCustomValidity('Data alvo deve ser maior ou igual à data de início');
                      } else {
                        e.target.setCustomValidity('');
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={() => {
                    const dataInicio = (document.getElementById(`new-data-inicio-${item.id}`) as HTMLInputElement)?.value || '';
                    const dataAlvo = (document.getElementById(`new-data-alvo-${item.id}`) as HTMLInputElement)?.value || '';
                    
                    if (!validateDates(dataInicio, dataAlvo)) {
                      toast({
                        title: "Erro de Validação",
                        description: "A data alvo deve ser maior ou igual à data de início.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    addNewItemWithDates(item.id, getNextLevelType(item.type), dataInicio, dataAlvo);
                  }}
                  disabled={!newItemName.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
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
          </div>
        )}

        {/* Children */}
        {item.expanded && item.children.map(child => renderScopeItem(child, level + 1))}
      </div>
    );
  };

  const getNextLevelType = (currentType: ScopeItem['type']): ScopeItem['type'] => {
    switch (currentType) {
      case 'escopo': return 'funcionalidade';
      case 'funcionalidade': return 'subfuncionalidade';
      case 'subfuncionalidade': return 'subitem';
      default: return 'subitem';
    }
  };

  const getNextLevelName = (currentType: ScopeItem['type']): string => {
    switch (currentType) {
      case 'escopo': return 'Funcionalidade';
      case 'funcionalidade': return 'Subfuncionalidade';
      case 'subfuncionalidade': return 'Subitem';
      default: return 'Item';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um projeto.",
        variant: "destructive",
      });
      return;
    }

    if (scopeData.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um escopo.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Salvar a estrutura hierárquica
      await saveHierarchy(scopeData);
      
      toast({
        title: "Sucesso",
        description: `Escopo ${scopeId ? 'atualizado' : 'criado'} com sucesso!`,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar escopo:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro",
        description: `Não foi possível salvar o escopo: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveHierarchy = async (items: ScopeItem[], parentId?: number, parentType?: string) => {
    for (const item of items) {
      let savedItem;
      
      if (item.type === 'escopo') {
        // Criar/atualizar escopo funcional
        const escopoData = {
          projeto_id: parseInt(selectedProject),
          nome: item.nome,
          descricao: item.descricao || '',
          status: item.status as 'planejado' | 'em_andamento' | 'concluido' | 'cancelado',
          ordem: item.ordem,
          data_inicio: item.data_inicio || undefined,
          data_alvo: item.data_alvo || undefined
        };
        
        if (scopeId && items.indexOf(item) === 0) {
          // Editar escopo existente (apenas o primeiro)
          savedItem = await escoposSupabaseService.atualizar(scopeId, escopoData);
          savedItem.data.id = scopeId;
        } else {
          // Criar novo escopo
          savedItem = await escoposSupabaseService.criar(escopoData);
        }

        // Criar nivel1 associado ao escopo funcional
        const tipoEscopo = tiposEscopo.find(t => t.nome === item.nome);
        if (tipoEscopo && savedItem) {
          const nivel1Data = {
            escopo_funcional_id: savedItem.data.id,
            nivel1_tipo_id: tipoEscopo.id,
            nome: item.nome,
            descricao: item.descricao || '',
            status: item.status as 'planejado' | 'em_andamento' | 'concluido' | 'cancelado',
            ordem: item.ordem,
            data_inicio: item.data_inicio || undefined,
            data_alvo: item.data_alvo || undefined
          };
          const nivel1Response = await nivel1SupabaseService.criar(nivel1Data);
          
          // Se tem filhos, usar o nivel1 como parent
          if (item.children.length > 0) {
            await saveHierarchy(item.children, nivel1Response.data.id, 'nivel1');
          }
        }
      } else if (item.type === 'funcionalidade') {
        // Criar funcionalidade (nivel2)
        const funcionalidadeData = {
          nivel1_id: parentId!,
          nome: item.nome,
          descricao: item.descricao || '',
          status: item.status as 'planejado' | 'em_andamento' | 'concluido' | 'cancelado',
          ordem: item.ordem,
          data_inicio: item.data_inicio || undefined,
          data_alvo: item.data_alvo || undefined
        };
        savedItem = await funcionalidadesSupabaseService.criar(funcionalidadeData);
        
        // Se tem filhos, salvar recursivamente
        if (item.children.length > 0 && savedItem) {
          await saveHierarchy(item.children, savedItem.data.id, 'nivel2');
        }
      } else if (item.type === 'subfuncionalidade') {
        // Criar subfuncionalidade (nivel3)
        const subfuncionalidadeData = {
          nivel2_id: parentId!,
          nome: item.nome,
          descricao: item.descricao || '',
          status: item.status as 'planejado' | 'em_andamento' | 'concluido' | 'cancelado',
          ordem: item.ordem,
          data_inicio: item.data_inicio || undefined,
          data_alvo: item.data_alvo || undefined
        };
        savedItem = await subfuncionalidadesSupabaseService.criar(subfuncionalidadeData);
        
        // Se tem filhos, salvar recursivamente
        if (item.children.length > 0 && savedItem) {
          await saveHierarchy(item.children, savedItem.data.id, 'nivel3');
        }
      } else if (item.type === 'subitem') {
        // Criar subitem (nivel4)
        const subitemData = {
          nivel3_id: parentId!,
          nome: item.nome,
          descricao: item.descricao || '',
          status: item.status as 'planejado' | 'em_andamento' | 'concluido' | 'cancelado',
          ordem: item.ordem,
          data_inicio: item.data_inicio || undefined,
          data_alvo: item.data_alvo || undefined
        };
        savedItem = await subitensSupabaseService.criar(subitemData);
      }
    }
  };

  const getProjetoLabel = (projeto: Projeto) => {
    return `${projeto.nome}`;
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

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
                <h2 className="text-3xl font-bold">{scopeId ? 'Editar' : 'Novo'} Escopo Funcional</h2>
                <p className="text-muted-foreground">Organize a estrutura hierárquica do projeto</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações do Orçamento (se vem pré-preenchido) */}
        {prefilledData && (
          <Card className="tech-card border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                Criando Escopo para Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-green-700">Projeto</Label>
                  <p className="text-sm font-semibold">{prefilledData.projectName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-green-700">Cliente</Label>
                  <p className="text-sm font-semibold">{prefilledData.clienteName}</p>
                </div>
                {prefilledData.valorOrcamento && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-green-700">Valor do Orçamento</Label>
                    <p className="text-sm font-semibold text-green-600">
                      R$ {prefilledData.valorOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                disabled={!!prefilledData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projetos.map(projeto => (
                    <SelectItem key={projeto.id} value={projeto.id.toString()}>
                      {getProjetoLabel(projeto)}
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
                  disabled={getAvailableScopeTypes().length === 0}
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
                  <div className="space-y-3">
                    {/* Tipo de escopo e datas na mesma linha */}
                    <div className="grid grid-cols-3 gap-2 items-end">
                      <div>
                        <Label className="text-xs">Tipo de Escopo</Label>
                        <Select 
                          value={selectedScopeType} 
                          onValueChange={setSelectedScopeType}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione o tipo..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableScopeTypes().map(tipo => {
                              const TipoIcon = getIconComponent(tipo.icon_name || 'FolderTree');
                              return (
                                <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <TipoIcon 
                                      className="h-4 w-4" 
                                      style={{ color: tipo.cor_hex || '#6B7280' }}
                                    />
                                    <span style={{ color: tipo.cor_hex || '#374151' }}>
                                      {tipo.nome}
                                    </span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Data Início</Label>
                        <Input
                          type="date"
                          className="h-9 text-xs"
                          id="root-data-inicio"
                          onChange={(e) => {
                            const dataAlvo = (document.getElementById('root-data-alvo') as HTMLInputElement)?.value || '';
                            if (dataAlvo && !validateDates(e.target.value, dataAlvo)) {
                              e.target.setCustomValidity('Data de início deve ser menor ou igual à data alvo');
                            } else {
                              e.target.setCustomValidity('');
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Data Alvo</Label>
                        <Input
                          type="date"
                          className="h-9 text-xs"
                          id="root-data-alvo"
                          onChange={(e) => {
                            const dataInicio = (document.getElementById('root-data-inicio') as HTMLInputElement)?.value || '';
                            if (dataInicio && !validateDates(dataInicio, e.target.value)) {
                              e.target.setCustomValidity('Data alvo deve ser maior ou igual à data de início');
                            } else {
                              e.target.setCustomValidity('');
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        size="sm"
                        onClick={() => {
                          const dataInicio = (document.getElementById('root-data-inicio') as HTMLInputElement)?.value || '';
                          const dataAlvo = (document.getElementById('root-data-alvo') as HTMLInputElement)?.value || '';
                          
                          if (!validateDates(dataInicio, dataAlvo)) {
                            toast({
                              title: "Erro de Validação",
                              description: "A data alvo deve ser maior ou igual à data de início.",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          addNewItemWithDates(undefined, 'escopo', dataInicio, dataAlvo);
                        }}
                        disabled={!selectedScopeType}
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Escopo
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
                  <div className="text-lg font-semibold text-gray-300">Estrutura hierárquica vazia</div>
                  <div className="text-muted-foreground max-w-md">
                    Clique em "Adicionar Escopo" para começar criando um tipo de escopo.
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
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? 'Salvando...' : 'Salvar Escopo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 