'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  ChevronLeft,
  FolderTree,
  FilePenLine,
  ListTodo,
  ChevronRight,
  Zap
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
      name: 'Escopo Funcional',
      icon: FolderTree,
      id: 'scopes',
      section: 'cadastros'
    },
    {
      name: 'Cronograma',
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
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header com gradiente sutil */}
      <div className="flex h-16 items-center justify-between border-b border-border/50 px-4 bg-gradient-to-r from-card to-muted/30">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <Image src="/icon-ret-color.png" alt="SynchTech" width={160} height={160} />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 hover:bg-primary/20 transition-colors"
        >
          {collapsed ? (
            <div className="relative">
              <Image src="/icon-color.png" alt="SynchTech" width={24} height={24} />
              <div className="absolute inset-0 bg-primary/20 rounded blur-sm"></div>
            </div>
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-3">
          {Object.entries(groupedNavigation).map(([section, items]) => (
            <div key={section} className="space-y-1">
              {!collapsed && sections[section as keyof typeof sections] && (
                <div className="px-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-gradient-to-r from-primary/50 to-transparent flex-1"></div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {sections[section as keyof typeof sections]}
                    </h3>
                    <div className="h-px bg-gradient-to-l from-primary/50 to-transparent flex-1"></div>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 px-3 py-1.5 text-left font-medium transition-all duration-200 relative group",
                        collapsed ? "px-2" : "",
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
                        "relative p-1 rounded-md transition-colors",
                        isActive ? "bg-primary/30" : "group-hover:bg-primary/20"
                      )}>
                        <item.icon className={cn(
                          "h-4 w-4 flex-shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                        )} />
                      </div>
                      
                      {!collapsed && (
                        <span className="relative">{item.name}</span>
                      )}
                      
                      {/* Indicador de hover */}
                      {!isActive && (
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
    </div>
  );
}