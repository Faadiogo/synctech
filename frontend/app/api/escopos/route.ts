import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { escoposSchema } from "@/schemas/escoposSchema";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.includes("/projeto") && pathname.includes("resumo")) {
    const parts = pathname.split("/");
    const projeto_id = parts[parts.indexOf("projeto") + 1];
    return resumoProjetoHandler(projeto_id);
  }

  const projeto_id = url.searchParams.get("projeto_id");
  const status = url.searchParams.get("status");
  const categoria = url.searchParams.get("categoria");
  const busca = url.searchParams.get("busca");
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "10");

  try {
    let query = supabase
      .from("escopos_funcionais")
      .select(`*, projetos:projeto_id (nome, clientes:cliente_id (nome_empresa, nome_completo))`);

    if (projeto_id) query = query.eq("projeto_id", projeto_id);
    if (status) query = query.eq("status", status);
    if (categoria) query = query.eq("categoria", categoria);
    if (busca) query = query.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });

    const { data: escoposRaw, error } = await query;
    if (error) throw error;

    const escopos = escoposRaw.map((escopo: any) => ({
      ...escopo,
      projeto_nome: escopo.projetos?.nome,
      cliente_nome: escopo.projetos?.clientes?.nome_empresa || escopo.projetos?.clientes?.nome_completo,
      cliente_foto: null
    }));

    let countQuery = supabase.from("escopos_funcionais").select("*", { count: "exact", head: true });
    if (projeto_id) countQuery = countQuery.eq("projeto_id", projeto_id);
    if (status) countQuery = countQuery.eq("status", status);
    if (busca) countQuery = countQuery.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);
    const { count: total } = await countQuery;

    return NextResponse.json({
      data: escopos,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error("Erro ao buscar escopos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = escoposSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.errors.map(e => e.message) }, { status: 400 });
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

    const { data: escopo, error } = await supabase
      .from("escopos_funcionais")
      .insert([value])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "Escopo criado com sucesso", data: escopo }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar escopo:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID do escopo é obrigatório" }, { status: 400 });

    const body = await request.json();
    const parsed = escoposSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.errors.map(e => e.message) }, { status: 400 });
    }

    const value = parsed.data;
    const { data: escopo, error } = await supabase
      .from("escopos_funcionais")
      .update(value)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "Escopo atualizado com sucesso", data: escopo });
  } catch (error) {
    console.error("Erro ao atualizar escopo:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID do escopo é obrigatório" }, { status: 400 });

    const { error } = await supabase
      .from("escopos_funcionais")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Escopo excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir escopo:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

async function resumoProjetoHandler(projeto_id: string) {
  try {
    const { data: escopos, error } = await supabase
      .from("escopos_funcionais")
      .select("*")
      .eq("projeto_id", projeto_id);

    if (error) throw error;

    const total = escopos.length;
    const concluidos = escopos.filter(e => e.status === "concluido").length;
    const em_andamento = escopos.filter(e => e.status === "em_andamento").length;
    const nao_iniciados = escopos.filter(e => e.status === "nao_iniciado").length;

    const horas_estimadas_total = escopos.reduce((sum, e) => sum + (e.horas_estimadas || 0), 0);
    const horas_trabalhadas_total = escopos.reduce((sum, e) => sum + (e.horas_trabalhadas || 0), 0);

    const progresso_geral = horas_estimadas_total > 0
      ? Math.round((horas_trabalhadas_total / horas_estimadas_total) * 100)
      : 0;

    const por_categoria: Record<string, any> = {};
    escopos.forEach(e => {
      const cat = e.categoria || "Indefinida";
      if (!por_categoria[cat]) por_categoria[cat] = { total: 0, concluidos: 0, horas_estimadas: 0, horas_trabalhadas: 0 };
      por_categoria[cat].total++;
      if (e.status === "concluido") por_categoria[cat].concluidos++;
      por_categoria[cat].horas_estimadas += e.horas_estimadas || 0;
      por_categoria[cat].horas_trabalhadas += e.horas_trabalhadas || 0;
    });

    const por_prioridade: Record<string, number> = {};
    escopos.forEach(e => {
      const prio = e.prioridade || "Indefinida";
      por_prioridade[prio] = (por_prioridade[prio] || 0) + 1;
    });

    return NextResponse.json({
      data: {
        total_escopos: total,
        concluidos,
        em_andamento,
        nao_iniciados,
        horas_estimadas_total,
        horas_trabalhadas_total,
        progresso_geral,
        por_categoria,
        por_prioridade
      }
    });
  } catch (error) {
    console.error("Erro ao buscar resumo do projeto:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
