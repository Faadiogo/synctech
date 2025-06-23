-- =============================================================================
-- MIGRATION INICIAL
-- =============================================================================

-- 1. TABELAS BASE (sem dependências)
-- =============================================================================

-- Tabela de tipos/categorias (Frontend, Backend, etc.)
create table public.nivel1_tipos (
  id serial not null,
  nome character varying(100) not null,
  descricao text null,
  cor_hex character varying(7) null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  icon_name character varying(50) null default 'FolderTree'::character varying,
  constraint nivel1_tipos_pkey primary key (id)
) TABLESPACE pg_default;

create trigger update_nivel1_tipos_updated_at BEFORE
update on nivel1_tipos for EACH row
execute FUNCTION update_updated_at_column ();

-- Inserir tipos padrão
INSERT INTO nivel1_tipos (nome, descricao, cor_hex, icon_name) VALUES 
    ('Frontend', 'Desenvolvimento da interface do usuário', '#3B82F6', 'Monitor'),
    ('Backend', 'Desenvolvimento da lógica do servidor e Banco de Dados', '#10B981', 'Database'), 
    ('Integrações', 'Integrações com sistemas externos e APIs', '#F59E0B', 'Zap'),
    ('Automações', 'WebScraping, RPA Processos automatizados', '#8B5CF6', 'Settings'),
    ('Design', 'Criação, Vetorização e edição de logos e arquivos', '#EF4444', 'Palette'),
    ('Mobile', 'Desenvolvimento mobile', '#06B6D4', 'Smartphone'),
    ('DevOps', 'Infraestrutura e deploy', '#EC4899', 'Code'),
    ('Testes', 'Testes e qualidade de software', '#EAB308', 'Check');

create table public.tecnologias (
  id serial not null,
  nome character varying(100) not null,
  categoria character varying(50) null,
  versao character varying(20) null,
  descricao text null,
  cor_hex character varying(7) null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint tecnologias_pkey primary key (id)
) TABLESPACE pg_default;

create trigger update_tecnologias_updated_at BEFORE
update on tecnologias for EACH row
execute FUNCTION update_updated_at_column ();

create table public.templates_contrato (
  id serial not null,
  nome character varying(255) not null,
  conteudo_html text null,
  variaveis_disponiveis jsonb null,
  ativo boolean null default true,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint templates_contrato_pkey primary key (id)
) TABLESPACE pg_default;

create trigger update_templates_contrato_updated_at BEFORE
update on templates_contrato for EACH row
execute FUNCTION update_updated_at_column ();

-- 2. CLIENTES (base para projetos)
-- =============================================================================

create table public.clientes (
  id serial not null,
  tipo_pessoa character varying(2) not null,
  nome_empresa character varying(255) null,
  nome_completo character varying(255) null,
  representante_legal character varying(255) null,
  razao_social character varying(255) null,
  cpf character varying(14) null,
  cnpj character varying(18) null,
  cep character varying(10) null,
  numero character varying(20) null,
  endereco text null,
  cidade character varying(100) null,
  uf character varying(2) null,
  telefone character varying(20) null,
  email character varying(255) null,
  observacoes text null,
  ativo boolean null default true,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  foto_url text null,
  constraint clientes_pkey primary key (id),
  constraint clientes_tipo_pessoa_check check (
    (tipo_pessoa)::text = any (array['PF'::character varying, 'PJ'::character varying]::text[])
  )
) TABLESPACE pg_default;

create trigger update_clientes_updated_at BEFORE
update on clientes for EACH row
execute FUNCTION update_updated_at_column ();

-- 3. PROJETOS (dependem de clientes)
-- =============================================================================

