'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/scopes/ui/button';
import { ScrollArea } from '@/components/scopes/ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  CreditCard,
  Calendar,
  BarChart3,
  CheckSquare,
  Briefcase,
  DollarSign,
  Code2,
  Menu,
  PanelLeftClose,
  FolderTree,
  FilePenLine,
  ListTodo,
  ChevronRight,
  Zap,
  PanelLeftOpen
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ activePage, onPageChange, collapsed, onToggleCollapse }: SidebarProps) {
  const navigation = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      id: 'dashboard',
      section: 'relatorios'
    },
    {
      name: 'Clientes',
      icon: Users,
      id: 'clients',
      section: 'cadastros'
    },
    {
      name: 'Projetos',
      icon: FolderOpen,
      id: 'projects',
      section: 'cadastros'
    },
    {
      name: 'Orçamentos',
      icon: FileText,
      id: 'budgets',
      section: 'cadastros'
    },
    {
      name: 'Contratos',
      icon: FilePenLine,
      id: 'contracts',
      section: 'cadastros'
    },
    {
      name: 'Escopos',
      icon: FolderTree,
      id: 'scopes',
      section: 'cadastros'
    },
    {
      name: 'Cronogramas',
      icon: ListTodo,
      id: 'schedules',
      section: 'cadastros'
    },
    {
      name: 'Fluxo de Caixa',
      icon: DollarSign,
      id: 'financial',
      section: 'financeiro'
    },
    {
      name: 'Tarefas',
      icon: CheckSquare,
      id: 'tasks',
      section: 'operacional'
    },
    {
      name: 'Reuniões',
      icon: Calendar,
      id: 'meetings',
      section: 'operacional'
    }
  ];

  const sections = {
    relatorios: 'Relatórios',
    cadastros: 'Cadastros',
    financeiro: 'Financeiro',
    operacional: 'Operacional',
    configuracoes: ''
  };

  const groupedNavigation = navigation.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navigation>);

  return (
    <div className={cn(
      "flex flex-col bg-card border-r border-border/50 transition-all duration-300 relative h-screen",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Header com gradiente sutil */}
      <div className="flex h-16 items-center justify-between border-b border-border/50 px-4 bg-gradient-to-r from-card to-muted/30">
        {collapsed ? (
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center justify-center w-16 h-16">
              <Image
                src="/icon-color.png"
                alt="SyncTech"
                width={50}
                height={50}
                className="transition-all duration-300 max-w-none"
                style={{ width: '50px', height: '50px' }}
                priority
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="flex items-center justify-center">
              <Image
                src="/icon-ret-color.png"
                alt="SyncTech"
                width={250}
                height={250}
                className="transition-all duration-300"
              />
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {Object.entries(groupedNavigation).map(([section, items]) => (
            <div key={section} className="space-y-1">
              {!collapsed && sections[section as keyof typeof sections] && (
                <div className="px-3 mb-2 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-gradient-to-r from-primary/50 to-transparent flex-1"></div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {sections[section as keyof typeof sections]}
                    </h3>
                    <div className="h-px bg-gradient-to-l from-primary/50 to-transparent flex-1"></div>
                  </div>
                </div>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full transition-all duration-200 relative group",
                        collapsed
                          ? "justify-center p-2.5 h-11"
                          : "justify-start gap-3 px-3 py-1.5 text-left font-medium",
                        isActive
                          ? "bg-primary/20 text-primary border-r-2 border-primary shadow-lg"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                      onClick={() => onPageChange(item.id)}
                      title={collapsed ? item.name : undefined}
                    >
                      {/* Efeito de glow para item ativo */}
                      {isActive && (
                        <div className="absolute inset-0 bg-primary/10 rounded-lg blur-sm"></div>
                      )}

                      <div className={cn(
                        "relative rounded-md transition-colors flex items-center justify-center",
                        collapsed ? "p-2" : "p-1",
                        isActive ? "bg-primary/30" : "group-hover:bg-primary/20"
                      )}>
                        <item.icon className={cn(
                          "flex-shrink-0 transition-colors",
                          collapsed ? "h-5 w-5" : "h-4 w-4",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                        )} />
                      </div>

                      {!collapsed && (
                        <span className="relative font-medium">{item.name}</span>
                      )}

                      {/* Indicador de hover */}
                      {!isActive && !collapsed && (
                        <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Botão de toggle na parte inferior */}
      <div className="border-t border-border/50 p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full h-12 p-0 hover:bg-primary/20 transition-colors group"
          title={collapsed ? "Expandir sidebar" : ""}
        >
          {collapsed ? (
            <div className="flex items-center justify-center p-2 rounded-md group-hover:bg-primary/20 transition-colors">
              <PanelLeftOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          ) : (
            <div className="flex items-center justify-start w-full p-2 rounded-md group-hover:bg-primary/20 transition-colors">
              <PanelLeftClose className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="relative font-medium text-muted-foreground ml-3">Recolher Menu</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}