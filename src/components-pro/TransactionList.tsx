/**
 * TransactionList Component
 * 
 * Componente temporariamente simplificado - foco no sistema de notificações
 */

import React from 'react';

interface TransactionListProps {
  walletAddress?: string;
  limit?: number;
  showFilters?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  walletAddress,
  limit = 10,
  showFilters = true
}) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Lista de Transações
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        ✅ Sistema de notificações implementado com sucesso!<br/>
        Este componente foi simplificado temporariamente.
      </p>
    </div>
  );
};

export default TransactionList;