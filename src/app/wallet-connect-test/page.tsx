'use client';

import React, { useState } from 'react';
import WalletConnectButton from '../../components/Dashboard/WalletConnectButton';

export default function WalletConnectTestPage() {
  const [walletData, setWalletData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Aguardando conexão...');

  const handleWalletConnect = (data) => {
    setWalletData(data);
    setConnectionStatus('Carteira conectada com sucesso!');
    console.log('Dados da carteira recebidos:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Teste do WalletConnectButton
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Teste de integração do componente de conexão de carteira Bitcoin
          </p>
        </div>

        {/* Status da Conexão */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Status da Conexão
          </h2>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${walletData ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-gray-700 dark:text-gray-300">{connectionStatus}</span>
          </div>
        </div>

        {/* Grid Layout Responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Componente WalletConnectButton */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Componente WalletConnectButton
              </h2>
              
              <WalletConnectButton 
                onConnect={handleWalletConnect}
                className="w-full"
              />
            </div>

            {/* Informações Técnicas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Funcionalidades Implementadas
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Estados de loading, connected, error</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Integração com BitcoinWalletConnect service</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Busca paralela de dados (balance, ordinals, runes)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Interface responsiva com Tailwind CSS</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Callback onConnect para comunicação</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Suporte a Xverse, Unisat e Sats Connect</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Persistência de dados no localStorage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Tratamento de erros e estados de loading</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Dados da Carteira */}
          <div className="space-y-6">
            {walletData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Dados da Carteira Conectada
                </h3>
                
                {/* Endereços */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Endereços:</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-500">Payment: </span>
                      <span className="font-mono text-xs break-all">{walletData.addresses?.payment}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Ordinals: </span>
                      <span className="font-mono text-xs break-all">{walletData.addresses?.ordinals}</span>
                    </div>
                  </div>
                </div>

                {/* Saldo */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Saldo Bitcoin:</h4>
                  <div className="space-y-1 text-sm">
                    <div>Total: {(walletData.balance?.total / 100000000).toFixed(8)} BTC</div>
                    <div>Confirmado: {(walletData.balance?.confirmed / 100000000).toFixed(8)} BTC</div>
                    <div>Não confirmado: {(walletData.balance?.unconfirmed / 100000000).toFixed(8)} BTC</div>
                  </div>
                </div>

                {/* Ordinals */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Ordinals:</h4>
                  <div className="text-sm">
                    {walletData.ordinals?.length || 0} NFTs encontrados
                  </div>
                </div>

                {/* Runes */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Runes:</h4>
                  <div className="text-sm">
                    {walletData.runes?.length || 0} tokens encontrados
                  </div>
                  {walletData.runes?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {walletData.runes.slice(0, 3).map((rune, index) => (
                        <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                          {rune.name}: {rune.balance}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  Última atualização: {new Date(walletData.timestamp).toLocaleString()}
                </div>
              </div>
            )}

            {/* Instruções */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
                Como Testar
              </h3>
              <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li>1. Instale uma carteira Bitcoin (Xverse ou Unisat)</li>
                <li>2. Configure a carteira com uma conta Bitcoin</li>
                <li>3. Clique em "Conectar Carteira Bitcoin"</li>
                <li>4. Autorize a conexão na carteira</li>
                <li>5. Observe os dados sendo carregados em paralelo</li>
              </ol>
            </div>

            {/* Debug Info */}
            {walletData && (
              <details className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                  Debug: JSON da Carteira
                </summary>
                <pre className="mt-2 text-xs overflow-auto max-h-64 text-gray-600 dark:text-gray-400">
                  {JSON.stringify(walletData, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}