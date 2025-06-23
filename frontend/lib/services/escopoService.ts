import { z } from 'zod';

// Interface para tipos de nível 1
export interface Nivel1Tipo {
  id: number;
  nome: string;
  descricao?: string;
  cor_hex?: string;
  icon_name?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para nós da hierarquia
export interface HierarchyNode {
  id?: number;
  nome: string;
  descricao?: string;
  status: string;
  data_inicio?: string;
  data_alvo?: string;
  ordem: number;
  nivel: 1 | 2 | 3 | 4;
  parent_id?: number;
  nivel1_tipo_id?: number; // Apenas para nivel 1
  horas_estimadas?: number; // Apenas para nivel 4
  children?: HierarchyNode[];
  expanded?: boolean;
}

// Schema base para campos comuns
const baseEscopoSchema = {
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  data_inicio: z.string().optional(),
  data_alvo: z.string().optional(),
  status: z.enum(['planejado', 'em_andamento', 'concluido', 'cancelado'], {
    required_error: 'Status é obrigatório',
  }),
  ordem: z.number().int().positive().optional(),
};

// Schema para Escopo Funcional (nível raiz)
export const escopoFuncionalSchema = z.object({
  ...baseEscopoSchema,
  projeto_id: z.number().int().positive(),
}).refine((data) => {
  // Validar que data_alvo não seja menor que data_inicio
  if (data.data_inicio && data.data_alvo) {
    return new Date(data.data_alvo) >= new Date(data.data_inicio);
  }
  return true;
}, {
  message: 'Data alvo deve ser maior ou igual à data de início',
  path: ['data_alvo'],
});

// Schema para Nivel1
export const nivel1Schema = z.object({
  ...baseEscopoSchema,
  escopo_funcional_id: z.number().int().positive(),
  nivel1_tipo_id: z.number().int().positive('Tipo é obrigatório'),
}).refine((data) => {
  if (data.data_inicio && data.data_alvo) {
    return new Date(data.data_alvo) >= new Date(data.data_inicio);
  }
  return true;
}, {
  message: 'Data alvo deve ser maior ou igual à data de início',
  path: ['data_alvo'],
});

// Schema para Nivel2
export const nivel2Schema = z.object({
  ...baseEscopoSchema,
  nivel1_id: z.number().int().positive(),
}).refine((data) => {
  if (data.data_inicio && data.data_alvo) {
    return new Date(data.data_alvo) >= new Date(data.data_inicio);
  }
  return true;
}, {
  message: 'Data alvo deve ser maior ou igual à data de início',
  path: ['data_alvo'],
});

// Schema para Nivel3
export const nivel3Schema = z.object({
  ...baseEscopoSchema,
  nivel2_id: z.number().int().positive(),
}).refine((data) => {
  if (data.data_inicio && data.data_alvo) {
    return new Date(data.data_alvo) >= new Date(data.data_inicio);
  }
  return true;
}, {
  message: 'Data alvo deve ser maior ou igual à data de início',
  path: ['data_alvo'],
});

// Schema para Nivel4
export const nivel4Schema = z.object({
  ...baseEscopoSchema,
  nivel3_id: z.number().int().positive(),
  horas_estimadas: z.number().positive().optional(),
}).refine((data) => {
  if (data.data_inicio && data.data_alvo) {
    return new Date(data.data_alvo) >= new Date(data.data_inicio);
  }
  return true;
}, {
  message: 'Data alvo deve ser maior ou igual à data de início',
  path: ['data_alvo'],
});

// Schema para validação de datas dentro do intervalo pai
export const createDateRangeValidator = (parentStartDate?: string, parentEndDate?: string) => {
  return z.object({
    data_inicio: z.string().optional(),
    data_alvo: z.string().optional(),
  }).refine((data) => {
    if (!parentStartDate || !parentEndDate) return true;
    
    const parentStart = new Date(parentStartDate);
    const parentEnd = new Date(parentEndDate);
    
    if (data.data_inicio) {
      const childStart = new Date(data.data_inicio);
      if (childStart < parentStart || childStart > parentEnd) {
        return false;
      }
    }
    
    if (data.data_alvo) {
      const childEnd = new Date(data.data_alvo);
      if (childEnd < parentStart || childEnd > parentEnd) {
        return false;
      }
    }
    
    return true;
  }, {
    message: `As datas devem estar dentro do intervalo do escopo pai (${parentStartDate} a ${parentEndDate})`,
  });
};

// Tipos TypeScript inferidos dos schemas
export type EscopoFuncional = z.infer<typeof escopoFuncionalSchema>;
export type Nivel1 = z.infer<typeof nivel1Schema>;
export type Nivel2 = z.infer<typeof nivel2Schema>;
export type Nivel3 = z.infer<typeof nivel3Schema>;
export type Nivel4 = z.infer<typeof nivel4Schema>;

// Status com cores para badges
export const statusConfig = {
  planejado: { 
    label: 'Planejado', 
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    color: 'blue'
  },
  em_andamento: { 
    label: 'Em Andamento', 
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    color: 'yellow'
  },
  concluido: { 
    label: 'Concluído', 
    className: 'bg-green-100 text-green-800 border-green-200',
    color: 'green'
  },
  cancelado: { 
    label: 'Cancelado', 
    className: 'bg-red-100 text-red-800 border-red-200',
    color: 'red'
  },
};

// Dados estáticos dos tipos de nível 1 (baseado no banco)
export const nivel1Tipos: Nivel1Tipo[] = [
  { id: 1, nome: 'Frontend', descricao: 'Desenvolvimento da interface do usuário', cor_hex: '#3B82F6', icon_name: 'Monitor' },
  { id: 2, nome: 'Backend', descricao: 'Desenvolvimento da lógica do servidor e Banco de Dados', cor_hex: '#10B981', icon_name: 'Database' },
  { id: 3, nome: 'Integrações', descricao: 'Integrações com sistemas externos e APIs', cor_hex: '#F59E0B', icon_name: 'Zap' },
  { id: 4, nome: 'Automações', descricao: 'WebScraping, RPA Processos automatizados', cor_hex: '#8B5CF6', icon_name: 'Settings' },
  { id: 5, nome: 'Design', descricao: 'Criação, Vetorização e edição de logos e arquivos', cor_hex: '#EF4444', icon_name: 'Palette' },
  { id: 6, nome: 'Mobile', descricao: 'Desenvolvimento mobile', cor_hex: '#06B6D4', icon_name: 'Smartphone' },
  { id: 7, nome: 'DevOps', descricao: 'Infraestrutura e deploy', cor_hex: '#EC4899', icon_name: 'Code' },
  { id: 8, nome: 'Testes', descricao: 'Testes e qualidade de software', cor_hex: '#EAB308', icon_name: 'Check' }
];

// Serviços para gerenciar tipos de escopo
export const tiposEscopoService = {
  async listar(): Promise<{ data: Nivel1Tipo[] }> {
    try {
      // Por enquanto retorna dados estáticos, mas pode ser conectado à API depois
      return { data: nivel1Tipos };
    } catch (error) {
      console.error('Erro ao listar tipos de escopo:', error);
      throw error;
    }
  },

  buscarPorId(id: number): Nivel1Tipo | undefined {
    return nivel1Tipos.find(tipo => tipo.id === id);
  }
};

// Serviços para gerenciar hierarquia de escopos
export const hierarchyService = {
  // Serviços para Nivel1
  async criarNivel1(escopoFuncionalId: number, dados: {
    nivel1_tipo_id: number;
    nome?: string;
    descricao?: string;
    status?: string;
    data_inicio?: string;
    data_alvo?: string;
    ordem?: number;
  }): Promise<{ data: any }> {
    try {
      const response = await fetch('http://localhost:3001/api/nivel1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          escopo_funcional_id: escopoFuncionalId,
          ...dados,
          ordem: dados.ordem || 1,
          status: dados.status || 'planejado'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar nível 1');
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Erro ao criar nível 1:', error);
      throw error;
    }
  },

  // Serviços para Nivel2
  async criarNivel2(nivel1Id: number, dados: {
    nome: string;
    descricao?: string;
    status?: string;
    data_inicio?: string;
    data_alvo?: string;
    ordem?: number;
  }): Promise<{ data: any }> {
    try {
      const response = await fetch('http://localhost:3001/api/nivel2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nivel1_id: nivel1Id,
          ...dados,
          ordem: dados.ordem || 1,
          status: dados.status || 'planejado'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar nível 2');
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Erro ao criar nível 2:', error);
      throw error;
    }
  },

  // Serviços para Nivel3
  async criarNivel3(nivel2Id: number, dados: {
    nome: string;
    descricao?: string;
    status?: string;
    data_inicio?: string;
    data_alvo?: string;
    ordem?: number;
  }): Promise<{ data: any }> {
    try {
      const response = await fetch('http://localhost:3001/api/nivel3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nivel2_id: nivel2Id,
          ...dados,
          ordem: dados.ordem || 1,
          status: dados.status || 'planejado'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar nível 3');
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Erro ao criar nível 3:', error);
      throw error;
    }
  },

  // Serviços para Nivel4
  async criarNivel4(nivel3Id: number, dados: {
    nome: string;
    descricao?: string;
    status?: string;
    data_inicio?: string;
    data_alvo?: string;
    horas_estimadas?: number;
    ordem?: number;
  }): Promise<{ data: any }> {
    try {
      const response = await fetch('http://localhost:3001/api/nivel4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nivel3_id: nivel3Id,
          ...dados,
          ordem: dados.ordem || 1,
          status: dados.status || 'planejado'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar nível 4');
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Erro ao criar nível 4:', error);
      throw error;
    }
  },

  // Buscar hierarquia completa de um escopo funcional
  async buscarHierarquia(escopoFuncionalId: number): Promise<{ data: HierarchyNode[] }> {
    try {
      const response = await fetch(`http://localhost:3001/api/escopo/${escopoFuncionalId}/hierarquia`);
      if (!response.ok) {
        throw new Error('Erro ao carregar hierarquia');
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Erro ao buscar hierarquia:', error);
      throw error;
    }
  },

  // Deletar item da hierarquia
  async deletarItem(nivel: number, id: number): Promise<void> {
    try {
      const response = await fetch(`http://localhost:3001/api/nivel${nivel}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao deletar item do nível ${nivel}`);
      }
    } catch (error) {
      console.error(`Erro ao deletar item do nível ${nivel}:`, error);
      throw error;
    }
  },

  // Atualizar item da hierarquia
  async atualizarItem(nivel: number, id: number, dados: any): Promise<{ data: any }> {
    try {
      const response = await fetch(`http://localhost:3001/api/nivel${nivel}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar item do nível ${nivel}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`Erro ao atualizar item do nível ${nivel}:`, error);
      throw error;
    }
  }
}; 