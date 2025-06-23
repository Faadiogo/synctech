import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// GET - Buscar cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// PUT - Atualizar cliente pelo ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Para updates parciais, permitir apenas alguns campos essenciais
    const allowedFields = [
      'ativo', 'nome_empresa', 'nome_completo', 'representante_legal', 'razao_social',
      'cpf', 'cnpj', 'telefone', 'email', 'endereco', 'cidade', 'uf', 'cep', 'numero', 
      'observacoes', 'foto_url'
    ];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Buscar cliente atual para verificações
    const { data: currentCliente, error: currentError } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (currentError || !currentCliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Verificar unicidade apenas se os campos únicos estão sendo alterados
    const tipo_pessoa = updateData.tipo_pessoa || currentCliente.tipo_pessoa;

    if (tipo_pessoa === "PF") {
      // Verificar nome_completo se está sendo alterado
      if (updateData.nome_completo && updateData.nome_completo !== currentCliente.nome_completo) {
        const { data: existingByName } = await supabase
          .from("clientes")
          .select("id")
          .eq("nome_completo", updateData.nome_completo)
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
      if (updateData.cpf && updateData.cpf !== currentCliente.cpf) {
        const { data: existingByCpf } = await supabase
          .from("clientes")
          .select("id")
          .eq("cpf", updateData.cpf)
          .neq("id", id)
          .single();

        if (existingByCpf) {
          return NextResponse.json(
            { error: "Já existe outro cliente com este CPF" },
            { status: 409 }
          );
        }
      }
    } else if (tipo_pessoa === "PJ") {
      // Verificar nome_empresa se está sendo alterado
      if (updateData.nome_empresa && updateData.nome_empresa !== currentCliente.nome_empresa) {
        const { data: existingByEmpresa } = await supabase
          .from("clientes")
          .select("id")
          .eq("nome_empresa", updateData.nome_empresa)
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
      if (updateData.razao_social && updateData.razao_social !== currentCliente.razao_social) {
        const { data: existingByRazao } = await supabase
          .from("clientes")
          .select("id")
          .eq("razao_social", updateData.razao_social)
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
      if (updateData.cnpj && updateData.cnpj !== currentCliente.cnpj) {
        const { data: existingByCnpj } = await supabase
          .from("clientes")
          .select("id")
          .eq("cnpj", updateData.cnpj)
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
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
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

// DELETE - Soft delete ou hard delete pelo ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const url = new URL(request.url);
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

    return NextResponse.json({ message: "Cliente desativado com sucesso", data: cliente });
  } catch (error) {
    console.error("Erro ao desativar cliente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
} 