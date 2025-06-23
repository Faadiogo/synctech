import { z } from 'zod';

export const projetoBaseSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  cliente_id: z.number(),
  status: z.string(),
  data_inicio: z.string().optional(),
  data_alvo: z.string().optional(),
  valor_estimado: z.number().optional(),
  tecnologias: z.array(z.string()).optional(),
  progresso: z.number().optional(),
  horas_estimadas: z.number().optional(),
  valor_hora: z.number().optional(),
  horas_por_dia: z.number().optional()
});

export const projetoSchema = projetoBaseSchema;

export const projetoUpdateSchema = projetoBaseSchema.deepPartial();
