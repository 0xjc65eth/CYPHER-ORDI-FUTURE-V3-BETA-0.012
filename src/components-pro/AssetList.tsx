/**
 * AssetList Component
 * 
 * Componente para exibir uma lista de ativos com opções de filtragem,
 * classificação e visualização detalhada.
 */

import React, { useState, useEffect } from 'react';
import { formatCurrency, formatPercentage, formatAddress } from '../utils/formatters';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: 'bitcoin' | 'ordinal' | 'rune';
  balance: number;
  value: number;
  change24h: number;
  imageUrl?: string;
}

interface AssetListProps {
  assets?: Asset[];
  isLoading?: boolean;
  onAssetSelect?: (asset: Asset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  assets = [],
  isLoading = false,
  onAssetSelect
}) => {
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [sortField, setSortField] = useState<keyof Asset>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Aplicar filtros e ordenação
    let result = [...assets];
    
    // Filtrar por tipo
    if (filter !== 'all') {
      result = result.filter(asset => asset.type === filter);
    }
    
    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        asset => 
          asset.name.toLowerCase().includes(term) || 
          asset.symbol.toLowerCase().includes(term) ||
          asset.id.toLowerCase().includes(term)
      );
    }
    
    // Ordenar
    result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      // Assumir que são números
      const numA = fieldA as number;
      const numB = fieldB as number;
      
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });
    
    setFilteredAssets(result);
  }, [assets, filter, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof Asset) => {
    if (field === sortField) {
      // Inverter direção se o mesmo campo
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Novo campo, definir direção padrão
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field: keyof Asset) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Assets</h2>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search assets..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Assets</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="ordinal">Ordinals</option>
              <option value="rune">Runes</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Asset {renderSortIcon('name')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('balance')}
              >
                Balance {renderSortIcon('balance')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('value')}
              >
                Value {renderSortIcon('value')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('change24h')}
              >
                24h Change {renderSortIcon('change24h')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No assets found
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr 
                  key={asset.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => onAssetSelect && onAssetSelect(asset)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {asset.imageUrl && (
                        <img 
                          src={asset.imageUrl} 
                          alt={asset.name} 
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {asset.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {asset.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {asset.type === 'bitcoin' 
                        ? `${asset.balance.toFixed(8)} BTC`
                        : asset.balance.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {asset.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(asset.value)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      asset.change24h > 0 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {formatPercentage(asset.change24h)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetList;
