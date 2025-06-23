// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url);

  if (pathname.endsWith("/graficos")) return graficosHandler(searchParams);
  if (pathname.endsWith("/alertas")) return alertasHandler();
  return dashboardHandler();
}

async function dashboardHandler() {
  try {
    const [clientesResult, projetosResult, orcamentosResult, contratosResult, financeiroResult, reunioesResult, tarefasResult] = await Promise.all([
      supabase.from("clientes").select("*"),
      supabase.from("projetos").select("*"),
      supabase.from("orcamentos").select("*"),
      supabase.from("contratos").select("*"),
      supabase.from("financeiro").select("*"),
      supabase.from("reunioes").select("*"),
      supabase.from("tarefas").select("*")
    ]);

    if (clientesResult.error) throw clientesResult.error;
    if (projetosResult.error) throw projetosResult.error;
    if (orcamentosResult.error) throw orcamentosResult.error;
    if (contratosResult.error) throw contratosResult.error;
    if (financeiroResult.error) throw financeiroResult.error;
    if (reunioesResult.error) throw reunioesResult.error;
    if (tarefasResult.error) throw tarefasResult.error;

    const clientes = clientesResult.data || [];
    const projetos = projetosResult.data || [];
    const orcamentos = orcamentosResult.data || [];
    const contratos = contratosResult.data || [];
    const financeiro = financeiroResult.data || [];
    const reunioes = reunioesResult.data || [];
    const tarefas = tarefasResult.data || [];

    const metricas = {
      clientes: {
        total: clientes.length,
        ativos: clientes.filter(c => c.ativo).length,
        inativos: clientes.filter(c => !c.ativo).length,
        pj: clientes.filter(c => c.tipo_pessoa === 'PJ').length,
        pf: clientes.filter(c => c.tipo_pessoa === 'PF').length
      },
      projetos: {
        total: projetos.length,
        nao_iniciado: projetos.filter(p => p.status === 'nao_iniciado').length,
        em_andamento: projetos.filter(p => p.status === 'em_andamento').length,
        concluido: projetos.filter(p => p.status === 'concluido').length,
        pausado: projetos.filter(p => p.status === 'pausado').length,
        cancelado: projetos.filter(p => p.status === 'cancelado').length,
        percentual_concluido: projetos.length > 0 ? Math.round((projetos.filter(p => p.status === 'concluido').length / projetos.length) * 100) : 0
      },
      orcamentos: {
        total: orcamentos.length,
        rascunho: orcamentos.filter(o => o.status === 'rascunho').length,
        enviado: orcamentos.filter(o => o.status === 'enviado').length,
        aprovado: orcamentos.filter(o => o.status === 'aprovado').length,
        recusado: orcamentos.filter(o => o.status === 'recusado').length,
        valor_total: orcamentos.reduce((sum, o) => sum + (o.valor_final || 0), 0)
      },
      contratos: {
        total: contratos.length,
        ativo: contratos.filter(c => c.status === 'ativo').length,
        concluido: contratos.filter(c => c.status === 'concluido').length,
        cancelado: contratos.filter(c => c.status === 'cancelado').length,
        valor_total: contratos.reduce((sum, c) => sum + (c.valor_contrato || 0), 0)
      },
      financeiro: {
        total_movimentos: financeiro.length,
        entradas: financeiro.filter(f => f.tipo_movimento === 'entrada'),
        saidas: financeiro.filter(f => f.tipo_movimento === 'saida'),
        valor_entradas: financeiro.filter(f => f.tipo_movimento === 'entrada').reduce((sum, f) => sum + (f.valor || 0), 0),
        valor_saidas: financeiro.filter(f => f.tipo_movimento === 'saida').reduce((sum, f) => sum + (f.valor || 0), 0),
        em_aberto: financeiro.filter(f => f.status === 'em_aberto').length,
        pago: financeiro.filter(f => f.status === 'pago').length,
        atrasado: financeiro.filter(f => f.status === 'atrasado').length,
        saldo: 0 // será calculado abaixo
      },
      reunioes: {
        total: reunioes.length,
        agendada: reunioes.filter(r => r.status === 'agendada').length,
        realizada: reunioes.filter(r => r.status === 'realizada').length,
        cancelada: reunioes.filter(r => r.status === 'cancelada').length,
        presencial: reunioes.filter(r => r.tipo === 'presencial').length,
        online: reunioes.filter(r => r.tipo === 'online').length
      },
      tarefas: {
        total: tarefas.length,
        pendente: tarefas.filter(t => t.status === 'pendente').length,
        em_andamento: tarefas.filter(t => t.status === 'em_andamento').length,
        concluida: tarefas.filter(t => t.status === 'concluida').length,
        cancelada: tarefas.filter(t => t.status === 'cancelada').length,
        bloqueada: tarefas.filter(t => t.status === 'bloqueada').length,
        alta_prioridade: tarefas.filter(t => ['alta', 'critica'].includes(t.prioridade)).length,
        percentual_concluido: tarefas.length > 0 ? Math.round((tarefas.filter(t => t.status === 'concluida').length / tarefas.length) * 100) : 0
      }
    };

    metricas.financeiro.saldo = metricas.financeiro.valor_entradas - metricas.financeiro.valor_saidas;

    return NextResponse.json({ data: metricas });
  } catch (error) {
    console.error("Erro ao gerar dashboard:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

async function graficosHandler(searchParams: URLSearchParams) {
  return NextResponse.json({ error: "Rota /graficos não implementada" }, { status: 501 });
}

async function alertasHandler() {
  return NextResponse.json({ error: "Rota /alertas não implementada" }, { status: 501 });
}
