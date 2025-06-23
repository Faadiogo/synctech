import { z } from "zod";

export const orcamentoSchema = z.object({
  projeto_id: z.number().int().positive(),
  arquivo_pdf_path: z.string().optional(),
  data_envio: z.string().nullable().optional(),
  data_validade: z.string().nullable().optional(),
  valor_total: z.number().min(0),
  desconto: z.number().min(0).default(0),
  valor_final: z.number().min(0),
  status: z.enum(["rascunho", "enviado", "aprovado", "recusado", "expirado"]).default("rascunho"),
  observacoes: z.string().optional()
});

export type OrcamentoData = z.infer<typeof orcamentoSchema>;