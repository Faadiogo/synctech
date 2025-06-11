const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Cliente Supabase (para funcionalidades específicas)
const supabase = createClient(supabaseUrl, supabaseKey);

// Pool de conexões PostgreSQL direto com configuração otimizada para Supabase
const pool = new Pool({
  host: process.env.SUPABASE_HOST,
  port: parseInt(process.env.SUPABASE_PORT) || 6543, // Porta padrão do Supabase pooler
  database: process.env.SUPABASE_DATABASE,
  user: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5, // Reduzido ainda mais
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 15000, // Aumentado para 15s
  query_timeout: 60000, // Aumentado para 60s
  statement_timeout: 60000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
  application_name: 'synctech-backend'
});

// Função para testar conexão com mais detalhes
async function testConnection() {
  try {
    console.log('🔄 Testando conexão com Supabase...');
    console.log(`📡 Host: ${process.env.SUPABASE_HOST}`);
    console.log(`🔌 Porta: ${process.env.SUPABASE_PORT || 6543}`);
    console.log(`👤 User: ${process.env.SUPABASE_USER}`);
    console.log(`🗄️ Database: ${process.env.SUPABASE_DATABASE}`);
    
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida, testando query...');
    
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('⏰ Hora do servidor:', result.rows[0].current_time);
    console.log('🐘 Versão PostgreSQL:', result.rows[0].pg_version.split(' ')[0]);
    
    client.release();
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:');
    console.error('📝 Detalhes:', error.message);
    console.error('🔍 Código:', error.code);
    console.error('🔍 Stack:', error.stack?.split('\n')[0]);
    
    // Verificar variáveis de ambiente
    if (!process.env.SUPABASE_HOST) {
      console.error('🚨 SUPABASE_HOST não está definido no .env');
    }
    if (!process.env.SUPABASE_USER) {
      console.error('🚨 SUPABASE_USER não está definido no .env');
    }
    if (!process.env.SUPABASE_PASSWORD) {
      console.error('🚨 SUPABASE_PASSWORD não está definido no .env');
    }
    
    return false;
  }
}

// Função para executar queries
async function executeQuery(query, params = []) {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(query, params);
      
      // Para queries SELECT, retornar as rows
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        return result.rows;
      }
      
      // Para INSERT, UPDATE, DELETE retornar informações do resultado
      return {
        rowCount: result.rowCount,
        insertId: result.rows[0]?.id, // Para INSERTs com RETURNING id
        affectedRows: result.rowCount,
        ...result
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
}

// Função para executar transações
async function executeTransaction(queries) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const { query, params } of queries) {
      const result = await client.query(query, params || []);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Função para usar Supabase client (para funcionalidades específicas)
function getSupabaseClient() {
  return supabase;
}

// Tratar eventos de erro do pool
pool.on('error', (err, client) => {
  console.error('❌ Erro inesperado no pool de conexões:', err);
});

module.exports = {
  pool,
  supabase,
  testConnection,
  executeQuery,
  executeTransaction,
  getSupabaseClient
}; 