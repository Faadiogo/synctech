export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { tarefaSchema } from "@/schemas/tarefasSchema";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
);

type Status = "pendente" | "em_andamento" | "concluida" | "cancelada";

export async function GET(request: NextRequest) {
    const { searchParams, pathname } = new URL(request.url);

    if (pathname.endsWith("/kanban")) return kanbanHandler(searchParams);
    if (pathname.endsWith("/dashboard")) return dashboardHandler(searchParams);

    return listarTarefas(searchParams);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = tarefaSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: parsed.error.issues },
                { status: 400 }
            );
        }

        const value = parsed.data;

        const { data: projeto } = await supabase
            .from("projetos")
            .select("id")
            .eq("id", value.projeto_id)
            .single();
        if (!projeto) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 400 });

        if (value.escopo_id) {
            const { data: escopo } = await supabase
                .from("escopos")
                .select("id")
                .eq("id", value.escopo_id)
                .single();
            if (!escopo) return NextResponse.json({ error: "Escopo não encontrado" }, { status: 400 });
        }

        const { data: tarefa, error } = await supabase
            .from("tarefas")
            .insert([value])
            .select()
            .single();
        if (error) throw error;

        return NextResponse.json({ message: "Tarefa criada com sucesso", data: tarefa }, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

        const body = await request.json();
        const parsed = tarefaSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: parsed.error.issues },
                { status: 400 }
            );
        }

        const value = parsed.data;

        if (value.status === "concluida" && !value.data_conclusao) {
            value.data_conclusao = new Date();
        }

        const { data: tarefa, error } = await supabase
            .from("tarefas")
            .update(value)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ message: "Tarefa atualizada com sucesso", data: tarefa });
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

        const { error: deleteError } = await supabase.from("tarefas").delete().eq("id", id);

        if (deleteError) throw deleteError;

        return NextResponse.json({ message: "Tarefa excluída com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir tarefa:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const status = searchParams.get("status");

        const statusValidos = ["nao_iniciada", "em_andamento", "concluida", "cancelada"];
        if (!status || !statusValidos.includes(status)) {
            return NextResponse.json({ error: "Status inválido" }, { status: 400 });
        }

        const updateData: any = { status };
        if (status === "concluida") {
            updateData.data_conclusao = new Date();
        }

        const { data: tarefa, error } = await supabase
            .from("tarefas")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ message: "Status atualizado com sucesso", data: tarefa });
    } catch (error) {
        console.error("Erro ao atualizar status da tarefa:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

async function listarTarefas(params: URLSearchParams) {
    try {
        const { projeto_id, escopo_id, status, prioridade, responsavel, page = "1", limit = "10" } = Object.fromEntries(params);

        let query = supabase
            .from("tarefas")
            .select(`*, projetos:projeto_id (nome, clientes:cliente_id (nome_empresa, nome_completo)), escopos:escopo_id (funcionalidade)`);

        if (projeto_id) query = query.eq("projeto_id", projeto_id);
        if (escopo_id) query = query.eq("escopo_id", escopo_id);
        if (status) query = query.eq("status", status);
        if (prioridade) query = query.eq("prioridade", prioridade);
        if (responsavel) query = query.ilike("responsavel", `%${responsavel}%`);

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query = query.range(offset, offset + parseInt(limit) - 1).order("created_at", { ascending: false });

        const { data: tarefasRaw, error } = await query;
        if (error) throw error;

        const hoje = new Date();
        const tarefas = tarefasRaw.map(tarefa => {
            const vencimento = tarefa.data_vencimento ? new Date(tarefa.data_vencimento) : null;
            let statusCalculado = tarefa.status;
            if (tarefa.status !== 'concluida' && tarefa.status !== 'cancelada' && vencimento && vencimento < hoje) {
                statusCalculado = 'atrasada';
            }
            const progresso = tarefa.horas_estimadas > 0 ? Math.round((tarefa.horas_trabalhadas / tarefa.horas_estimadas) * 100) : 0;
            return {
                ...tarefa,
                status_calculado: statusCalculado,
                progresso,
                projeto_nome: tarefa.projetos?.nome,
                nome_empresa: tarefa.projetos?.clientes?.nome_empresa,
                nome_completo: tarefa.projetos?.clientes?.nome_completo,
                escopo_funcionalidade: tarefa.escopos?.funcionalidade
            };
        });

        const countQuery = supabase.from("tarefas").select("*", { count: "exact", head: true });
        const { count: total } = await countQuery;

        return NextResponse.json({
            data: tarefas,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total || 0,
                pages: Math.ceil((total || 0) / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Erro ao listar tarefas:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}

async function kanbanHandler(params: URLSearchParams) {
    const projeto_id = params.get("projeto_id");
    let query = supabase
        .from("tarefas")
        .select(`*, projetos:projeto_id (nome), escopos:escopo_id (funcionalidade)`);
    if (projeto_id) query = query.eq("projeto_id", projeto_id);
    query = query.order("created_at", { ascending: false });

    const { data: tarefas, error } = await query;
    if (error) throw error;

    const kanban: Record<Status, any[]> = {
        pendente: [],
        em_andamento: [],
        concluida: [],
        cancelada: []
    };

    tarefas.forEach(tarefa => {
        const status = tarefa.status as Status;
        kanban[status].push({
            ...tarefa,
            projeto_nome: tarefa.projetos?.nome,
            escopo_funcionalidade: tarefa.escopos?.funcionalidade
        });
    });

    return NextResponse.json({ data: kanban });
}

async function dashboardHandler(params: URLSearchParams) {
    const projeto_id = params.get("projeto_id");
    const responsavel = params.get("responsavel");

    let query = supabase.from("tarefas").select("*");
    if (projeto_id) query = query.eq("projeto_id", projeto_id);
    if (responsavel) query = query.ilike("responsavel", `%${responsavel}%`);

    const { data: tarefas, error } = await query;
    if (error) throw error;

    const hoje = new Date();
    const total = tarefas.length;
    const pendentes = tarefas.filter(t => t.status === "pendente").length;
    const em_andamento = tarefas.filter(t => t.status === "em_andamento").length;
    const concluidas = tarefas.filter(t => t.status === "concluida").length;
    const canceladas = tarefas.filter(t => t.status === "cancelada").length;
    const atrasadas = tarefas.filter(t => {
        const vencimento = t.data_vencimento ? new Date(t.data_vencimento) : null;
        return t.status !== "concluida" && t.status !== "cancelada" && vencimento && vencimento < hoje;
    }).length;
    const horas_estimadas_total = tarefas.reduce((sum, t) => sum + (t.horas_estimadas || 0), 0);
    const horas_trabalhadas_total = tarefas.reduce((sum, t) => sum + (t.horas_trabalhadas || 0), 0);
    const por_prioridade = {
        baixa: tarefas.filter(t => t.prioridade === "baixa").length,
        media: tarefas.filter(t => t.prioridade === "media").length,
        alta: tarefas.filter(t => t.prioridade === "alta").length,
        critica: tarefas.filter(t => t.prioridade === "critica").length
    };

    return NextResponse.json({
        data: {
            total,
            pendentes,
            em_andamento,
            concluidas,
            canceladas,
            atrasadas,
            horas_estimadas_total,
            horas_trabalhadas_total,
            por_prioridade
        }
    });
}