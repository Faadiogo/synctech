// app/api/contratos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { contratoSchema } from "@/schemas/contratosSchema";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  try {
    let query = supabase
      .from("contratos")
      .select(
        `*,
        projetos:projeto_id (
          nome,
          clientes:cliente_id (
            nome_empresa,
            nome_completo
          )
        ),
        orcamentos:orcamento_id (
          numero_orcamento,
          valor_total
        )`
      );

    if (status) {
      query = query.eq("status", status);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });

    const { data: contratosRaw, error } = await query;
    if (error) throw error;

    const contratos = contratosRaw.map((contrato) => ({
      ...contrato,
      nome_empresa: contrato.projetos?.clientes?.nome_empresa,
      nome_completo: contrato.projetos?.clientes?.nome_completo,
      projeto_nome: contrato.projetos?.nome,
      numero_orcamento: contrato.orcamentos?.numero_orcamento,
      valor_orcamento: contrato.orcamentos?.valor_total,
    }));

    let countQuery = supabase.from("contratos").select("*", { count: "exact", head: true });
    if (status) {
      countQuery = countQuery.eq("status", status);
    }
    const { count: total } = await countQuery;

    return NextResponse.json({
      data: contratos,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar contratos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contratoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }

    const value = parsed.data;

    if (value.projeto_id) {
      const { data: projeto, error: projetoError } = await supabase
        .from("projetos")
        .select("id")
        .eq("id", value.projeto_id)
        .single();
      if (projetoError || !projeto) {
        return NextResponse.json({ error: "Projeto não encontrado" }, { status: 400 });
      }
    }

    if (value.orcamento_id) {
      const { data: orcamento, error: orcamentoError } = await supabase
        .from("orcamentos")
        .select("id")
        .eq("id", value.orcamento_id)
        .single();
      if (orcamentoError || !orcamento) {
        return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 400 });
      }
    }

    const { data: contrato, error } = await supabase
      .from("contratos")
      .insert([value])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { message: "Contrato criado com sucesso", data: contrato },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar contrato:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = contratoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.errors.map((e) => e.message) },
        { status: 400 }
      );
    }

    const value = parsed.data;

    const { data: contrato, error } = await supabase
      .from("contratos")
      .update(value)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ message: "Contrato atualizado com sucesso", data: contrato });
  } catch (error) {
    console.error("Erro ao atualizar contrato:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("contratos")
      .delete()
      .eq("id", id);

    if (deleteError) {
      if (deleteError.code === "PGRST116") {
        return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
      }
      throw deleteError;
    }

    return NextResponse.json({ message: "Contrato excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir contrato:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
