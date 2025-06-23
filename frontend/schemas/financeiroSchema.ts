import { z } from "zod";

export const financeiroSchema = z.object({
  contrato_id: z.number().int().positive(),
  tipo_movimento: z.enum(["entrada", "saida"]),
  descricao: z.string().min(3).max(255),
  valor: z.number().positive(),
  forma_pagamento: z.enum(["pix", "cartao_credito", "boleto", "dinheiro"]).nullable().optional(),
  data_vencimento: z.string().nullable().optional(),
  data_pagamento: z.string().nullable().optional(),
  status: z.enum(["em_aberto", "pago", "atrasado", "cancelado"]).default("em_aberto"),
  numero_parcela: z.number().int().min(1).nullable().optional(),
  observacoes: z.string().optional()
});

export type FinanceiroData = z.infer<typeof financeiroSchema>;
