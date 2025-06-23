// schemas/tarefasSchema.ts
import { z } from "zod";

export const tarefaSchema = z.object({
  projeto_id: z.number().int().positive(),
  escopo_id: z.number().int().positive().nullable().optional(),
  titulo: z.string().min(3).max(255),
  descricao: z.string().optional(),
  prioridade: z.enum(["baixa", "media", "alta", "critica"]).default("media"),
  status: z.enum(["nao_iniciada", "em_andamento", "concluida", "cancelada"]).default("nao_iniciada"),
  data_vencimento: z.union([z.string(), z.date()]).nullable().optional(),
  data_conclusao: z.union([z.string(), z.date()]).nullable().optional(),
  responsavel: z.string().optional(),
  horas_estimadas: z.number().int().min(0).nullable().optional(),
  horas_trabalhadas: z.number().int().min(0).default(0),
  tags: z.string().optional(),
  observacoes: z.string().optional()
});