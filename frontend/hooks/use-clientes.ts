import { useState, useEffect } from 'react';
import { clientesService } from '@/lib/services/clientes';
import { Cliente } from '@/lib/api';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientesService.listar({
        ativo: true,
        limit: 100
      });
      setClientes(response.data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError('Não foi possível carregar os clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  return {
    clientes,
    loading,
    error,
    reload: loadClientes
  };
} 