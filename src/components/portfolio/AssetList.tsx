/**
 * Asset List Component
 * 
 * This component displays a list of assets in the user's portfolio
 * with details like name, quantity, value, and price.
 */

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui';
import { Asset, AssetType } from '@/services/portfolio-service';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Bitcoin, CircleDollarSign, Gem } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
}

export function AssetList({ assets }: AssetListProps) {
  // Sort assets by value (highest first)
  const sortedAssets = [...assets].sort((a, b) => b.value - a.value);

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case AssetType.BITCOIN:
        return <Bitcoin className="h-5 w-5 text-[#F7931A]" />;
      case AssetType.ORDINAL:
        return <Gem className="h-5 w-5 text-[#6F4E37]" />;
      case AssetType.RUNE:
        return <CircleDollarSign className="h-5 w-5 text-[#9945FF]" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Assets</h2>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAssets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No assets found
              </TableCell>
            </TableRow>
          ) : (
            sortedAssets.map((asset) => (
              <TableRow key={`${asset.id}-${asset.location}`}>
                <TableCell>
                  {getAssetIcon(asset.type)}
                </TableCell>
                <TableCell className="font-medium">
                  <div>{asset.name}</div>
                  {asset.symbol && (
                    <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                  )}
                </TableCell>
                <TableCell>
                  {formatNumber(parseFloat(asset.quantity))}
                </TableCell>
                <TableCell>
                  <div>{formatCurrency(asset.priceUsd)}</div>
                  {asset.priceBtc && asset.type !== AssetType.BITCOIN && (
                    <div className="text-xs text-muted-foreground">
                      {formatNumber(asset.priceBtc)} BTC
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(asset.value)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
