import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cronogramaSchema } from "@/schemas/cronogramasSchema";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams, pathname } = new URL(request.url);
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length >= 3 && pathSegments[2] === "projeto") {
    const projeto_id = pathSegments[3];
    return getGanttData(projeto_id);
  }

  const projeto_id = searchParams.get("projeto_id");
  const status = searchParams.get("status");
  const fase = searchParams.get("fase");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  try {
    let query = supabase
      .from("cronograma")
      .select(`*, projetos:projeto_id (nome, clientes:cliente_id (nome_empresa, nome_completo))`);

    if (projeto_id) query = query.eq("projeto_id", projeto_id);
    if (status) query = query.eq("status", status);
    if (fase) query = query.ilike("fase", `%${fase}%`);

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order("data_inicio", { ascending: true });

    const { data: raw, error } = await query;
    if (error) throw error;

    const hoje = new Date();
    const cronogramas = raw.map((c) => {
      const dataFim = new Date(c.data_fim);
      const dataInicio = new Date(c.data_inicio);
      let status = c.status;

      if (!["concluido", "cancelado"].includes(c.status) && dataFim < hoje) {
        status = "atrasado";
      }

      const duracao_planejada = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
      let duracao_real = null;

      if (c.data_inicio_real && c.data_fim_real) {
        const iniReal = new Date(c.data_inicio_real);
        const fimReal = new Date(c.data_fim_real);
        duracao_real = Math.ceil((fimReal.getTime() - iniReal.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        ...c,
        status,
        projeto_nome: c.projetos?.nome,
        nome_empresa: c.projetos?.clientes?.nome_empresa,
        nome_completo: c.projetos?.clientes?.nome_completo,
        duracao_planejada,
        duracao_real,
      };
    });

    let countQuery = supabase.from("cronograma").select("*", { count: "exact", head: true });
    if (projeto_id) countQuery = countQuery.eq("projeto_id", projeto_id);
    if (status) countQuery = countQuery.eq("status", status);
    if (fase) countQuery = countQuery.ilike("fase", `%${fase}%`);
    const { count: total } = await countQuery;

    return NextResponse.json({
      data: cronogramas,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar cronogramas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cronogramaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.errors }, { status: 400 });
    }

    const value = parsed.data;
    if (new Date(value.data_fim) <= new Date(value.data_inicio)) {
      return NextResponse.json({ error: "Data de fim deve ser posterior à data de início" }, { status: 400 });
    }

    const { data: projeto, error: projetoError } = await supabase
      .from("projetos")
      .select("id")
      .eq("id", value.projeto_id)
      .single();

    if (projetoError || !projeto) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 400 });
    }

    const { data: cronograma, error } = await supabase
      .from("cronograma")
      .insert([value])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: "Cronograma criado com sucesso", data: cronograma }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cronograma:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    const body = await request.json();
    const parsed = cronogramaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.errors }, { status: 400 });
    }

    const value = parsed.data;
    if (new Date(value.data_fim) <= new Date(value.data_inicio)) {
      return NextResponse.json({ error: "Data de fim deve ser posterior à data de início" }, { status: 400 });
    }

    const { data: cronograma, error } = await supabase
      .from("cronograma")
      .update(value)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: "Cronograma atualizado com sucesso", data: cronograma });
  } catch (error) {
    console.error("Erro ao atualizar cronograma:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    const { error } = await supabase.from("cronograma").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ message: "Cronograma excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir cronograma:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

async function getGanttData(projeto_id: string) {
  try {
    const { data, error } = await supabase
      .from("cronograma")
      .select("*")
      .eq("projeto_id", projeto_id)
      .order("data_inicio", { ascending: true });

    if (error) throw error;

    const ganttData = data.map((c) => ({
      id: c.id,
      name: c.fase,
      start: c.data_inicio,
      end: c.data_fim,
      progress: c.percentual_concluido,
      status: c.status,
      dependencies: c.dependencias ? c.dependencias.split(",").map((d: string) => d.trim()) : [],
      responsavel: c.responsavel,
      descricao: c.descricao,
    }));

    return NextResponse.json({ data: ganttData });
  } catch (error) {
    console.error("Erro ao buscar dados do Gantt:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}