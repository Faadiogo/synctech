# 🚀 Guia de Configuração do Supabase

Este guia te ajudará a configurar o Supabase para o projeto SyncTech.

## 1. Criando Conta e Projeto

### 1.1 Criar Conta
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub, Google ou email

### 1.2 Criar Organização
1. Clique em "New organization"
2. Digite o nome (ex: "SyncTech")
3. Escolha o plano Free (suficiente para desenvolvimento)

### 1.3 Criar Projeto
1. Clique em "New project"
2. Selecione sua organização
3. Configure:
   - **Name**: synctech-backend
   - **Database Password**: Gere uma senha forte (anote!)
   - **Region**: São Paulo (South America)
4. Clique em "Create new project"
5. ⏳ Aguarde 2-3 minutos para o projeto ser criado

## 2. Obtendo Credenciais

### 2.1 URL e Chave Pública
1. No dashboard do projeto, vá em **Settings** > **API**
2. Copie:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1...`

### 2.2 Credenciais de Conexão Direta
1. Vá em **Settings** > **Database**
2. Na seção "Connection info", copie:
   - **Host**: `xxx.pooler.supabase.com`
   - **Database**: `postgres`
   - **Username**: `postgres.xxx`
   - **Password**: *(a senha que você criou)*
   - **Port**: `5432`

## 3. Configuração Local

### 3.1 Arquivo .env
Crie o arquivo `.env` baseado no `.env.example`:

```env
# Configuração da Aplicação
PORT=3001
NODE_ENV=development

# Configuração do Supabase
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_AQUI

# Configuração direta do PostgreSQL
SUPABASE_HOST=SEU_HOST.pooler.supabase.com
SUPABASE_PORT=5432
SUPABASE_DATABASE=postgres
SUPABASE_USER=postgres.SEU_USUARIO
SUPABASE_PASSWORD=SUA_SENHA_AQUI

# JWT Secret
JWT_SECRET=uma-chave-secreta-super-segura-aqui
```

### 3.2 Instalar Dependências
```bash
npm install
```

### 3.3 Executar Migrações
```bash
npm run migrate
```

## 4. Verificação

### 4.1 Teste de Conexão
```bash
npm run dev
```

Você deve ver:
```
✅ Conexão com Supabase estabelecida
🚀 Servidor rodando na porta 3001
```

### 4.2 Verificar Tabelas no Supabase
1. No dashboard, vá em **Table Editor**
2. Você deve ver todas as tabelas criadas:
   - clientes
   - projetos
   - orcamentos
   - contratos
   - financeiro
   - etc.

## 5. Recursos Avançados

### 5.1 Dashboard do Banco
- **Table Editor**: Visualizar/editar dados
- **SQL Editor**: Executar queries personalizadas
- **Database**: Logs e performance

### 5.2 API Automática
O Supabase gera automaticamente uma API REST:
- **Base URL**: `https://SEU_PROJETO.supabase.co/rest/v1/`
- **Headers necessários**:
  ```
  apikey: SUA_CHAVE_ANONIMA
  Authorization: Bearer SUA_CHAVE_ANONIMA
  ```

### 5.3 Real-time (Opcional)
Para receber updates em tempo real:
```javascript
const { supabase } = require('./config/database');

supabase
  .channel('projetos-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'projetos' },
    (payload) => console.log('Projeto atualizado:', payload)
  )
  .subscribe();
```

## 6. Backup e Segurança

### 6.1 Backups Automáticos
- Plano Free: Backup diário por 7 dias
- Plano Pro: Backup point-in-time

### 6.2 Políticas de Segurança (RLS)
Para produção, configure Row Level Security:
```sql
-- Habilitar RLS na tabela clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Política de exemplo (apenas usuários autenticados)
CREATE POLICY "Usuários podem ver clientes" ON clientes
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 7. Troubleshooting

### Erro de Conexão
- ✅ Verifique se as credenciais estão corretas
- ✅ Confirme se o projeto Supabase está ativo
- ✅ Teste conectividade de rede

### Erro de Migração
- ✅ Verifique se o usuário tem permissões de criação
- ✅ Confirme se não há tabelas conflitantes
- ✅ Execute `DROP TABLE IF EXISTS` se necessário

### Performance Lenta
- ✅ Use connection pooling (já configurado)
- ✅ Crie índices nas colunas mais consultadas
- ✅ Considere upgrade para região mais próxima

## 8. Próximos Passos

Após configuração:
1. ✅ Execute testes da API
2. ✅ Configure autenticação Supabase (opcional)
3. ✅ Implemente upload de arquivos com Supabase Storage
4. ✅ Configure monitoramento e alertas
5. ✅ Prepare ambiente de produção

---

💡 **Dica**: Mantenha suas credenciais seguras e nunca as commit no Git! 