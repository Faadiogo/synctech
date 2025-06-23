import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { clienteSchema } from "@/schemas/clientesSchema";


const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// GET - Listar clientes (com filtros, paginação)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const ativo = url.searchParams.get("ativo");
    const tipo_pessoa = url.searchParams.get("tipo_pessoa");
    const busca = url.searchParams.get("busca");
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");

    let query = supabase
      .from("clientes")
      .select(`
        *,
        projetos_count:projetos(count)
      `);

    if (ativo !== null) {
      query = query.eq("ativo", ativo === "true");
    }
    if (tipo_pessoa) {
      query = query.eq("tipo_pessoa", tipo_pessoa);
    }
    if (busca) {
      query = query.or(
        `nome_empresa.ilike.%${busca}%,nome_completo.ilike.%${busca}%,email.ilike.%${busca}%`
      );
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order("created_at", {
      ascending: false,
    });

    const { data: clientesRaw, error } = await query;

    if (error) throw error;

    const clientes = clientesRaw.map((cliente) => ({
      ...cliente,
      projetos_count: cliente.projetos_count?.[0]?.count || 0,
    }));

    // Contar total para paginação
    let countQuery = supabase.from("clientes").select("*", { count: "exact", head: true });

    if (ativo !== null) {
      countQuery = countQuery.eq("ativo", ativo === "true");
    }
    if (tipo_pessoa) {
      countQuery = countQuery.eq("tipo_pessoa", tipo_pessoa);
    }
    if (busca) {
      countQuery = countQuery.or(
        `nome_empresa.ilike.%${busca}%,nome_completo.ilike.%${busca}%,email.ilike.%${busca}%`
      );
    }

    const { count: total } = await countQuery;

    return NextResponse.json({
      data: clientes,
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil(((total || 0) / limit)),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = clienteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parsed.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const value = parsed.data;

    // Verificar unicidade dos campos
    if (value.tipo_pessoa === "PF") {
      // Verificar se nome_completo já existe
      if (value.nome_completo) {
        const { data: existingByName } = await supabase
          .from("clientes")
          .select("id")
          .eq("nome_completo", value.nome_completo)
          .eq("tipo_pessoa", "PF")
          .single();

        if (existingByName) {
          return NextResponse.json(
            { error: "Já existe um cliente com este nome completo" },
            { status: 409 }
          );
        }
      }

      // Verificar se CPF já existe
      if (value.cpf) {
        const { data: existingByCpf } = await supabase
          .from("clientes")
          .select("id")
          .eq("cpf", value.cpf)
          .single();

        if (existingByCpf) {
          return NextResponse.json(
            { error: "Já existe um cliente com este CPF" },
            { status: 409 }
          );
        }
      }
    } else if (value.tipo_pessoa === "PJ") {
      // Verificar se nome_empresa já existe
      if (value.nome_empresa) {
        const { data: existingByEmpresa } = await supabase
          .from("clientes")
          .select("id")
          .eq("nome_empresa", value.nome_empresa)
          .eq("tipo_pessoa", "PJ")
          .single();

        if (existingByEmpresa) {
          return NextResponse.json(
            { error: "Já existe um cliente com este nome de empresa" },
            { status: 409 }
          );
        }
      }

      // Verificar se razao_social já existe
      if (value.razao_social) {
        const { data: existingByRazao } = await supabase
          .from("clientes")
          .select("id")
          .eq("razao_social", value.razao_social)
          .eq("tipo_pessoa", "PJ")
          .single();

        if (existingByRazao) {
          return NextResponse.json(
            { error: "Já existe um cliente com esta razão social" },
            { status: 409 }
          );
        }
      }

      // Verificar se CNPJ já existe
      if (value.cnpj) {
        const { data: existingByCnpj } = await supabase
          .from("clientes")
          .select("id")
          .eq("cnpj", value.cnpj)
          .single();

        if (existingByCnpj) {
          return NextResponse.json(
            { error: "Já existe um cliente com este CNPJ" },
            { status: 409 }
          );
        }
      }
    }

    const { data: cliente, error } = await supabase
      .from("clientes")
      .insert([value])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        message: "Cliente criado com sucesso",
        data: cliente,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// PUT - Atualizar cliente pelo ID (query param ?id=)
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID do cliente é obrigatório" }, { status: 400 });
    }

    const body = await request.json();

    const parsed = clienteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parsed.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const value = parsed.data;

    // Buscar cliente atual para verificações
    const { data: currentCliente, error: currentError } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (currentError || !currentCliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Verificar unicidade dos campos únicos
    if (value.tipo_pessoa === "PF") {
      // Verificar nome_completo se está sendo alterado
      if (value.nome_completo && value.nome_completo !== currentCliente.nome_completo) {
        const { data: existingByName } = await supabase
          .from("clientes")
          .select("id")
          .eq("nome_completo", value.nome_completo)
          .eq("tipo_pessoa", "PF")
          .neq("id", id)
          .single();

        if (existingByName) {
          return NextResponse.json(
            { error: "Já existe outro cliente com este nome completo" },
            { status: 409 }
          );
        }
      }

      // Verificar CPF se está sendo alterado
      if (value.cpf && value.cpf !== currentCliente.cpf) {
        const { data: existingByCpf } = await supabase
          .from("clientes")
          .select("id")
          .eq("cpf", value.cpf)
          .neq("id", id)
          .single();

        if (existingByCpf) {
          return NextResponse.json(
            { error: "Já existe outro cliente com este CPF" },
            { status: 409 }
          );
        }
      }
    } else if (value.tipo_pessoa === "PJ") {
      // Verificar nome_empresa se está sendo alterado
      if (value.nome_empresa && value.nome_empresa !== currentCliente.nome_empresa) {
        const { data: existingByEmpresa } = await supabase
          .from("clientes")
          .select("id")
          .eq("nome_empresa", value.nome_empresa)
          .eq("tipo_pessoa", "PJ")
          .neq("id", id)
          .single();

        if (existingByEmpresa) {
          return NextResponse.json(
            { error: "Já existe outro cliente com este nome de empresa" },
            { status: 409 }
          );
        }
      }

      // Verificar razao_social se está sendo alterado
      if (value.razao_social && value.razao_social !== currentCliente.razao_social) {
        const { data: existingByRazao } = await supabase
          .from("clientes")
          .select("id")
          .eq("razao_social", value.razao_social)
          .eq("tipo_pessoa", "PJ")
          .neq("id", id)
          .single();

        if (existingByRazao) {
          return NextResponse.json(
            { error: "Já existe outro cliente com esta razão social" },
            { status: 409 }
          );
        }
      }

      // Verificar CNPJ se está sendo alterado
      if (value.cnpj && value.cnpj !== currentCliente.cnpj) {
        const { data: existingByCnpj } = await supabase
          .from("clientes")
          .select("id")
          .eq("cnpj", value.cnpj)
          .neq("id", id)
          .single();

        if (existingByCnpj) {
          return NextResponse.json(
            { error: "Já existe outro cliente com este CNPJ" },
            { status: 409 }
          );
        }
      }
    }

    const { data: cliente, error } = await supabase
      .from("clientes")
      .update(value)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // PGRST116 = Not found
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({
      message: "Cliente atualizado com sucesso",
      data: cliente,
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// DELETE - Soft delete ou hard delete pelo ID (query param ?id=&hard=true)
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID do cliente é obrigatório" }, { status: 400 });
    }
    const hard = url.searchParams.get("hard") === "true";

    if (hard) {
      const { error: deleteError } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id);

      if (deleteError) {
        if (deleteError.code === "PGRST116") {
          return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
        }
        throw deleteError;
      }

      return NextResponse.json({ message: "Cliente excluído permanentemente" });
    }

    const { data: cliente, error } = await supabase
      .from("clientes")
      .update({ ativo: false })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ message: "Cliente desativado com sucesso" });
  } catch (error) {
    console.error("Erro ao desativar cliente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
