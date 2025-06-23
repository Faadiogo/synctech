// app/api/orcamentos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { orcamentoSchema } from "@/schemas/orcamentosSchema";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "10");

    let query = supabase
      .from("orcamentos")
      .select(
        `*, projetos:projeto_id (nome, clientes:cliente_id (nome_empresa, nome_completo))`
      );

    if (status) query = query.eq("status", status);

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });

    const { data: orcamentosRaw, error } = await query;
    if (error) throw error;

    const orcamentos = orcamentosRaw.map((o: any) => ({
      ...o,
      nome_empresa: o.projetos?.clientes?.nome_empresa,
      nome_completo: o.projetos?.clientes?.nome_completo,
      projeto_nome: o.projetos?.nome
    }));

    let countQuery = supabase.from("orcamentos").select("*", { count: "exact", head: true });
    if (status) countQuery = countQuery.eq("status", status);
    const { count: total } = await countQuery;

    return NextResponse.json({
      data: orcamentos,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = orcamentoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.errors.map(e => e.message) }, { status: 400 });
    }

    const value = parsed.data;
    const { data: projeto, error: projetoError } = await supabase.from("projetos").select("id").eq("id", value.projeto_id).single();
    if (projetoError || !projeto) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 400 });
    }

    const { data: orcamento, error } = await supabase.from("orcamentos").insert([value]).select().single();
    if (error) throw error;

    return NextResponse.json({ message: "Orçamento criado com sucesso", data: orcamento }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID do orçamento é obrigatório" }, { status: 400 });

    const body = await request.json();
    const parsed = orcamentoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.errors.map(e => e.message) }, { status: 400 });
    }

    const value = parsed.data;
    const { data: projeto, error: projetoError } = await supabase.from("projetos").select("id").eq("id", value.projeto_id).single();
    if (projetoError || !projeto) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 400 });
    }

    const { data: orcamento, error } = await supabase.from("orcamentos").update(value).eq("id", id).select().single();
    if (error) throw error;

    return NextResponse.json({ message: "Orçamento atualizado com sucesso", data: orcamento });
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID do orçamento é obrigatório" }, { status: 400 });

    const { error } = await supabase.from("orcamentos").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ message: "Orçamento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}