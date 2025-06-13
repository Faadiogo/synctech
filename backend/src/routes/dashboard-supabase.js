const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// GET /api/dashboard-supabase - Dashboard principal
router.get('/', async (req, res) => {
  try {
    // Buscar dados de todas as tabelas em paralelo
    const [
      clientesResult,
      projetosResult,
      orcamentosResult,
      contratosResult,
      financeiroResult,
      reunioesResult,
      tarefasResult
    ] = await Promise.all([
      supabase.from('clientes').select('*'),
      supabase.from('projetos').select('*'),
      supabase.from('orcamentos').select('*'),
      supabase.from('contratos').select('*'),
      supabase.from('financeiro').select('*'),
      supabase.from('reunioes').select('*'),
      supabase.from('tarefas').select('*')
    ]);

    // Verificar se houve erros
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

    // Calcular métricas gerais
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
        cancelado: projetos.filter(p => p.status === 'cancelado').length
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
        valor_entradas: financeiro
          .filter(f => f.tipo_movimento === 'entrada')
          .reduce((sum, f) => sum + (f.valor || 0), 0),
        valor_saidas: financeiro
          .filter(f => f.tipo_movimento === 'saida')
          .reduce((sum, f) => sum + (f.valor || 0), 0),
        em_aberto: financeiro.filter(f => f.status === 'em_aberto').length,
        pago: financeiro.filter(f => f.status === 'pago').length,
        atrasado: financeiro.filter(f => f.status === 'atrasado').length
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
        alta_prioridade: tarefas.filter(t => t.prioridade === 'alta' || t.prioridade === 'critica').length
      }
    };

    // Calcular saldo financeiro
    metricas.financeiro.saldo = metricas.financeiro.valor_entradas - metricas.financeiro.valor_saidas;

    // Calcular percentuais de conclusão
    metricas.projetos.percentual_concluido = projetos.length > 0 ? 
      Math.round((metricas.projetos.concluido / projetos.length) * 100) : 0;
    
    metricas.tarefas.percentual_concluido = tarefas.length > 0 ? 
      Math.round((metricas.tarefas.concluida / tarefas.length) * 100) : 0;

    // Atividades recentes (últimos 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const atividadesRecentes = {
      novos_clientes: clientes.filter(c => new Date(c.created_at) >= seteDiasAtras).length,
      novos_projetos: projetos.filter(p => new Date(p.created_at) >= seteDiasAtras).length,
      orcamentos_enviados: orcamentos.filter(o => 
        o.data_envio && new Date(o.data_envio) >= seteDiasAtras
      ).length,
      reunioes_realizadas: reunioes.filter(r => 
        r.data_reuniao && new Date(r.data_reuniao) >= seteDiasAtras && r.status === 'realizada'
      ).length,
      tarefas_concluidas: tarefas.filter(t => 
        t.data_conclusao && new Date(t.data_conclusao) >= seteDiasAtras
      ).length
    };

    // Próximas atividades (próximos 7 dias)
    const seteDiasAFrente = new Date();
    seteDiasAFrente.setDate(seteDiasAFrente.getDate() + 7);
    const hoje = new Date();

    const proximasAtividades = {
      reunioes_agendadas: reunioes.filter(r => {
        const dataReuniao = new Date(r.data_reuniao);
        return dataReuniao >= hoje && dataReuniao <= seteDiasAFrente && r.status === 'agendada';
      }).length,
      tarefas_vencendo: tarefas.filter(t => {
        if (!t.data_vencimento) return false;
        const dataVencimento = new Date(t.data_vencimento);
        return dataVencimento >= hoje && dataVencimento <= seteDiasAFrente && 
               t.status !== 'concluida' && t.status !== 'cancelada';
      }).length,
      orcamentos_expirando: orcamentos.filter(o => {
        if (!o.data_validade) return false;
        const dataValidade = new Date(o.data_validade);
        return dataValidade >= hoje && dataValidade <= seteDiasAFrente && o.status === 'enviado';
      }).length
    };

    res.json({
      data: {
        metricas,
        atividades_recentes: atividadesRecentes,
        proximas_atividades: proximasAtividades,
        resumo: {
          total_clientes: metricas.clientes.total,
          projetos_ativos: metricas.projetos.em_andamento,
          valor_contratos: metricas.contratos.valor_total,
          saldo_financeiro: metricas.financeiro.saldo,
          tarefas_pendentes: metricas.tarefas.pendente + metricas.tarefas.em_andamento,
          reunioes_esta_semana: proximasAtividades.reunioes_agendadas
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard-supabase/graficos - Dados para gráficos
router.get('/graficos', async (req, res) => {
  try {
    const { periodo = '30' } = req.query; // dias
    const diasAtras = parseInt(periodo);
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasAtras);

    // Buscar dados para gráficos
    const [
      projetosResult,
      orcamentosResult,
      financeiroResult,
      tarefasResult
    ] = await Promise.all([
      supabase.from('projetos').select('created_at, status').gte('created_at', dataLimite.toISOString()),
      supabase.from('orcamentos').select('created_at, status, valor_final').gte('created_at', dataLimite.toISOString()),
      supabase.from('financeiro').select('created_at, tipo_movimento, valor, status'),
      supabase.from('tarefas').select('created_at, status, data_conclusao').gte('created_at', dataLimite.toISOString())
    ]);

    if (projetosResult.error) throw projetosResult.error;
    if (orcamentosResult.error) throw orcamentosResult.error;
    if (financeiroResult.error) throw financeiroResult.error;
    if (tarefasResult.error) throw tarefasResult.error;

    const projetos = projetosResult.data || [];
    const orcamentos = orcamentosResult.data || [];
    const financeiro = financeiroResult.data || [];
    const tarefas = tarefasResult.data || [];

    // Gráfico de projetos por status
    const projetosPorStatus = {
      nao_iniciado: projetos.filter(p => p.status === 'nao_iniciado').length,
      em_andamento: projetos.filter(p => p.status === 'em_andamento').length,
      concluido: projetos.filter(p => p.status === 'concluido').length,
      pausado: projetos.filter(p => p.status === 'pausado').length,
      cancelado: projetos.filter(p => p.status === 'cancelado').length
    };

    // Gráfico de orçamentos por status
    const orcamentosPorStatus = {
      rascunho: orcamentos.filter(o => o.status === 'rascunho').length,
      enviado: orcamentos.filter(o => o.status === 'enviado').length,
      aprovado: orcamentos.filter(o => o.status === 'aprovado').length,
      recusado: orcamentos.filter(o => o.status === 'recusado').length
    };

    // Gráfico de fluxo financeiro mensal
    const fluxoFinanceiro = {};
    financeiro.forEach(f => {
      const mes = new Date(f.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!fluxoFinanceiro[mes]) {
        fluxoFinanceiro[mes] = { entradas: 0, saidas: 0 };
      }
      if (f.tipo_movimento === 'entrada') {
        fluxoFinanceiro[mes].entradas += f.valor || 0;
      } else {
        fluxoFinanceiro[mes].saidas += f.valor || 0;
      }
    });

    // Gráfico de produtividade (tarefas concluídas por dia)
    const produtividade = {};
    tarefas.forEach(t => {
      if (t.data_conclusao && t.status === 'concluida') {
        const dia = t.data_conclusao;
        produtividade[dia] = (produtividade[dia] || 0) + 1;
      }
    });

    res.json({
      data: {
        projetos_por_status: projetosPorStatus,
        orcamentos_por_status: orcamentosPorStatus,
        fluxo_financeiro: fluxoFinanceiro,
        produtividade: produtividade
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados dos gráficos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard-supabase/alertas - Alertas e notificações
router.get('/alertas', async (req, res) => {
  try {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const alertas = [];

    // Buscar dados relevantes para alertas
    const [
      orcamentosResult,
      financeiroResult,
      reunioesResult,
      tarefasResult,
      projetosResult
    ] = await Promise.all([
      supabase.from('orcamentos').select('*').eq('status', 'enviado'),
      supabase.from('financeiro').select('*').eq('status', 'em_aberto'),
      supabase.from('reunioes').select('*').eq('status', 'agendada'),
      supabase.from('tarefas').select('*').in('status', ['pendente', 'em_andamento']),
      supabase.from('projetos').select('*').eq('status', 'em_andamento')
    ]);

    if (orcamentosResult.error) throw orcamentosResult.error;
    if (financeiroResult.error) throw financeiroResult.error;
    if (reunioesResult.error) throw reunioesResult.error;
    if (tarefasResult.error) throw tarefasResult.error;
    if (projetosResult.error) throw projetosResult.error;

    const orcamentos = orcamentosResult.data || [];
    const financeiro = financeiroResult.data || [];
    const reunioes = reunioesResult.data || [];
    const tarefas = tarefasResult.data || [];
    const projetos = projetosResult.data || [];

    // Orçamentos expirando
    orcamentos.forEach(orcamento => {
      if (orcamento.data_validade) {
        const dataValidade = new Date(orcamento.data_validade);
        const diasRestantes = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes <= 3 && diasRestantes >= 0) {
          alertas.push({
            tipo: 'orcamento_expirando',
            prioridade: diasRestantes === 0 ? 'alta' : 'media',
            titulo: `Orçamento expirando ${diasRestantes === 0 ? 'hoje' : `em ${diasRestantes} dia(s)`}`,
            descricao: `Orçamento #${orcamento.id} vence em ${diasRestantes} dia(s)`,
            data: orcamento.data_validade
          });
        }
      }
    });

    // Contas vencidas ou vencendo
    financeiro.forEach(conta => {
      if (conta.data_vencimento) {
        const dataVencimento = new Date(conta.data_vencimento);
        const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes <= 3) {
          alertas.push({
            tipo: 'conta_vencendo',
            prioridade: diasRestantes < 0 ? 'alta' : 'media',
            titulo: diasRestantes < 0 ? 'Conta em atraso' : `Conta vencendo ${diasRestantes === 0 ? 'hoje' : `em ${diasRestantes} dia(s)`}`,
            descricao: `${conta.descricao} - R$ ${conta.valor}`,
            data: conta.data_vencimento
          });
        }
      }
    });

    // Reuniões de amanhã
    reunioes.forEach(reuniao => {
      const dataReuniao = new Date(reuniao.data_reuniao);
      if (dataReuniao.toDateString() === amanha.toDateString()) {
        alertas.push({
          tipo: 'reuniao_amanha',
          prioridade: 'media',
          titulo: 'Reunião agendada para amanhã',
          descricao: `${reuniao.titulo} às ${reuniao.hora_inicio}`,
          data: reuniao.data_reuniao
        });
      }
    });

    // Tarefas atrasadas
    tarefas.forEach(tarefa => {
      if (tarefa.data_vencimento) {
        const dataVencimento = new Date(tarefa.data_vencimento);
        if (dataVencimento < hoje) {
          const diasAtraso = Math.ceil((hoje - dataVencimento) / (1000 * 60 * 60 * 24));
          alertas.push({
            tipo: 'tarefa_atrasada',
            prioridade: 'alta',
            titulo: `Tarefa atrasada há ${diasAtraso} dia(s)`,
            descricao: tarefa.titulo,
            data: tarefa.data_vencimento
          });
        }
      }
    });

    // Projetos sem atividade recente (mais de 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    
    projetos.forEach(projeto => {
      const ultimaAtualizacao = new Date(projeto.updated_at);
      if (ultimaAtualizacao < seteDiasAtras) {
        alertas.push({
          tipo: 'projeto_sem_atividade',
          prioridade: 'baixa',
          titulo: 'Projeto sem atividade recente',
          descricao: `${projeto.nome} não teve atualizações há mais de 7 dias`,
          data: projeto.updated_at
        });
      }
    });

    // Ordenar alertas por prioridade e data
    const prioridadeOrder = { alta: 3, media: 2, baixa: 1 };
    alertas.sort((a, b) => {
      if (prioridadeOrder[a.prioridade] !== prioridadeOrder[b.prioridade]) {
        return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
      }
      return new Date(a.data) - new Date(b.data);
    });

    res.json({
      data: alertas.slice(0, 20) // Limitar a 20 alertas
    });
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 