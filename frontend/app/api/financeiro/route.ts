// app/api/financeiro/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { financeiroSchema } from "@/schemas/financeiroSchema";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tipo_movimento = url.searchParams.get("tipo_movimento");
    const status = url.searchParams.get("status");
    const contrato_id = url.searchParams.get("contrato_id");
    const data_inicio = url.searchParams.get("data_inicio");
    const data_fim = url.searchParams.get("data_fim");
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "10");

    let query = supabase
      .from("financeiro")
      .select(
        `*, contratos:contrato_id (numero_contrato, valor_contrato, projetos:projeto_id (nome, clientes:cliente_id (nome_empresa, nome_completo)))`
      );

    if (tipo_movimento) query = query.eq("tipo_movimento", tipo_movimento);
    if (status) query = query.eq("status", status);
    if (contrato_id) query = query.eq("contrato_id", contrato_id);
    if (data_inicio) query = query.gte("data_vencimento", data_inicio);
    if (data_fim) query = query.lte("data_vencimento", data_fim);

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order("data_vencimento", { ascending: false });

    const { data: movimentosRaw, error } = await query;
    if (error) throw error;

    const movimentos = movimentosRaw.map((movimento: any) => ({
      ...movimento,
      numero_contrato: movimento.contratos?.numero_contrato,
      projeto_nome: movimento.contratos?.projetos?.nome,
      nome_empresa: movimento.contratos?.projetos?.clientes?.nome_empresa,
      nome_completo: movimento.contratos?.projetos?.clientes?.nome_completo
    }));

    let countQuery = supabase.from("financeiro").select("*", { count: "exact", head: true });
    if (tipo_movimento) countQuery = countQuery.eq("tipo_movimento", tipo_movimento);
    if (status) countQuery = countQuery.eq("status", status);
    if (contrato_id) countQuery = countQuery.eq("contrato_id", contrato_id);
    if (data_inicio) countQuery = countQuery.gte("data_vencimento", data_inicio);
    if (data_fim) countQuery = countQuery.lte("data_vencimento", data_fim);

    const { count: total } = await countQuery;

    return NextResponse.json({
      data: movimentos,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error("Erro ao buscar movimentos financeiros:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = financeiroSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.errors.map(e => e.message) }, { status: 400 });
    }

    const value = parsed.data;
    const { data: contrato, error: contratoError } = await supabase
      .from("contratos")
      .select("id")
      .eq("id", value.contrato_id)
      .single();

    if (contratoError || !contrato) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 400 });
    }

    const { data: movimento, error } = await supabase
      .from("financeiro")
      .insert([value])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "Movimento criado com sucesso", data: movimento }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar movimento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID do movimento é obrigatório" }, { status: 400 });

    const body = await request.json();
    const parsed = financeiroSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.errors.map(e => e.message) }, { status: 400 });
    }

    const value = parsed.data;
    const { data: movimento, error } = await supabase
      .from("financeiro")
      .update(value)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "Movimento atualizado com sucesso", data: movimento });
  } catch (error) {
    console.error("Erro ao atualizar movimento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID do movimento é obrigatório" }, { status: 400 });

    const { error } = await supabase.from("financeiro").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ message: "Movimento excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir movimento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT_PAGAR(request: NextRequest, id: string) {
    try {
      const body = await request.json();
      const { data_pagamento, forma_pagamento } = body;
  
      const updateData: Record<string, any> = {
        status: "pago",
        data_pagamento: data_pagamento || new Date().toISOString().split("T")[0]
      };
  
      if (forma_pagamento) updateData.forma_pagamento = forma_pagamento;
  
      const { data: movimento, error } = await supabase
        .from("financeiro")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
  
      if (error) throw error;
  
      return NextResponse.json({ message: "Movimento marcado como pago" });
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
  }
  
  export async function GET_CONTAS_RECEBER() {
    try {
      const hoje = new Date();
      const hojeISO = hoje.toISOString().split("T")[0];
  
      let query = supabase
        .from("financeiro")
        .select(`*, contratos:contrato_id (numero_contrato, projetos:projeto_id (nome), clientes:cliente_id (nome_empresa, nome_completo))`)
        .eq("tipo_movimento", "entrada")
        .eq("status", "em_aberto")
        .lt("data_vencimento", hojeISO)
        .order("data_vencimento", { ascending: true });
  
      const { data: contasReceberRaw, error } = await query;
      if (error) throw error;
  
      const contasReceber = contasReceberRaw.map(conta => {
        const vencimento = new Date(conta.data_vencimento);
        const dias_vencimento = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...conta,
          numero_contrato: conta.contratos?.numero_contrato,
          projeto_nome: conta.contratos?.projetos?.nome,
          nome_empresa: conta.contratos?.clientes?.nome_empresa,
          nome_completo: conta.contratos?.clientes?.nome_completo,
          dias_vencimento
        };
      });
  
      return NextResponse.json({ data: contasReceber });
    } catch (error) {
      console.error("Erro ao buscar contas a receber:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
  }
  