// app/api/tecnologias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { tecnologiaSchema } from "@/schemas/tecnologiasSchema";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url);

  if (pathname.endsWith("/categorias")) return categoriasHandler();
  if (pathname.endsWith("/estatisticas")) return estatisticasHandler();
  if (pathname.split("/").length === 5) return getByIdHandler(pathname);

  return listarTecnologias(searchParams);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = tecnologiaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const value = parsed.data;

    const { data: existente } = await supabase
      .from("tecnologias")
      .select("id")
      .eq("nome", value.nome)
      .single();

    if (existente) {
      return NextResponse.json({ error: "Já existe uma tecnologia com este nome" }, { status: 400 });
    }

    const { data: tecnologia, error } = await supabase
      .from("tecnologias")
      .insert([value])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "Tecnologia criada com sucesso", data: tecnologia }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tecnologia:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    const body = await request.json();
    const parsed = tecnologiaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const value = parsed.data;

    const { data: existente } = await supabase
      .from("tecnologias")
      .select("id")
      .eq("nome", value.nome)
      .neq("id", id)
      .single();

    if (existente) {
      return NextResponse.json({ error: "Já existe uma tecnologia com este nome" }, { status: 400 });
    }

    const { data: tecnologia, error } = await supabase
      .from("tecnologias")
      .update(value)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: "Tecnologia atualizada com sucesso", data: tecnologia });
  } catch (error) {
    console.error("Erro ao atualizar tecnologia:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    const { error: deleteError } = await supabase
      .from("tecnologias")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Tecnologia excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir tecnologia:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

async function listarTecnologias(params: URLSearchParams) {
  const { categoria, nivel_conhecimento, ativo, busca, page = "1", limit = "50" } = Object.fromEntries(params.entries());

  let query = supabase.from("tecnologias").select("*");

  if (categoria) query = query.eq("categoria", categoria);
  if (nivel_conhecimento) query = query.eq("nivel_conhecimento", nivel_conhecimento);
  if (ativo !== undefined) query = query.eq("ativo", ativo === "true");
  if (busca) query = query.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);

  const offset = (parseInt(page) - 1) * parseInt(limit);
  query = query.range(offset, offset + parseInt(limit) - 1).order("nome", { ascending: true });

  const { data: tecnologias, error } = await query;
  if (error) throw error;

  let countQuery = supabase.from("tecnologias").select("*", { count: "exact", head: true });
  if (categoria) countQuery = countQuery.eq("categoria", categoria);
  if (nivel_conhecimento) countQuery = countQuery.eq("nivel_conhecimento", nivel_conhecimento);
  if (ativo !== undefined) countQuery = countQuery.eq("ativo", ativo === "true");
  if (busca) countQuery = countQuery.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);

  const { count: total } = await countQuery;

  return NextResponse.json({
    data: tecnologias,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total || 0,
      pages: Math.ceil((total || 0) / parseInt(limit))
    }
  });
}

async function getByIdHandler(pathname: string) {
  const id = pathname.split("/").pop();

  const { data: tecnologia, error } = await supabase
    .from("tecnologias")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: "Tecnologia não encontrada" }, { status });
  }

  return NextResponse.json({ data: tecnologia });
}

async function categoriasHandler() {
  const categorias = [
    { value: "frontend", label: "Frontend" },
    { value: "backend", label: "Backend" },
    { value: "database", label: "Database" },
    { value: "devops", label: "DevOps" },
    { value: "mobile", label: "Mobile" },
    { value: "design", label: "Design" },
    { value: "teste", label: "Teste" },
    { value: "outro", label: "Outro" }
  ];
  return NextResponse.json({ data: categorias });
}

async function estatisticasHandler() {
  const { data: tecnologias, error } = await supabase
    .from("tecnologias")
    .select("*")
    .eq("ativo", true);

  if (error) throw error;

  const total = tecnologias.length;
  const por_categoria: Record<string, number> = {};
  const por_nivel: Record<string, number> = {};

  tecnologias.forEach(tech => {
    por_categoria[tech.categoria] = (por_categoria[tech.categoria] || 0) + 1;
    por_nivel[tech.nivel_conhecimento] = (por_nivel[tech.nivel_conhecimento] || 0) + 1;
  });

  return NextResponse.json({
    data: {
      total,
      por_categoria,
      por_nivel
    }
  });
}