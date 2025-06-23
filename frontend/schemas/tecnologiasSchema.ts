import { z } from "zod";

export const tecnologiaSchema = z.object({
  nome: z.string().min(2).max(100),
  categoria: z.enum([
    "frontend",
    "backend",
    "database",
    "devops",
    "mobile",
    "design",
    "teste",
    "outro"
  ]).default("outro"),
  versao: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  url_documentacao: z.string().url().optional().nullable(),
  nivel_conhecimento: z.enum(["basico", "intermediario", "avancado", "expert"]).default("basico"),
  ativo: z.boolean().default(true)
});
