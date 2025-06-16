e /**
 * Transaction List Component
 * 
 * This component displays a list of transactions in the user's portfolio
 * with details like type, amount, date, and status.
 */

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Badge
} from '@/components/ui';
import { Transaction } from '@/services/wallet-connector';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
  Send
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'failed') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-5 w-5 text-orange-500" />;
      case 'receive':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case 'inscribe':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'transfer_ordinal':
      case 'transfer_rune':
        return <Send className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return null;
    }
  };

  const getTransactionLabel = (tx: Transaction) => {
    switch (tx.type) {
      case 'send':
        return `Sent Bitcoin${tx.to ? ` to ${tx.to.substring(0, 8)}...` : ''}`;
      case 'receive':
        return `Received Bitcoin${tx.from ? ` from ${tx.from.substring(0, 8)}...` : ''}`;
      case 'inscribe':
        return 'Inscribed Ordinal';
      case 'transfer_ordinal':
        return `Sent Ordinal${tx.to ? ` to ${tx.to.substring(0, 8)}...` : ''}`;
      case 'transfer_rune':
        return `Sent Rune${tx.to ? ` to ${tx.to.substring(0, 8)}...` : ''}`;
      default:
        return 'Transaction';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Transactions</h2>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            sortedTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  {getTransactionIcon(tx.type, tx.status)}
                </TableCell>
                <TableCell className="font-medium">
                  <div>{getTransactionLabel(tx)}</div>
                  <div className="text-xs text-muted-foreground">
                    {tx.id.substring(0, 10)}...
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(new Date(tx.timestamp))}
                </TableCell>
                <TableCell>
                  {tx.amount ? formatCurrency(tx.amount) : '-'}
                  {tx.runeAmount && (
                    <div className="text-xs text-muted-foreground">
                      {tx.runeAmount} {tx.runeId?.substring(0, 4)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(tx.status)}
                  {tx.confirmations && tx.confirmations > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {tx.confirmations} confirmations
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
