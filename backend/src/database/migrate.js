const { pool } = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migração do banco de dados Supabase...');

    // Clientes
    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        tipo_pessoa VARCHAR(2) NOT NULL CHECK (tipo_pessoa IN ('PF', 'PJ')),
        nome_empresa VARCHAR(255),
        nome_completo VARCHAR(255),
        representante_legal VARCHAR(255),
        razao_social VARCHAR(255),
        cpf VARCHAR(14),
        cnpj VARCHAR(18),
        cep VARCHAR(10),
        numero VARCHAR(20),
        endereco TEXT,
        cidade VARCHAR(100),
        uf VARCHAR(2),
        telefone VARCHAR(20),
        email VARCHAR(255),
        observacoes TEXT,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Trigger para updated_at em clientes
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
      CREATE TRIGGER update_clientes_updated_at 
        BEFORE UPDATE ON clientes 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Projetos
    await client.query(`
      CREATE TABLE IF NOT EXISTS projetos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        tecnologias JSONB,
        status VARCHAR(50) DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'planejamento', 'apresentado', 'orcamento_entregue', 'orcamento_aprovado', 'contrato_assinado', 'entregue', 'suporte_garantia', 'concluido')),
        data_inicio DATE,
        data_alvo DATE,
        data_conclusao DATE,
        horas_estimadas DECIMAL(10,2),
        horas_trabalhadas DECIMAL(10,2) DEFAULT 0,
        valor_estimado DECIMAL(12,2),
        progresso DECIMAL(5,2) DEFAULT 0,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_projetos_updated_at ON projetos;
      CREATE TRIGGER update_projetos_updated_at 
        BEFORE UPDATE ON projetos 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Orçamentos
    await client.query(`
      CREATE TABLE IF NOT EXISTS orcamentos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL,
        projeto_id INTEGER,
        numero_orcamento SERIAL,
        arquivo_pdf_path VARCHAR(500),
        data_envio DATE,
        data_validade DATE,
        valor_total DECIMAL(12,2),
        desconto DECIMAL(12,2) DEFAULT 0,
        valor_final DECIMAL(12,2),
        status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'recusado', 'expirado')),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE SET NULL
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_orcamentos_updated_at ON orcamentos;
      CREATE TRIGGER update_orcamentos_updated_at 
        BEFORE UPDATE ON orcamentos 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Contratos
    await client.query(`
      CREATE TABLE IF NOT EXISTS contratos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL,
        projeto_id INTEGER,
        orcamento_id INTEGER,
        numero_contrato SERIAL,
        valor_orcado DECIMAL(12,2),
        desconto DECIMAL(12,2) DEFAULT 0,
        valor_contrato DECIMAL(12,2),
        data_assinatura DATE,
        qtd_parcelas INTEGER DEFAULT 1,
        arquivo_pdf_path VARCHAR(500),
        status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE SET NULL,
        FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE SET NULL
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_contratos_updated_at ON contratos;
      CREATE TRIGGER update_contratos_updated_at 
        BEFORE UPDATE ON contratos 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Financeiro
    await client.query(`
      CREATE TABLE IF NOT EXISTS financeiro (
        id SERIAL PRIMARY KEY,
        contrato_id INTEGER NOT NULL,
        tipo_movimento VARCHAR(10) NOT NULL CHECK (tipo_movimento IN ('entrada', 'saida')),
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(12,2) NOT NULL,
        forma_pagamento VARCHAR(20) CHECK (forma_pagamento IN ('pix', 'cartao_credito', 'boleto', 'dinheiro')),
        data_vencimento DATE,
        data_pagamento DATE,
        status VARCHAR(20) DEFAULT 'em_aberto' CHECK (status IN ('em_aberto', 'pago', 'atrasado', 'cancelado')),
        numero_parcela INTEGER,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contrato_id) REFERENCES contratos(id) ON DELETE RESTRICT
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_financeiro_updated_at ON financeiro;
      CREATE TRIGGER update_financeiro_updated_at 
        BEFORE UPDATE ON financeiro 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Reuniões
    await client.query(`
      CREATE TABLE IF NOT EXISTS reunioes (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        data_reuniao DATE NOT NULL,
        horario_inicio TIME,
        horario_fim TIME,
        duracao_minutos INTEGER,
        tipo VARCHAR(20) DEFAULT 'presencial' CHECK (tipo IN ('presencial', 'online', 'telefone')),
        link_reuniao VARCHAR(500),
        ata_reuniao TEXT,
        participantes JSONB,
        status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_reunioes_updated_at ON reunioes;
      CREATE TRIGGER update_reunioes_updated_at 
        BEFORE UPDATE ON reunioes 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tipos de Escopo
    await client.query(`
      CREATE TABLE IF NOT EXISTS tipos_escopo (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        cor_hex VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_tipos_escopo_updated_at ON tipos_escopo;
      CREATE TRIGGER update_tipos_escopo_updated_at 
        BEFORE UPDATE ON tipos_escopo 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Escopos Funcionais
    await client.query(`
      CREATE TABLE IF NOT EXISTS escopos_funcionais (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER NOT NULL,
        tipo_escopo_id INTEGER NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        data_inicio DATE,
        data_alvo DATE,
        status VARCHAR(20) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')),
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
        FOREIGN KEY (tipo_escopo_id) REFERENCES tipos_escopo(id) ON DELETE RESTRICT
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_escopos_funcionais_updated_at ON escopos_funcionais;
      CREATE TRIGGER update_escopos_funcionais_updated_at 
        BEFORE UPDATE ON escopos_funcionais 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Funcionalidades
    await client.query(`
      CREATE TABLE IF NOT EXISTS funcionalidades (
        id SERIAL PRIMARY KEY,
        escopo_funcional_id INTEGER NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        data_inicio DATE,
        data_alvo DATE,
        status VARCHAR(20) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')),
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (escopo_funcional_id) REFERENCES escopos_funcionais(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_funcionalidades_updated_at ON funcionalidades;
      CREATE TRIGGER update_funcionalidades_updated_at 
        BEFORE UPDATE ON funcionalidades 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Subfuncionalidades
    await client.query(`
      CREATE TABLE IF NOT EXISTS subfuncionalidades (
        id SERIAL PRIMARY KEY,
        funcionalidade_id INTEGER NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        data_inicio DATE,
        data_alvo DATE,
        status VARCHAR(20) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')),
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (funcionalidade_id) REFERENCES funcionalidades(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_subfuncionalidades_updated_at ON subfuncionalidades;
      CREATE TRIGGER update_subfuncionalidades_updated_at 
        BEFORE UPDATE ON subfuncionalidades 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Subitens
    await client.query(`
      CREATE TABLE IF NOT EXISTS subitens (
        id SERIAL PRIMARY KEY,
        subfuncionalidade_id INTEGER NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        data_inicio DATE,
        data_alvo DATE,
        status VARCHAR(20) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')),
        horas_estimadas DECIMAL(10,2),
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subfuncionalidade_id) REFERENCES subfuncionalidades(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_subitens_updated_at ON subitens;
      CREATE TRIGGER update_subitens_updated_at 
        BEFORE UPDATE ON subitens 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Cronograma Entregas
    await client.query(`
      CREATE TABLE IF NOT EXISTS cronograma_entregas (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER NOT NULL,
        fase_numero INTEGER NOT NULL,
        nome_fase VARCHAR(255) NOT NULL,
        descricao TEXT,
        data_inicio DATE,
        data_alvo DATE,
        status VARCHAR(20) DEFAULT 'nao_iniciada' CHECK (status IN ('nao_iniciada', 'em_andamento', 'concluida', 'atrasada')),
        progresso_percentual DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_cronograma_entregas_updated_at ON cronograma_entregas;
      CREATE TRIGGER update_cronograma_entregas_updated_at 
        BEFORE UPDATE ON cronograma_entregas 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Cronograma Itens
    await client.query(`
      CREATE TABLE IF NOT EXISTS cronograma_itens (
        id SERIAL PRIMARY KEY,
        cronograma_entrega_id INTEGER NOT NULL,
        item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('escopo_funcional', 'funcionalidade', 'subfuncionalidade', 'subitem')),
        item_id INTEGER NOT NULL,
        data_inicio DATE,
        data_alvo DATE,
        status VARCHAR(20) DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_andamento', 'concluido')),
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cronograma_entrega_id) REFERENCES cronograma_entregas(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_cronograma_itens_updated_at ON cronograma_itens;
      CREATE TRIGGER update_cronograma_itens_updated_at 
        BEFORE UPDATE ON cronograma_itens 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tarefas
    await client.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER NOT NULL,
        subitem_id INTEGER,
        cronograma_item_id INTEGER,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        status VARCHAR(20) DEFAULT 'nao_iniciada' CHECK (status IN ('nao_iniciada', 'em_andamento', 'concluida', 'cancelada')),
        prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
        data_inicio DATE,
        data_alvo DATE,
        data_conclusao DATE,
        horas_estimadas DECIMAL(10,2),
        horas_trabalhadas DECIMAL(10,2) DEFAULT 0,
        responsavel VARCHAR(255),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
        FOREIGN KEY (subitem_id) REFERENCES subitens(id) ON DELETE SET NULL,
        FOREIGN KEY (cronograma_item_id) REFERENCES cronograma_itens(id) ON DELETE SET NULL
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_tarefas_updated_at ON tarefas;
      CREATE TRIGGER update_tarefas_updated_at 
        BEFORE UPDATE ON tarefas 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Tecnologias
    await client.query(`
      CREATE TABLE IF NOT EXISTS tecnologias (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        categoria VARCHAR(50),
        versao VARCHAR(20),
        descricao TEXT,
        cor_hex VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_tecnologias_updated_at ON tecnologias;
      CREATE TRIGGER update_tecnologias_updated_at 
        BEFORE UPDATE ON tecnologias 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Projeto Tecnologias
    await client.query(`
      CREATE TABLE IF NOT EXISTS projeto_tecnologias (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER NOT NULL,
        tecnologia_id INTEGER NOT NULL,
        versao_usada VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
        FOREIGN KEY (tecnologia_id) REFERENCES tecnologias(id) ON DELETE CASCADE
      )
    `);

    // Templates Contrato
    await client.query(`
      CREATE TABLE IF NOT EXISTS templates_contrato (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        conteudo_html TEXT,
        variaveis_disponiveis JSONB,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_templates_contrato_updated_at ON templates_contrato;
      CREATE TRIGGER update_templates_contrato_updated_at 
        BEFORE UPDATE ON templates_contrato 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Criar índices para performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projetos_cliente ON projetos(cliente_id);
      CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
      CREATE INDEX IF NOT EXISTS idx_tarefas_projeto ON tarefas(projeto_id);
      CREATE INDEX IF NOT EXISTS idx_tarefas_subitem ON tarefas(subitem_id);
      CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
      CREATE INDEX IF NOT EXISTS idx_financeiro_contrato ON financeiro(contrato_id);
      CREATE INDEX IF NOT EXISTS idx_financeiro_status ON financeiro(status);
      CREATE INDEX IF NOT EXISTS idx_cronograma_projeto ON cronograma_entregas(projeto_id);
    `);

    console.log('✅ Migração do Supabase concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Executar migração se chamado diretamente
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('🎉 Banco de dados Supabase configurado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na configuração do banco:', error);
      process.exit(1);
    });
}

module.exports = { createTables }; 