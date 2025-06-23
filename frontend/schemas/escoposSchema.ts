import { z } from "zod";

export const escoposSchema = z.object({
  projeto_id: z.number().int().positive(),
  nome: z.string().min(3).max(255),
  descricao: z.string().optional(),
  status: z.enum(["planejado", "em_andamento", "concluido", "cancelado"]).default("planejado"),
  data_inicio: z.string().nullable().optional(),
  data_alvo: z.string().nullable().optional(),
  ordem: z.number().int().min(0).default(0)
});

export type EscopoData = z.infer<typeof escoposSchema>;