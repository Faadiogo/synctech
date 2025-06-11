import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderTree, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ScopeList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Escopo Funcional</h2>
          <p className="text-gray-600">Gerencie os escopos funcionais dos projetos, organizando funcionalidades e entregas.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Escopo Funcional
        </Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-2">
            <FolderTree className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-lg font-semibold text-gray-700">Nenhum escopo funcional cadastrado ainda</div>
          <div className="text-gray-500 text-center max-w-md">
            Crie e organize os escopos funcionais dos seus projetos para facilitar o acompanhamento das funcionalidades e entregas.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 