create table public.projetos (
  id serial not null,
  cliente_id integer not null,
  nome character varying(255) not null,
  descricao text null,
  tecnologias jsonb null,
  status character varying(50) not null default 'nao_iniciado'::character varying,
  data_inicio date null,
  data_alvo date null,
  data_conclusao date null,
  horas_estimadas numeric(10, 2) null,
  horas_trabalhadas numeric(10, 2) null default 0,
  valor_estimado numeric(12, 2) null,
  progresso numeric(5, 2) null default 0,
  observacoes text null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint projetos_pkey primary key (id),
  constraint projetos_cliente_id_fkey foreign KEY (cliente_id) references clientes (id) on delete RESTRICT,
  constraint projetos_status_check check (
    (status)::text = any (
      array[
        'nao_iniciado'::character varying,
        'planejamento'::character varying,
        'apresentado'::character varying,
        'orcamento_entregue'::character varying,
        'orcamento_aprovado'::character varying,
        'contrato_assinado'::character varying,
        'entregue'::character varying,
        'suporte_garantia'::character varying,
        'concluido'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_projetos_cliente on public.projetos using btree (cliente_id) TABLESPACE pg_default;
create index IF not exists idx_projetos_status on public.projetos using btree (status) TABLESPACE pg_default;
create index IF not exists idx_projetos_data_alvo on public.projetos using btree (data_alvo) TABLESPACE pg_default;

create trigger update_projetos_updated_at BEFORE
update on projetos for EACH row
execute FUNCTION update_updated_at_column ();

-- 4. ESCOPOS FUNCIONAIS (dependem apenas de projetos)
-- =============================================================================

create table public.escopos_funcionais (
  id serial not null,
  projeto_id integer not null,
  nome character varying(255) not null,
  descricao text null,
  data_inicio date null,
  data_alvo date null,
  status character varying(20) null default 'planejado'::character varying,
  ordem integer null default 0,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint escopos_funcionais_pkey primary key (id),
  constraint escopos_funcionais_projeto_id_fkey foreign KEY (projeto_id) references projetos (id) on delete CASCADE,
  constraint escopos_funcionais_status_check check (
    (status)::text = any (
      array[
        'planejado'::character varying,
        'em_andamento'::character varying,
        'concluido'::character varying,
        'cancelado'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

create trigger update_escopos_funcionais_updated_at BEFORE
update on escopos_funcionais for EACH row
execute FUNCTION update_updated_at_column ();

-- 5. HIERARQUIA CORRIGIDA (nivel1 depende do escopo)
-- =============================================================================

-- NIVEL 1: Agora depende do escopo funcional E referencia o tipo
create table public.nivel1 (
  id serial not null,
  escopo_funcional_id integer not null,
  nivel1_tipo_id integer not null,
  nome character varying(255) null, -- nome específico para este projeto (opcional)
  descricao text null,
  data_inicio date null,
  data_alvo date null,
  status character varying(20) null default 'planejado'::character varying,
  ordem integer null default 0,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint nivel1_pkey primary key (id),
  constraint nivel1_escopo_funcional_id_fkey foreign KEY (escopo_funcional_id) references escopos_funcionais (id) on delete CASCADE,
  constraint nivel1_nivel1_tipo_id_fkey foreign KEY (nivel1_tipo_id) references nivel1_tipos (id) on delete RESTRICT,
  constraint nivel1_status_check check (
    (status)::text = any (
      array[
        'planejado'::character varying,
        'em_andamento'::character varying,
        'concluido'::character varying,
        'cancelado'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

create trigger update_nivel1_updated_at BEFORE
update on nivel1 for EACH row
execute FUNCTION update_updated_at_column ();

-- NIVEL 2: Depende do nivel1
create table public.nivel2 (
  id serial not null,
  nivel1_id integer not null,
  nome character varying(255) not null,
  descricao text null,
  data_inicio date null,
  data_alvo date null,
  status character varying(20) null default 'planejado'::character varying,
  ordem integer null default 0,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint nivel2_pkey primary key (id),
  constraint nivel2_nivel1_id_fkey foreign KEY (nivel1_id) references nivel1 (id) on delete CASCADE,
  constraint nivel2_status_check check (
    (status)::text = any (
      array[
        'planejado'::character varying,
        'em_andamento'::character varying,
        'concluido'::character varying,
        'cancelado'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

create trigger update_nivel2_updated_at BEFORE
update on nivel2 for EACH row
execute FUNCTION update_updated_at_column ();

-- NIVEL 3: Depende do nivel2
create table public.nivel3 (
  id serial not null,
  nivel2_id integer not null,
  nome character varying(255) not null,
  descricao text null,
  data_inicio date null,
  data_alvo date null,
  status character varying(20) null default 'planejado'::character varying,
  ordem integer null default 0,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint nivel3_pkey primary key (id),
  constraint nivel3_nivel2_id_fkey foreign KEY (nivel2_id) references nivel2 (id) on delete CASCADE,
  constraint nivel3_status_check check (
    (status)::text = any (
      array[
        'planejado'::character varying,
        'em_andamento'::character varying,
        'concluido'::character varying,
        'cancelado'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

create trigger update_nivel3_updated_at BEFORE
update on nivel3 for EACH row
execute FUNCTION update_updated_at_column ();

-- NIVEL 4: Depende do nivel3
create table public.nivel4 (
  id serial not null,
  nivel3_id integer not null,
  nome character varying(255) not null,
  descricao text null,
  data_inicio date null,
  data_alvo date null,
  status character varying(20) null default 'planejado'::character varying,
  horas_estimadas numeric(10, 2) null,
  ordem integer null default 0,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint nivel4_pkey primary key (id),
  constraint nivel4_nivel3_id_fkey foreign KEY (nivel3_id) references nivel3 (id) on delete CASCADE,
  constraint nivel4_status_check check (
    (status)::text = any (
      array[
        'planejado'::character varying,
        'em_andamento'::character varying,
        'concluido'::character varying,
        'cancelado'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

create trigger update_nivel4_updated_at BEFORE
update on nivel4 for EACH row
execute FUNCTION update_updated_at_column ();

-- 6. ORÇAMENTOS (agora sem dependência direta do escopo)
-- =============================================================================

create table public.orcamentos (
  id serial not null,
  projeto_id integer not null,
  numero_orcamento serial not null,
  arquivo_pdf_path character varying(500) null,
  data_envio date null,
  data_validade date null,
  valor_total numeric(12, 2) null,
  desconto numeric(12, 2) null default 0,
  valor_final numeric(12, 2) null,
  status character varying(20) null default 'rascunho'::character varying,
  observacoes text null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint orcamentos_pkey primary key (id),
  constraint orcamentos_projeto_id_fkey foreign KEY (projeto_id) references projetos (id) on delete CASCADE,
  constraint orcamentos_status_check check (
    (status)::text = any (
      array[
        'rascunho'::character varying,
        'enviado'::character varying,
        'aprovado'::character varying,
        'recusado'::character varying,
        'expirado'::character varying
      ]::text[]
    )
  )
) TABLESPACE pg_default;

create trigger update_orcamentos_updated_at BEFORE
update on orcamentos for EACH row
execute FUNCTION update_updated_at_column ();

-- 6. CONTRATOS (dependem de clientes, projetos e orçamentos)
-- =============================================================================

create table public.contratos (
  id serial not null,
  projeto_id integer null,
  orcamento_id integer null,
  numero_contrato serial not null,
  valor_orcado numeric(12, 2) null,
  desconto numeric(12, 2) null default 0,
  valor_contrato numeric(12, 2) null,
  data_assinatura date null,
  qtd_parcelas integer null default 1,
  arquivo_pdf_path character varying(500) null,
  status character varying(20) null default 'ativo'::character varying,
  observacoes text null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint contratos_pkey primary key (id),
  constraint contratos_orcamento_id_fkey foreign KEY (orcamento_id) references orcamentos (id) on delete set null,
  constraint contratos_projeto_id_fkey foreign KEY (projeto_id) references projetos (id) on delete set null,
  constraint contratos_status_check check (
    (
      (status)::text = any (
        (
          array[
            'ativo'::character varying,
            'concluido'::character varying,
            'cancelado'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_contratos_updated_at BEFORE
update on contratos for EACH row
execute FUNCTION update_updated_at_column ();

-- 7. CRONOGRAMA (dependem de projetos)
-- =============================================================================

create table public.cronograma_entregas (
  id serial not null,
  projeto_id integer not null,
  fase_numero integer not null,
  nome_fase character varying(255) not null,
  descricao text null,
  data_inicio date null,
  data_alvo date null,
  status character varying(20) null default 'nao_iniciada'::character varying,
  progresso_percentual numeric(5, 2) null default 0,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint cronograma_entregas_pkey primary key (id),
  constraint cronograma_entregas_projeto_id_fkey foreign KEY (projeto_id) references projetos (id) on delete CASCADE,
  constraint cronograma_entregas_status_check check (
    (
      (status)::text = any (
        (
          array[
            'nao_iniciada'::character varying,
            'em_andamento'::character varying,
            'concluida'::character varying,
            'atrasada'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_cronograma_projeto on public.cronograma_entregas using btree (projeto_id) TABLESPACE pg_default;

create trigger update_cronograma_entregas_updated_at BEFORE
update on cronograma_entregas for EACH row
execute FUNCTION update_updated_at_column ();

create table public.cronograma_itens (
  id serial not null,
  cronograma_entrega_id integer not null,
  item_type character varying(30) not null,
  item_id integer not null,
  data_inicio date null,
  data_alvo date null,
  status character varying(20) null default 'nao_iniciado'::character varying,
  ordem integer null default 0,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint cronograma_itens_pkey primary key (id),
  constraint cronograma_itens_cronograma_entrega_id_fkey foreign KEY (cronograma_entrega_id) references cronograma_entregas (id) on delete CASCADE,
  constraint cronograma_itens_item_type_check check (
    (
      (item_type)::text = any (
        (
          array[
            'escopo_funcional'::character varying,
            'nivel2'::character varying,
            'nivel3'::character varying,
            'nivel4'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint cronograma_itens_status_check check (
    (
      (status)::text = any (
        (
          array[
            'nao_iniciado'::character varying,
            'em_andamento'::character varying,
            'concluido'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_cronograma_itens_updated_at BEFORE
update on cronograma_itens for EACH row
execute FUNCTION update_updated_at_column ();

-- 8. FINANCEIRO (depende de contratos)
-- =============================================================================

create table public.financeiro (
  id serial not null,
  contrato_id integer not null,
  tipo_movimento character varying(10) not null,
  descricao character varying(255) not null,
  valor numeric(12, 2) not null,
  forma_pagamento character varying(20) null,
  data_vencimento date null,
  data_pagamento date null,
  status character varying(20) null default 'em_aberto'::character varying,
  numero_parcela integer null,
  observacoes text null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint financeiro_pkey primary key (id),
  constraint financeiro_contrato_id_fkey foreign KEY (contrato_id) references contratos (id) on delete RESTRICT,
  constraint financeiro_forma_pagamento_check check (
    (
      (forma_pagamento)::text = any (
        (
          array[
            'pix'::character varying,
            'cartao_credito'::character varying,
            'boleto'::character varying,
            'dinheiro'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint financeiro_status_check check (
    (
      (status)::text = any (
        (
          array[
            'em_aberto'::character varying,
            'pago'::character varying,
            'atrasado'::character varying,
            'cancelado'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint financeiro_tipo_movimento_check check (
    (
      (tipo_movimento)::text = any (
        (
          array[
            'entrada'::character varying,
            'saida'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_financeiro_contrato on public.financeiro using btree (contrato_id) TABLESPACE pg_default;
create index IF not exists idx_financeiro_status on public.financeiro using btree (status) TABLESPACE pg_default;

create trigger update_financeiro_updated_at BEFORE
update on financeiro for EACH row
execute FUNCTION update_updated_at_column ();

-- 9. TAREFAS E REUNIÕES (dependem de projetos e cronograma)
-- =============================================================================
create table public.tarefas (
  id serial not null,
  projeto_id integer not null, -- redundância proposital para performance
  
  -- Referências polimórficas para qualquer nível
  origem_tipo character varying(20) not null, -- 'escopo_funcional', 'nivel1', 'nivel2', 'nivel3', 'nivel4'
  origem_id integer not null, -- ID da tabela de origem
  
  titulo character varying(255) not null,
  descricao text null,
  status character varying(20) null default 'nao_iniciada'::character varying,
  prioridade character varying(20) null default 'media'::character varying,
  
  -- Dados herdados automaticamente da origem
  data_inicio date null,
  data_alvo date null,
  data_conclusao date null,
  
  horas_estimadas numeric(10, 2) null,
  horas_trabalhadas numeric(10, 2) null default 0,
  responsavel character varying(255) null,
  observacoes text null,
  
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  
  constraint tarefas_pkey primary key (id),
  constraint tarefas_projeto_id_fkey foreign key (projeto_id) references projetos (id) on delete cascade,
  
  constraint tarefas_origem_tipo_check check (
    (origem_tipo)::text = any (
      array[
        'escopo_funcional'::character varying,
        'nivel1'::character varying,
        'nivel2'::character varying,
        'nivel3'::character varying,
        'nivel4'::character varying
      ]::text[]
    )
  ),
  
  constraint tarefas_prioridade_check check (
    (prioridade)::text = any (
      array[
        'baixa'::character varying,
        'media'::character varying,
        'alta'::character varying,
        'critica'::character varying
      ]::text[]
    )
  ),
  
  constraint tarefas_status_check check (
    (status)::text = any (
      array[
        'nao_iniciada'::character varying,
        'em_andamento'::character varying,
        'concluida'::character varying,
        'cancelada'::character varying
      ]::text[]
    )
  )
) tablespace pg_default;

-- Índices para performance
create index idx_tarefas_projeto on public.tarefas using btree (projeto_id);
create index idx_tarefas_origem on public.tarefas using btree (origem_tipo, origem_id);
create index idx_tarefas_status on public.tarefas using btree (status);
create index idx_tarefas_data_alvo on public.tarefas using btree (data_alvo);

create trigger update_tarefas_updated_at before
update on tarefas for each row
execute function update_updated_at_column();

-- =============================================================================
-- FUNÇÃO PARA CRIAR TAREFA A PARTIR DE QUALQUER NÍVEL
-- =============================================================================
create or replace function criar_tarefa_do_nivel(
  p_origem_tipo varchar(20),
  p_origem_id integer,
  p_titulo varchar(255),
  p_descricao text default null,
  p_responsavel varchar(255) default null,
  p_horas_estimadas numeric(10,2) default null
) returns integer as $$
declare
  v_projeto_id integer;
  v_data_inicio date;
  v_data_alvo date;
  v_tarefa_id integer;
begin
  -- Buscar dados da origem baseado no tipo
  case p_origem_tipo
    when 'escopo_funcional' then
      select ef.data_inicio, ef.data_alvo, p.id
      into v_data_inicio, v_data_alvo, v_projeto_id
      from escopos_funcionais ef
      join projetos p on ef.projeto_id = p.id
      where ef.id = p_origem_id;
      
    when 'nivel1' then
      select n1.data_inicio, n1.data_alvo, p.id
      into v_data_inicio, v_data_alvo, v_projeto_id
      from nivel1 n1
      join escopos_funcionais ef on n1.escopo_funcional_id = ef.id
      join projetos p on ef.projeto_id = p.id
      where n1.id = p_origem_id;
      
    when 'nivel2' then
      select n2.data_inicio, n2.data_alvo, p.id
      into v_data_inicio, v_data_alvo, v_projeto_id
      from nivel2 n2
      join nivel1 n1 on n2.nivel1_id = n1.id
      join escopos_funcionais ef on n1.escopo_funcional_id = ef.id
      join projetos p on ef.projeto_id = p.id
      where n2.id = p_origem_id;
      
    when 'nivel3' then
      select n3.data_inicio, n3.data_alvo, p.id
      into v_data_inicio, v_data_alvo, v_projeto_id
      from nivel3 n3
      join nivel2 n2 on n3.nivel2_id = n2.id
      join nivel1 n1 on n2.nivel1_id = n1.id
      join escopos_funcionais ef on n1.escopo_funcional_id = ef.id
      join projetos p on ef.projeto_id = p.id
      where n3.id = p_origem_id;
      
    when 'nivel4' then
      select n4.data_inicio, n4.data_alvo, p.id
      into v_data_inicio, v_data_alvo, v_projeto_id
      from nivel4 n4
      join nivel3 n3 on n4.nivel3_id = n3.id
      join nivel2 n2 on n3.nivel2_id = n2.id
      join nivel1 n1 on n2.nivel1_id = n1.id
      join escopos_funcionais ef on n1.escopo_funcional_id = ef.id
      join projetos p on ef.projeto_id = p.id
      where n4.id = p_origem_id;
      
    else
      raise exception 'Tipo de origem inválido: %', p_origem_tipo;
  end case;
  
  -- Verificar se encontrou o projeto
  if v_projeto_id is null then
    raise exception 'Não foi possível encontrar o projeto para %: %', p_origem_tipo, p_origem_id;
  end if;
  
  -- Inserir a tarefa
  insert into tarefas (
    projeto_id,
    origem_tipo,
    origem_id,
    titulo,
    descricao,
    data_inicio,
    data_alvo,
    responsavel,
    horas_estimadas
  ) values (
    v_projeto_id,
    p_origem_tipo,
    p_origem_id,
    p_titulo,
    p_descricao,
    v_data_inicio,
    v_data_alvo,
    p_responsavel,
    p_horas_estimadas
  ) returning id into v_tarefa_id;
  
  return v_tarefa_id;
end;
$$ language plpgsql;

create table public.reunioes (
  id serial not null,
  projeto_id integer not null,
  titulo character varying(255) not null,
  descricao text null,
  data_reuniao date not null,
  horario_inicio time without time zone null,
  horario_fim time without time zone null,
  duracao_minutos integer null,
  tipo character varying(20) null default 'presencial'::character varying,
  link_reuniao character varying(500) null,
  ata_reuniao text null,
  participantes jsonb null,
  status character varying(20) null default 'agendada'::character varying,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint reunioes_pkey primary key (id),
  constraint reunioes_projeto_id_fkey foreign KEY (projeto_id) references projetos (id) on delete CASCADE,
  constraint reunioes_status_check check (
    (
      (status)::text = any (
        (
          array[
            'agendada'::character varying,
            'realizada'::character varying,
            'cancelada'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint reunioes_tipo_check check (
    (
      (tipo)::text = any (
        (
          array[
            'presencial'::character varying,
            'online'::character varying,
            'telefone'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_reunioes_updated_at BEFORE
update on reunioes for EACH row
execute FUNCTION update_updated_at_column ();

-- 10. AUDITORIA
-- =============================================================================

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  changed_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =============================================================================

CREATE INDEX idx_clientes_tipo_pessoa ON clientes(tipo_pessoa);
CREATE INDEX idx_clientes_ativo ON clientes(ativo) WHERE ativo = true;
CREATE INDEX idx_contratos_status ON contratos(status);
CREATE INDEX idx_cronograma_status ON cronograma_entregas(status);
CREATE INDEX idx_nivel1_escopo_funcional ON nivel1(escopo_funcional_id);
CREATE INDEX idx_nivel1_tipo ON nivel1(nivel1_tipo_id);
CREATE INDEX idx_nivel2_nivel1 ON nivel2(nivel1_id);
CREATE INDEX idx_nivel3_nivel2 ON nivel3(nivel2_id);
CREATE INDEX idx_nivel4_nivel3 ON nivel4(nivel3_id);