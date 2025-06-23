import { z } from "zod";

// Schema base usado como base para criação e atualização
export const baseClienteSchema = z.object({
  tipo_pessoa: z.enum(["PF", "PJ"]),
  nome_empresa: z.string().optional().nullable(),
  nome_completo: z.string().optional().nullable(),
  representante_legal: z.string().optional().nullable(),
  razao_social: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().max(2).optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email("E-mail deve ter um formato válido").optional().nullable().or(z.literal("")),
  observacoes: z.string().optional().nullable(),
  foto_url: z.string().url("URL da foto deve ser válida").optional().nullable().or(z.literal("")),
  ativo: z.boolean().optional().default(true),
});

// Schema completo com validações customizadas (usado na criação)
export const clienteSchema = baseClienteSchema.superRefine((data, ctx) => {
  if (data.tipo_pessoa === "PJ") {
    if (!data.nome_empresa || data.nome_empresa.trim() === "") {
      ctx.addIssue({
        path: ["nome_empresa"],
        code: z.ZodIssueCode.custom,
        message: "nome_empresa é obrigatório para PJ",
      });
    }
    if (!data.cnpj || data.cnpj.trim() === "") {
      ctx.addIssue({
        path: ["cnpj"],
        code: z.ZodIssueCode.custom,
        message: "cnpj é obrigatório para PJ",
      });
    }
  }
  if (data.tipo_pessoa === "PF") {
    if (!data.nome_completo || data.nome_completo.trim() === "") {
      ctx.addIssue({
        path: ["nome_completo"],
        code: z.ZodIssueCode.custom,
        message: "nome_completo é obrigatório para PF",
      });
    }
    if (!data.cpf || data.cpf.trim() === "") {
      ctx.addIssue({
        path: ["cpf"],
        code: z.ZodIssueCode.custom,
        message: "cpf é obrigatório para PF",
      });
    }
  }
});

// Schema específico para updates que permite campos vazios
export const clienteUpdateSchema = z.object({
  tipo_pessoa: z.enum(["PF", "PJ"]).optional(),
  nome_empresa: z.string().optional().nullable(),
  nome_completo: z.string().optional().nullable(),
  representante_legal: z.string().optional().nullable(),
  razao_social: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().max(2).optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.union([z.string().email("E-mail deve ter um formato válido"), z.literal(""), z.null()]).optional(),
  observacoes: z.string().optional().nullable(),
  foto_url: z.union([z.string().url("URL da foto deve ser válida"), z.literal(""), z.null()]).optional(),
  ativo: z.boolean().optional(),
});
