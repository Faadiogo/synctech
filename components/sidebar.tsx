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
  Settings,
  BarChart3,
  CheckSquare,
  Briefcase,
  DollarSign,
  Code2,
  Menu,
  ChevronLeft
} from 'lucide-react';

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
      section: 'principal'
    },
    {
      name: 'Clientes',
      icon: Users,
      id: 'clients',
      section: 'principal'
    },
    {
      name: 'Projetos',
      icon: FolderOpen,
      id: 'projects',
      section: 'principal'
    },
    {
      name: 'Financeiro',
      icon: DollarSign,
      id: 'financial',
      section: 'financeiro'
    },
    {
      name: 'Orçamentos',
      icon: FileText,
      id: 'budgets',
      section: 'financeiro'
    },
    {
      name: 'Contratos',
      icon: Briefcase,
      id: 'contracts',
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
    },
    {
      name: 'Configurações',
      icon: Settings,
      id: 'settings',
      section: 'configuracoes'
    }
  ];

  const sections = {
    principal: 'Principal',
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
      "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">SynchTech</span>
              <span className="text-xs text-gray-500">Gestão de Projetos</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {Object.entries(groupedNavigation).map(([section, items]) => (
            <div key={section}>
              {!collapsed && sections[section as keyof typeof sections] && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                          ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      onClick={() => onPageChange(item.id)}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-blue-700" : "text-gray-400"
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