'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, User, Building2, MapPin, Phone, Loader2 } from 'lucide-react';
import { clientesService } from '@/lib/services/clientes';
import { Cliente } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ClientFormProps {
  onClose: () => void;
  clienteId?: number;
  onSuccess?: () => void;
}

export function ClientForm({ onClose, clienteId, onSuccess }: ClientFormProps) {
  const [formData, setFormData] = useState<{
    tipo_pessoa: 'PF' | 'PJ';
    nome_empresa: string;
    nome_completo: string;
    representante_legal: string;
    razao_social: string;
    cpf: string;
    cnpj: string;
    cep: string;
    numero: string;
    endereco: string;
    cidade: string;
    uf: string;
    telefone: string;
    email: string;
    observacoes: string;
    ativo: boolean;
  }>({
    tipo_pessoa: 'PJ',
    nome_empresa: '',
    nome_completo: '',
    representante_legal: '',
    razao_social: '',
    cpf: '',
    cnpj: '',
    cep: '',
    numero: '',
    endereco: '',
    cidade: '',
    uf: '',
    telefone: '',
    email: '',
    observacoes: '',
    ativo: true
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!clienteId);
  const [cepLoading, setCepLoading] = useState(false);
  const { toast } = useToast();

  // Carregar dados do cliente se for edição
  useEffect(() => {
    if (clienteId) {
      loadCliente();
    }
  }, [clienteId]);

  const loadCliente = async () => {
    try {
      setInitialLoading(true);
      const response = await clientesService.buscarPorId(clienteId!);
      const cliente = response.data;
      setFormData({
        tipo_pessoa: cliente.tipo_pessoa,
        nome_empresa: cliente.nome_empresa || '',
        nome_completo: cliente.nome_completo || '',
        representante_legal: cliente.representante_legal || '',
        razao_social: cliente.razao_social || '',
        cpf: cliente.cpf || '',
        cnpj: cliente.cnpj || '',
        cep: cliente.cep || '',
        numero: cliente.numero || '',
        endereco: cliente.endereco || '',
        cidade: cliente.cidade || '',
        uf: cliente.uf || '',
        telefone: cliente.telefone || '',
        email: cliente.email || '',
        observacoes: cliente.observacoes || '',
        ativo: cliente.ativo
      });
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do cliente.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const buscarEnderecoPorCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      setCepLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "O CEP informado não foi encontrado.",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        endereco: data.logradouro || '',
        cidade: data.localidade || '',
        uf: data.uf || ''
      }));

      toast({
        title: "Endereço preenchido",
        description: "Endereço preenchido automaticamente com base no CEP.",
      });
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar o endereço pelo CEP.",
        variant: "destructive",
      });
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (cep: string) => {
    setFormData(prev => ({ ...prev, cep }));
    
    // Formatar CEP
    const cepFormatado = cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
    if (cepFormatado !== cep) {
      setFormData(prev => ({ ...prev, cep: cepFormatado }));
    }

    // Buscar endereço se CEP estiver completo
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarEnderecoPorCep(cep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (clienteId) {
        await clientesService.atualizar(clienteId, formData);
        toast({
          title: "Sucesso",
          description: "Cliente atualizado com sucesso.",
        });
      } else {
        await clientesService.criar(formData);
        toast({
          title: "Sucesso",
          description: "Cliente criado com sucesso.",
        });
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cliente. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header moderno com gradiente */}
      <div className="relative mb-8 p-6 rounded-2xl gradient-bg border border-border/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{clienteId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <p className="text-muted-foreground">{clienteId ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente no sistema'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {initialLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando dados do cliente...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="tech-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                {formData.tipo_pessoa === 'PJ' ? (
                  <Building2 className="h-5 w-5 text-blue-400" />
                ) : (
                  <User className="h-5 w-5 text-blue-400" />
                )}
              </div>
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tipo de Pessoa */}
            <div className="space-y-2">
              <Label htmlFor="tipo_pessoa">Tipo de Pessoa</Label>
              <Select
                value={formData.tipo_pessoa}
                onValueChange={(value) => handleInputChange('tipo_pessoa', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PF">Pessoa Física</SelectItem>
                  <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos condicionais baseados no tipo */}
            {formData.tipo_pessoa === 'PJ' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
                  <Input
                    id="nome_empresa"
                    value={formData.nome_empresa}
                    onChange={(e) => handleInputChange('nome_empresa', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razao_social">Razão Social</Label>
                  <Input
                    id="razao_social"
                    value={formData.razao_social}
                    onChange={(e) => handleInputChange('razao_social', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="representante_legal">Representante Legal</Label>
                  <Input
                    id="representante_legal"
                    value={formData.representante_legal}
                    onChange={(e) => handleInputChange('representante_legal', e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_completo">Nome Completo *</Label>
                  <Input
                    id="nome_completo"
                    value={formData.nome_completo}
                    onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>
            )}

            {/* Endereço */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <MapPin className="h-4 w-4 text-green-400" />
                </div>
                <h3 className="text-lg font-medium">Endereço</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {cepLoading && (
                      <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uf">Estado</Label>
                  <Select
                    value={formData.uf}
                    onValueChange={(value) => handleInputChange('uf', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="AL">AL</SelectItem>
                      <SelectItem value="AP">AP</SelectItem>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="BA">BA</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="DF">DF</SelectItem>
                      <SelectItem value="ES">ES</SelectItem>
                      <SelectItem value="GO">GO</SelectItem>
                      <SelectItem value="MA">MA</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="PA">PA</SelectItem>
                      <SelectItem value="PB">PB</SelectItem>
                      <SelectItem value="PR">PR</SelectItem>
                      <SelectItem value="PE">PE</SelectItem>
                      <SelectItem value="PI">PI</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="RN">RN</SelectItem>
                      <SelectItem value="RS">RS</SelectItem>
                      <SelectItem value="RO">RO</SelectItem>
                      <SelectItem value="RR">RR</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="SE">SE</SelectItem>
                      <SelectItem value="TO">TO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Phone className="h-4 w-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium">Contato</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2 p-4 border border-border/50 rounded-lg bg-muted/30">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => handleInputChange('ativo', checked)}
              />
              <Label htmlFor="ativo" className="font-medium">Cliente ativo</Label>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? 'Salvando...' : (clienteId ? 'Atualizar Cliente' : 'Salvar Cliente')}
              </Button>
            </div>
          </CardContent>
                    </Card>
          </form>
        )}
      </div>
    );
  }