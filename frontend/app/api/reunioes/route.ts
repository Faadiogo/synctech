// app/api/reunioes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { reuniaoSchema } from "@/schemas/reunioesSchema";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams, pathname } = new URL(request.url);

  if (pathname.endsWith("/agenda")) return agendaHandler(searchParams);

  return listarReunioes(searchParams);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reuniaoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const value = parsed.data;
    const { data: projeto, error: projetoError } = await supabase
      .from("projetos")
      .select("id")
      .eq("id", value.projeto_id)
      .single();

    if (projetoError || !projeto) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 400 });
    }

    const { data: reuniao, error } = await supabase
      .from("reunioes")
      .insert([value])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "Reunião criada com sucesso", data: reuniao }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar reunião:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

async function listarReunioes(params: URLSearchParams) {
  try {
    const { projeto_id, status, data_inicio, data_fim, page = "1", limit = "10" } = Object.fromEntries(params);

    let query = supabase
      .from("reunioes")
      .select(
        `*, projetos:projeto_id (nome, clientes:cliente_id (nome_empresa, nome_completo))`
      );

    if (projeto_id) query = query.eq("projeto_id", projeto_id);
    if (status) query = query.eq("status", status);
    if (data_inicio) query = query.gte("data_reuniao", data_inicio);
    if (data_fim) query = query.lte("data_reuniao", data_fim);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1).order("data_reuniao", { ascending: false });

    const { data: reunioesRaw, error } = await query;
    if (error) throw error;

    const reunioes = reunioesRaw.map(reuniao => ({
      ...reuniao,
      projeto_nome: reuniao.projetos?.nome,
      nome_empresa: reuniao.projetos?.clientes?.nome_empresa,
      nome_completo: reuniao.projetos?.clientes?.nome_completo
    }));

    const countQuery = supabase.from("reunioes").select("*", { count: "exact", head: true });
    const { count: total } = await countQuery;

    return NextResponse.json({
      data: reunioes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Erro ao buscar reuniões:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

async function agendaHandler(params: URLSearchParams) {
  try {
    const hoje = new Date().toISOString().split("T")[0];
    const data_inicio = params.get("data_inicio") || hoje;
    const data_fim = params.get("data_fim");

    let query = supabase
      .from("reunioes")
      .select(
        `*, projetos:projeto_id (nome, clientes:cliente_id (nome_empresa, nome_completo))`
      )
      .eq("status", "agendada")
      .gte("data_reuniao", data_inicio);

    if (data_fim) query = query.lte("data_reuniao", data_fim);

    query = query.order("data_reuniao", { ascending: true }).order("hora_inicio", { ascending: true });

    const { data: reunioesRaw, error } = await query;
    if (error) throw error;

    const reunioes = reunioesRaw.map(reuniao => ({
      ...reuniao,
      projeto_nome: reuniao.projetos?.nome,
      nome_empresa: reuniao.projetos?.clientes?.nome_empresa,
      nome_completo: reuniao.projetos?.clientes?.nome_completo
    }));

    return NextResponse.json({ data: reunioes });
  } catch (error) {
    console.error("Erro ao buscar agenda:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}