'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

interface SettingsFormProps {
  onClose: () => void;
}

export function SettingsForm({ onClose }: SettingsFormProps) {
  const [formData, setFormData] = useState({
    nome_empresa: '',
    email_contato: '',
    tema: 'claro'
  });

  const temas = [
    { value: 'claro', label: 'Claro' },
    { value: 'escuro', label: 'Escuro' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Configurações salvas:', formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
          <p className="text-gray-600">Ajuste as configurações gerais do sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome_empresa">Nome da Empresa</Label>
              <Input
                id="nome_empresa"
                value={formData.nome_empresa}
                onChange={(e) => handleInputChange('nome_empresa', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_contato">E-mail de Contato</Label>
              <Input
                id="email_contato"
                type="email"
                value={formData.email_contato}
                onChange={(e) => handleInputChange('email_contato', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tema">Tema do Sistema</Label>
              <Select 
                value={formData.tema} 
                onValueChange={(value) => handleInputChange('tema', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {temas.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 