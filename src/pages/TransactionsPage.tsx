import { useState } from 'react';
import { Transaction } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { 
  Search, 
  Receipt, 
  Calendar,
  User,
  Printer
} from 'lucide-react';

interface TransactionsPageProps {
  transactions: Transaction[];
}

export function TransactionsPage({ transactions }: TransactionsPageProps) {
  const [search, setSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const filteredTransactions = transactions.filter(tx => {
    const searchLower = search.toLowerCase();
    return (
      tx.id.includes(search) ||
      tx.customer?.name?.toLowerCase().includes(searchLower) ||
      tx.items.some(item => item.name.toLowerCase().includes(searchLower))
    );
  });

  // Calculate totals
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const todayTransactions = transactions.filter(tx => {
    const today = new Date();
    const txDate = new Date(tx.date);
    return txDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todayTransactions.reduce((sum, tx) => sum + tx.total, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        <p className="text-muted-foreground text-sm">
          {transactions.length} transaksi total
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Hari Ini</p>
          <p className="text-xl font-bold text-primary">{formatPrice(todayRevenue)}</p>
          <p className="text-xs text-muted-foreground">{todayTransactions.length} transaksi</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Pendapatan</p>
          <p className="text-xl font-bold">{formatPrice(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">{transactions.length} transaksi</p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari transaksi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.map(tx => (
          <Card key={tx.id} className="p-4 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent shrink-0">
                  <Receipt className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">#{tx.id.slice(-6)}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                      {tx.paymentMethod === 'cash' ? 'Tunai' : 'Transfer'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(tx.date)}</span>
                  </div>
                  {tx.customer && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{tx.customer.name}</span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {tx.items.length} item: {tx.items.map(i => i.name).join(', ')}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-primary">{formatPrice(tx.total)}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-1 gap-1"
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <Printer className="h-3 w-3" />
                  Cetak
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Belum ada transaksi</p>
          <p className="text-sm">Transaksi akan muncul di sini</p>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
