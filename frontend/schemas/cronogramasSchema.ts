import { z } from "zod";

export const cronogramaSchema = z.object({
  projeto_id: z.number().int().positive(),
  fase: z.string().min(3).max(255),
  descricao: z.string().optional(),
  data_inicio: z.string(),
  data_fim: z.string(),
  data_inicio_real: z.string().nullable().optional(),
  data_fim_real: z.string().nullable().optional(),
  percentual_concluido: z.number().int().min(0).max(100).default(0),
  status: z.enum(["nao_iniciado", "em_andamento", "concluido", "atrasado", "cancelado"]).default("nao_iniciado"),
  responsavel: z.string().optional(),
  dependencias: z.string().optional(),
  observacoes: z.string().optional()
});

export type CronogramaData = z.infer<typeof cronogramaSchema>;