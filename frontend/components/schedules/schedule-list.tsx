import React from 'react';
import { Button } from '@/components/scopes/ui/button';
import { Calendar, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/scopes/ui/card';

interface ScheduleListProps {
  onNewSchedule: () => void;
}

export function ScheduleList({ onNewSchedule }: ScheduleListProps) {
  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Cronograma</h2>
                <p className="text-muted-foreground">Gerencie as fases e entregas dos cronogramas dos projetos.</p>
              </div>
            </div>
            <Button onClick={onNewSchedule} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Nova Fase
            </Button>
          </div>
        </div>
      </div>

      <Card className="tech-card">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 mb-2 border border-blue-100">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-lg font-semibold text-gray-700">Nenhuma fase cadastrada ainda</div>
          <div className="text-muted-foreground text-center max-w-md">
            Adicione fases ao cronograma para acompanhar o progresso e os prazos das entregas dos seus projetos.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 