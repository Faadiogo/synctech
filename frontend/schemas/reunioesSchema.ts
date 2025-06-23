// schemas/reunioesSchema.ts
import { z } from "zod";

export const reuniaoSchema = z.object({
  projeto_id: z.number().int().positive(),
  titulo: z.string().min(3).max(255),
  descricao: z.string().optional().or(z.literal("")),
  data_reuniao: z.coerce.date(),
  hora_inicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Hora inválida. Use o formato HH:mm",
  }),
  hora_fim: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Hora inválida" })
    .nullable()
    .optional(),
  local: z.string().optional().or(z.literal("")),
  tipo: z.enum(["presencial", "online", "hibrida"]).default("presencial"),
  link_reuniao: z.string().url().optional().or(z.literal("")),
  participantes: z.string().optional().or(z.literal("")),
  ata: z.string().optional().or(z.literal("")),
  status: z
    .enum(["agendada", "realizada", "cancelada", "adiada"])
    .default("agendada"),
  observacoes: z.string().optional().or(z.literal("")),
});

export type ReuniaoInput = z.infer<typeof reuniaoSchema>;
