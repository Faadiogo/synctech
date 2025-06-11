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
  ChevronRight
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
      "flex h-full flex-col bg-background border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
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
          className="h-8 w-8 p-0"
        >
          {collapsed ? <Image src="/icon-color.png" alt="SynchTech" width={160} height={160} /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {Object.entries(groupedNavigation).map(([section, items]) => (
            <div key={section}>
              {!collapsed && sections[section as keyof typeof sections] && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {sections[section as keyof typeof sections]}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 px-3 py-2.5 text-left font-medium",
                        collapsed ? "px-2" : "",
                        isActive
                          ? "bg-muted text-primary hover:bg-muted/80"
                          : "text-foreground hover:bg-muted hover:text-primary"
                      )}
                      onClick={() => onPageChange(item.id)}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      {!collapsed && item.name}
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