import { z } from "zod";

export const contratoSchema = z.object({
  projeto_id: z.number().int().positive().nullable().optional(),
  orcamento_id: z.number().int().positive().nullable().optional(),
  valor_orcado: z.number().min(0).nullable().optional(),
  desconto: z.number().min(0).default(0),
  valor_contrato: z.number().min(0),
  data_assinatura: z.string().datetime().nullable().optional(),
  qtd_parcelas: z.number().int().min(1).default(1),
  arquivo_pdf_path: z.string().optional(),
  status: z.enum(["ativo", "concluido", "cancelado"]).default("ativo"),
  observacoes: z.string().optional()
});

export type Contrato = z.infer<typeof contratoSchema>;

export type ContratoComCliente = Contrato & {
  id: number;
  numero_contrato: string;
  cliente_nome?: string;
  cliente_foto?: string;
  projeto_nome?: string;
};
