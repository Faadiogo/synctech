// app/api/projetos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { projetoSchema } from "@/schemas/projetosSchema";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const cliente_id = url.searchParams.get("cliente_id");
    const busca = url.searchParams.get("busca");
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "10");

    let query = supabase
      .from("projetos")
      .select("*, clientes:cliente_id (nome_empresa, nome_completo, foto_url)");

    if (status) query = query.eq("status", status);
    if (cliente_id) query = query.eq("cliente_id", cliente_id);
    if (busca) query = query.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });

    const { data: projetos, error } = await query;
    if (error) throw error;

    const projetosProcessados = projetos.map((projeto: any) => ({
      ...projeto,
      nome_empresa: projeto.clientes?.nome_empresa,
      nome_completo: projeto.clientes?.nome_completo,
      cliente_nome: projeto.clientes?.nome_empresa || projeto.clientes?.nome_completo,
      cliente_foto: projeto.clientes?.foto_url,
      progresso_calculado: 0,
      total_tarefas: 0,
      tarefas_concluidas: 0
    }));

    let countQuery = supabase.from("projetos").select("*", { count: "exact", head: true });
    if (status) countQuery = countQuery.eq("status", status);
    if (cliente_id) countQuery = countQuery.eq("cliente_id", cliente_id);
    if (busca) countQuery = countQuery.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);

    const { count: total } = await countQuery;

    return NextResponse.json({
      data: projetosProcessados,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = projetoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.errors.map(e => e.message) }, { status: 400 });
    }

    const value = parsed.data;
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id")
      .eq("id", value.cliente_id)
      .eq("ativo", true)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json({ error: "Cliente não encontrado ou inativo" }, { status: 400 });
    }

    const { data: projeto, error } = await supabase.from("projetos").insert([value]).select().single();
    if (error) throw error;

    return NextResponse.json({ message: "Projeto criado com sucesso", data: projeto }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID do projeto é obrigatório" }, { status: 400 });

    const body = await request.json();
    const parsed = projetoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.errors.map(e => e.message) }, { status: 400 });
    }

    const value = parsed.data;
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id")
      .eq("id", value.cliente_id)
      .eq("ativo", true)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json({ error: "Cliente não encontrado ou inativo" }, { status: 400 });
    }

    const { data: projeto, error } = await supabase
      .from("projetos")
      .update(value)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "Projeto atualizado com sucesso", data: projeto });
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID do projeto é obrigatório" }, { status: 400 });

    const { error } = await supabase.from("projetos").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ message: "Projeto excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir projeto:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
