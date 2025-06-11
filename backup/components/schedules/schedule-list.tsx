import React from 'react';
import { Button } from '@/components/ui/button';
import { ListTodo, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ScheduleList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cronograma</h2>
          <p className="text-gray-600">Gerencie as fases e entregas dos cronogramas dos projetos.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Fase
        </Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-2">
            <ListTodo className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-lg font-semibold text-gray-700">Nenhuma fase cadastrada ainda</div>
          <div className="text-gray-500 text-center max-w-md">
            Adicione fases ao cronograma para acompanhar o progresso e os prazos das entregas dos seus projetos.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 