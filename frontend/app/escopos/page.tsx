'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Calendar,
  Target,
  Layers,
  Clock,
  Save,
  X,
  FolderTree,
  Monitor,
  Database,
  Zap,
  Settings,
  Palette,
  Smartphone,
  Code,
  Check
} from 'lucide-react';
import { tiposEscopoService, hierarchyService } from '@/lib/services/escopoService';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';

interface EscopoItem {
  id?: number;
  nome: string;
  descricao?: string;
  status: string;
  data_inicio?: string;
  data_alvo?: string;
  ordem: number;
  nivel: 1 | 2 | 3 | 4;
  parent_id?: number;
  nivel1_tipo_id?: number;
  horas_estimadas?: number;
  children?: EscopoItem[];
  expanded?: boolean;
  isEditing?: boolean;
  isNew?: boolean;
}

interface EscopoFuncional {
  id?: number;
  nome: string;
  descricao?: string;
  status: string;
  data_inicio?: string;
  data_alvo?: string;
  ordem: number;
  isEditing?: boolean;
  isNew?: boolean;
  children?: EscopoItem[];
}

interface EscopoFormProps {
  projetoId?: number;
  onEscoposChange?: (escopos: any[]) => void;
  disabled?: boolean;
}

const statusOptions = [
  { value: 'planejado', label: 'Planejado', color: 'bg-blue-500' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-500' },
  { value: 'concluido', label: 'Concluído', color: 'bg-green-500' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-500' },
];

// Mapeamento de ícones do banco para componentes Lucide
const iconMap: Record<string, React.ComponentType<any>> = {
  Monitor,
  Database,
  Zap,
  Settings,
  Palette,
  Smartphone,
  Code,
  Check,
  FolderTree,
  Target,
  Layers
};

// Função para obter componente de ícone
const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || FolderTree;
};

// Função para gerar degradê de cores
const generateColorVariants = (hexColor: string, nivel: number) => {
  // Converter hex para RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calcular opacidades baseadas no nível
  const opacities = {
    1: 1,      // 100% - cor original
    2: 0.8,    // 80%
    3: 0.6,    // 60%
    4: 0.4     // 40%
  };

  const opacity = opacities[nivel as keyof typeof opacities] || 0.5;

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity * 0.1})`,
    borderColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
    textColor: `rgba(${r}, ${g}, ${b}, ${Math.min(opacity + 0.3, 1)})`,
    iconColor: `rgba(${r}, ${g}, ${b}, ${Math.min(opacity + 0.2, 1)})`
  };
};

export function EscopoForm({ projetoId, onEscoposChange, disabled }: EscopoFormProps) {
  const [escoposFuncionais, setEscoposFuncionais] = useState<EscopoFuncional[]>([]);
  const [nivel1Tipos, setNivel1Tipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();

  // Função para encontrar a cor de um item baseado no seu tipo (nível 1) ancestral
  const findItemColors = (item: EscopoItem, escopoIndex: number, itemPath: number[]) => {
    let nivel1Item = item;

    // Se não for nível 1, encontrar o ancestral nível 1
    if (item.nivel !== 1) {
      let current: any = escoposFuncionais[escopoIndex];
      // Navegar até o nível 1 (primeiro filho do escopo funcional)
      if (current.children && current.children.length > 0) {
        nivel1Item = current.children[itemPath[0]];
      }
    }

    const tipo = nivel1Tipos.find(t => t.id === nivel1Item.nivel1_tipo_id);
    if (tipo?.cor_hex) {
      return generateColorVariants(tipo.cor_hex, item.nivel);
    }

    // Cores padrão se não encontrar tipo
    return generateColorVariants('#6B7280', item.nivel);
  };

  useEffect(() => {
    carregarTiposNivel1();
    if (projetoId) {
      carregarEscopos();
    }
  }, [projetoId]);

  // -----------------------------------------------------------------
  //  Resetar formulário sempre que o usuário navegar para esta rota e
  //  estivermos criando um novo projeto (projetoId == undefined).
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!projetoId) {
      // Limpa todos os dados: quando subir o state para [], o outro useEffect
      // que adiciona um escopo padrão será executado automaticamente.
      setEscoposFuncionais([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    // Notificar mudanças para o componente pai
    if (onEscoposChange) {
      onEscoposChange(escoposFuncionais);
    }
  }, [escoposFuncionais, onEscoposChange]);

  const carregarTiposNivel1 = async () => {
    try {
      const response = await tiposEscopoService.listar();
      setNivel1Tipos(response.data);
    } catch (error) {
      console.error('Erro ao carregar tipos de nível 1:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tipos de funcionalidades.",
        variant: "destructive",
      });
    }
  };

  const carregarEscopos = async () => {
    if (!projetoId) return;

    try {
      setLoading(true);
      // TODO: Implementar carregamento dos escopos existentes
      // const response = await escopoService.listarPorProjeto(projetoId);
      // setEscoposFuncionais(response.data);
    } catch (error) {
      console.error('Erro ao carregar escopos:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarEscopoFuncional = () => {
    // Criar escopo funcional com um item nível 1 já em edição
    const novoEscopo: EscopoFuncional = {
      nome: 'Escopo Funcional',
      descricao: '',
      status: 'planejado',
      data_inicio: '',
      data_alvo: '',
      ordem: escoposFuncionais.length + 1,
      isEditing: false,
      isNew: false,
      children: []
    };

    // Adicionar automaticamente um item nível 1 em edição
    const novoItemNivel1: EscopoItem = {
      nome: '',
      descricao: '',
      status: 'planejado',
      data_inicio: '',
      data_alvo: '',
      ordem: 1,
      nivel: 1,
      children: [],
      isEditing: true,
      isNew: true,
      expanded: false
    };

    novoEscopo.children = [novoItemNivel1];
    setEscoposFuncionais([...escoposFuncionais, novoEscopo]);
  };

  const removerEscopoFuncional = (index: number) => {
    const confirmar = window.confirm(
      'Você tem certeza? O escopo e todas as suas funcionalidades serão removidos.'
    );
    if (!confirmar) return;

    const novosEscopos = escoposFuncionais.filter((_, i) => i !== index);
    setEscoposFuncionais(novosEscopos);

    toast({
      title: "Sucesso",
      description: "Escopo funcional removido com sucesso.",
    });
  };

  const adicionarItem = (escopoIndex: number, parentPath: number[] = [], nivel: 1 | 2 | 3 | 4 = 1) => {
    const novosEscopos = [...escoposFuncionais];

    let targetArray: EscopoItem[];
    let parentId: number | undefined;

    if (parentPath.length === 0) {
      // Adicionando ao escopo funcional
      targetArray = novosEscopos[escopoIndex].children || [];
      novosEscopos[escopoIndex].children = targetArray;
    } else {
      // Navegando pela hierarquia
      let current: any = novosEscopos[escopoIndex];
      for (let i = 0; i < parentPath.length; i++) {
        current = current.children[parentPath[i]];
      }
      targetArray = current.children || [];
      current.children = targetArray;
      parentId = current.id;

      // Garante que o pai fique expandido para exibir o novo filho
      current.expanded = true;
    }

    const novoItem: EscopoItem = {
      nome: '',
      descricao: '',
      status: 'planejado',
      data_inicio: '',
      data_alvo: '',
      ordem: targetArray.length + 1,
      nivel,
      parent_id: parentId,
      children: [],
      isEditing: true,
      isNew: true,
      expanded: false
    };

    if (nivel === 4) {
      novoItem.horas_estimadas = 0;
    }

    targetArray.push(novoItem);
    setEscoposFuncionais(novosEscopos);
  };

  const atualizarItem = (escopoIndex: number, itemPath: number[], campo: string, valor: any) => {
    const novosEscopos = [...escoposFuncionais];

    let current: any = novosEscopos[escopoIndex];
    for (let i = 0; i < itemPath.length - 1; i++) {
      current = current.children[itemPath[i]];
    }

    const item = current.children[itemPath[itemPath.length - 1]];
    (item as any)[campo] = valor;

    setEscoposFuncionais(novosEscopos);
  };

  const salvarItem = (escopoIndex: number, itemPath: number[]) => {
    const novosEscopos = [...escoposFuncionais];

    let current: any = novosEscopos[escopoIndex];
    for (let i = 0; i < itemPath.length - 1; i++) {
      current = current.children[itemPath[i]];
    }

    const item = current.children[itemPath[itemPath.length - 1]];

    // Verificar duplicatas no mesmo nível
    const irmaos = current.children || [];
    const indiceAtual = itemPath[itemPath.length - 1];

    const duplicado = irmaos.some((e: any, i: number) => {
      if (i === indiceAtual) return false;
      if (item.nivel === 1) {
        return e.nivel1_tipo_id === item.nivel1_tipo_id;
      }
      return (
        (e.nome || '').toLowerCase().trim() === (item.nome || '').toLowerCase().trim()
      );
    });

    if (duplicado) {
      toast({
        title: "Erro",
        description: `Já existe um item igual neste nível.`,
        variant: "destructive",
      });
      return;
    }

    item.isEditing = false;
    item.isNew = false;
    setEscoposFuncionais(novosEscopos);

    toast({
      title: "Sucesso",
      description: "Item salvo com sucesso.",
    });
  };

  const cancelarEdicaoItem = (escopoIndex: number, itemPath: number[]) => {
    const novosEscopos = [...escoposFuncionais];

    let current: any = novosEscopos[escopoIndex];
    for (let i = 0; i < itemPath.length - 1; i++) {
      current = current.children[itemPath[i]];
    }

    const item = current.children[itemPath[itemPath.length - 1]];

    if (item.isNew) {
      current.children.splice(itemPath[itemPath.length - 1], 1);
    } else {
      item.isEditing = false;
    }

    setEscoposFuncionais(novosEscopos);
  };

  const removerItem = (escopoIndex: number, itemPath: number[]) => {
    const confirmar = window.confirm(
      'Você tem certeza? Este item e todos os seus subitens serão removidos.'
    );
    if (!confirmar) return;

    const novosEscopos = [...escoposFuncionais];

    let current: any = novosEscopos[escopoIndex];
    for (let i = 0; i < itemPath.length - 1; i++) {
      current = current.children[itemPath[i]];
    }

    current.children.splice(itemPath[itemPath.length - 1], 1);
    setEscoposFuncionais(novosEscopos);

    toast({
      title: "Sucesso",
      description: "Item removido com sucesso.",
    });
  };

  const toggleExpansao = (escopoIndex: number, itemPath: number[]) => {
    const novosEscopos = [...escoposFuncionais];

    let current: any = novosEscopos[escopoIndex];
    for (let i = 0; i < itemPath.length; i++) {
      current = current.children[itemPath[i]];
    }

    current.expanded = !current.expanded;
    setEscoposFuncionais(novosEscopos);
  };

  // Função recursiva para calcular horas totais de um item (soma dos filhos)
  const calcularHorasTotais = (it: EscopoItem): number => {
    if (it.children && it.children.length > 0) {
      return it.children.reduce((acc, c) => acc + calcularHorasTotais(c), 0);
    }
    return it.horas_estimadas || 0;
  };

  // Utilitários para datas (comparação por string ISO evita problemas de fuso)
  const formatDateBR = (iso: string) => {
    const [yy, mm, dd] = iso.split('-');
    return `${dd}/${mm}/${yy}`;
  };

  const obterDataMaisAntiga = (it: EscopoItem): string | undefined => {
    const datas: string[] = [];
    if (it.data_inicio) datas.push(it.data_inicio);
    if (it.children && it.children.length > 0) {
      it.children.forEach((c) => {
        const dFilho = obterDataMaisAntiga(c);
        if (dFilho) datas.push(dFilho);
      });
    }
    if (datas.length === 0) return undefined;
    return datas.reduce((min, d) => (d < min ? d : min), datas[0]);
  };

  const obterDataMaisRecente = (it: EscopoItem): string | undefined => {
    const datas: string[] = [];
    if (it.data_alvo) datas.push(it.data_alvo);
    if (it.children && it.children.length > 0) {
      it.children.forEach((c) => {
        const dFilho = obterDataMaisRecente(c);
        if (dFilho) datas.push(dFilho);
      });
    }
    if (datas.length === 0) return undefined;
    return datas.reduce((max, d) => (d > max ? d : max), datas[0]);
  };

  const renderFormularioItem = (
    item: EscopoItem,
    escopoIndex: number,
    itemPath: number[]
  ) => (
    <div className="space-y-3 p-4 border border-border/50 rounded-lg bg-muted/30">
      {item.nivel === 1 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Tipo de Funcionalidade *</Label>
              <Select
                value={item.nivel1_tipo_id !== undefined ? item.nivel1_tipo_id.toString() : undefined}
                onValueChange={(valor) => atualizarItem(escopoIndex, itemPath, 'nivel1_tipo_id', parseInt(valor))}
                disabled={disabled}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione o tipo">
                    {item.nivel1_tipo_id && (() => {
                      const tipoSelecionado = nivel1Tipos.find(t => t.id === item.nivel1_tipo_id);
                      if (tipoSelecionado) {
                        const IconComponent = getIconComponent(tipoSelecionado.icon_name || '');
                        return (
                          <div className="flex items-center gap-3">
                            <div
                              className="p-1.5 rounded-md"
                              style={{ backgroundColor: tipoSelecionado.cor_hex + '20' }}
                            >
                              <IconComponent
                                className="h-5 w-5"
                                style={{ color: tipoSelecionado.cor_hex }}
                              />
                            </div>
                            <span className="font-medium">{tipoSelecionado.nome}</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    // Filtrar tipos que já foram escolhidos em outros itens de nível 1
                    const nivel1Irmaos = escoposFuncionais[escopoIndex].children || [];
                    const idsUsados = nivel1Irmaos
                      .filter((c, idx) => idx !== itemPath[0])
                      .map(c => c.nivel1_tipo_id);

                    return nivel1Tipos
                      .filter(tipo => !idsUsados.includes(tipo.id))
                      .map(tipo => {
                        const IconComponent = getIconComponent(tipo.icon_name || '');
                        return (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            <div className="flex items-center gap-3 py-2">
                              <div
                                className="p-2 rounded-md"
                                style={{ backgroundColor: tipo.cor_hex + '20' }}
                              >
                                <IconComponent
                                  className="h-5 w-5"
                                  style={{ color: tipo.cor_hex }}
                                />
                              </div>
                              <div>
                                <span className="font-medium text-base">{tipo.nome}</span>
                                {tipo.descricao && (
                                  <p className="text-sm text-muted-foreground mt-0.5">
                                    {tipo.descricao}
                                  </p>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        );
                      });
                  })()}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                max={item.data_alvo || ''}
                value={item.data_inicio || ''}
                onChange={(e) => atualizarItem(escopoIndex, itemPath, 'data_inicio', e.target.value)}
                disabled={disabled}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data Alvo</Label>
              <Input
                type="date"
                min={item.data_inicio || ''}
                value={item.data_alvo || ''}
                onChange={(e) => atualizarItem(escopoIndex, itemPath, 'data_alvo', e.target.value)}
                disabled={disabled}
                className="h-12"
                required
              />
            </div>
          </div>

          {item.nivel === 1 && item.nivel1_tipo_id && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {nivel1Tipos.find(t => t.id === item.nivel1_tipo_id)?.descricao}
              </p>
            </div>
          )}
        </>
      )}

      {/* Campos específicos para níveis diferentes de 1 */}
      {item.nivel !== 1 && (
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 mb-4">
          <div className="space-y-2 col-span-5">
            <Label>Nome *</Label>
            <Input
              value={item.nome}
              onChange={(e) => atualizarItem(escopoIndex, itemPath, 'nome', e.target.value)}
              placeholder={`Nome da funcionalidade`}
              disabled={disabled}
              className="h-12"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Data Início</Label>
            <Input
              type="date"
              value={item.data_inicio || ''}
              onChange={(e) => atualizarItem(escopoIndex, itemPath, 'data_inicio', e.target.value)}
              disabled={disabled}
              className="h-12"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Data Alvo</Label>
            <Input
              type="date"
              value={item.data_alvo || ''}
              onChange={(e) => atualizarItem(escopoIndex, itemPath, 'data_alvo', e.target.value)}
              disabled={disabled}
              className="h-12"
            />
          </div>
          {/* Campo de horas estimadas quando o item não possui filhos */}
          {(!item.children || item.children.length === 0) && (
              <div className="space-y-2 col-span-2">
                <Label>Horas Estimadas</Label>
                <Input
                  type="number"
                  value={item.horas_estimadas || 0}
                  onChange={(e) => atualizarItem(escopoIndex, itemPath, 'horas_estimadas', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  disabled={disabled}
                  className="h-12"
                  step="0.5"
                />
              </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cancelarEdicaoItem(escopoIndex, itemPath)}
          disabled={disabled}
        >
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => salvarItem(escopoIndex, itemPath)}
          disabled={disabled}
        >
          <Save className="h-4 w-4 mr-1" />
          Cadastrar
        </Button>
      </div>
    </div>
  );

  const renderItem = (
    item: EscopoItem,
    escopoIndex: number,
    itemPath: number[]
  ): React.ReactNode => {
    const colors = findItemColors(item, escopoIndex, itemPath);

    if (item.isEditing) {
      return (
        <div
          key={`edit-${itemPath.join('-')}`}
          className="border-l-4 p-3 rounded-r-lg"
          style={{
            borderLeftColor: colors.borderColor,
            backgroundColor: colors.backgroundColor
          }}
        >
          {renderFormularioItem(item, escopoIndex, itemPath)}
        </div>
      );
    }

    const statusOption = statusOptions.find(s => s.value === item.status);
    const temFilhos = item.children && item.children.length > 0;
    const podeAdicionarFilhos = item.nivel < 4;

    // Dados agregados
    const horasTotais = calcularHorasTotais(item);
    const dataInicioAgreg = obterDataMaisAntiga(item);
    const dataAlvoAgreg = obterDataMaisRecente(item);

    return (
      <div
        key={itemPath.join('-')}
        className="border-l-4 p-3 rounded-r-lg space-y-2"
        style={{
          borderLeftColor: colors.borderColor,
          backgroundColor: colors.backgroundColor
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {temFilhos && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpansao(escopoIndex, itemPath)}
                disabled={disabled}
              >
                {item.expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}

            <div className="flex items-center gap-2">
              {item.nivel === 1 && item.nivel1_tipo_id && (() => {
                const tipo = nivel1Tipos.find(t => t.id === item.nivel1_tipo_id);
                if (tipo) {
                  const IconComponent = getIconComponent(tipo.icon_name || '');
                  return (
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-sm"
                        style={{ backgroundColor: tipo.cor_hex + '20' }}
                      >
                        <IconComponent
                          className="h-4 w-4"
                          style={{ color: tipo.cor_hex }}
                        />
                      </div>
                      <span className="text-2xl font-extrabold" style={{ color: colors.textColor }}>
                        {tipo.nome}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Nome para níveis 2,3,4 */}
              {item.nivel !== 1 && (
                <span className="font-medium" style={{ color: colors.textColor }}>
                  {item.nome || '--'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dataInicioAgreg && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Início: </Label>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDateBR(dataInicioAgreg)}
                </Badge>
              </div>
            )}

            {dataAlvoAgreg && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Alvo: </Label>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDateBR(dataAlvoAgreg)}
                </Badge>
              </div>
            )}

            {horasTotais > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Horas Estimadas: </Label>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {horasTotais}h
                </Badge>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => atualizarItem(escopoIndex, itemPath, 'isEditing', true)}
              disabled={disabled}
            >
              <Edit3 className="h-4 w-4" />
            </Button>

            {podeAdicionarFilhos && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => adicionarItem(escopoIndex, itemPath, (item.nivel + 1) as 1 | 2 | 3 | 4)}
                disabled={disabled}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removerItem(escopoIndex, itemPath)}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>

        {item.descricao && (
          <p className="text-sm text-muted-foreground ml-8">{item.descricao}</p>
        )}

        {temFilhos && item.expanded && (
          <div className="ml-6 space-y-2">
            {item.children!.map((filho, index) =>
              renderItem(filho, escopoIndex, [...itemPath, index])
            )}
          </div>
        )}
      </div>
    );
  };

  const renderEscopoFuncional = (escopo: EscopoFuncional, index: number) => {
    const temFilhos = escopo.children && escopo.children.length > 0;

    // Totais do escopo (sobre nível 1)
    const horasTotaisEscopo = temFilhos ? escopo.children!.reduce((acc, c) => acc + calcularHorasTotais(c), 0) : 0;

    const dataInicioEscopo = temFilhos ? escopo.children!.reduce<string | undefined>((min, c) => {
      const d = obterDataMaisAntiga(c);
      if (!d) return min;
      if (!min || d < min) return d;
      return min;
    }, undefined) : undefined;

    const dataAlvoEscopo = temFilhos ? escopo.children!.reduce<string | undefined>((max, c) => {
      const d = obterDataMaisRecente(c);
      if (!d) return max;
      if (!max || d > max) return d;
      return max;
    }, undefined) : undefined;

    return (
      <Card key={index} className="tech-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <FolderTree className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold">Escopo do Projeto</h3>
              </div>
            </div>

            {/* Resumo centralizado */}
            <div className="flex-1 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              {dataInicioEscopo && (
                <div className="flex items-center gap-1">
                  <span>Início:</span>
                  <Badge variant="outline" className="text-xs">
                    {formatDateBR(dataInicioEscopo)}
                  </Badge>
                </div>
              )}
              {dataAlvoEscopo && (
                <div className="flex items-center gap-1">
                  <span>Alvo:</span>
                  <Badge variant="outline" className="text-xs">
                    {formatDateBR(dataAlvoEscopo)}
                  </Badge>
                </div>
              )}
              {horasTotaisEscopo > 0 && (
                <div className="flex items-center gap-1">
                  <span>Horas Estimadas:</span>
                  <Badge variant="outline" className="text-xs">
                    {horasTotaisEscopo}h
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => adicionarItem(index, [], 1)}
                disabled={disabled}
                className="gap-2 bg-yellow-600 text-white font-extrabold hover:bg-yellow-700"
              >
                <Plus className="h-6 w-6" /> Adicionar Funcionalidade
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removerEscopoFuncional(index)}
                disabled={disabled}
                title="Remover Escopo"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {temFilhos ? (
              escopo.children!.map((item, itemIndex) =>
                renderItem(item, index, [itemIndex])
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma funcionalidade adicionada ainda
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {escoposFuncionais.length === 0 && !loading && (
        <Card className="tech-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderTree className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum escopo definido</h3>
            <p className="text-muted-foreground text-center mb-4">
              Adicione um escopo para organizar as funcionalidades do projeto.
            </p>
            <Button
              onClick={adicionarEscopoFuncional}
              disabled={disabled}
              className="gap-2 bg-yellow-600 text-white font-extrabold hover:bg-yellow-700"
            >
              <Plus className="h-6 w-6" />
              Criar Escopo
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {escoposFuncionais.map((escopo, index) =>
          renderEscopoFuncional(escopo, index)
        )}
      </div>


    </div>
  );
}
