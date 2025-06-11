import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function SettingsList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
          <p className="text-gray-600">Ajuste as configurações gerais do sistema conforme sua necessidade.</p>
        </div>
        <Button className="gap-2">
          <Settings className="h-4 w-4" />
          Editar Configurações
        </Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-2">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-lg font-semibold text-gray-700">Nenhuma configuração cadastrada ainda</div>
          <div className="text-gray-500 text-center max-w-md">
            Personalize o sistema de acordo com as necessidades da sua empresa, ajustando informações e preferências.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 