import { useState, useMemo } from 'react';
import { format, subDays, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Transaction } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  Search,
  Receipt,
  Calendar as CalendarIcon,
  User,
  Printer,
  TrendingUp,
  DollarSign,
  ChevronDown,
  Package
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart,
  Line,
  ResponsiveContainer 
} from 'recharts';

import { StoreSettings } from '@/types';

interface TransactionsPageProps {
  transactions: Transaction[];
  settings: StoreSettings;
}

export function TransactionsPage({ transactions, settings }: TransactionsPageProps) {
  const [search, setSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [isSelectingRange, setIsSelectingRange] = useState(false);

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

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
      const inDateRange = isWithinInterval(txDate, { start: dateRange.from, end: dateRange.to });
      const searchLower = search.toLowerCase();
      const matchesSearch = (
        tx.id.includes(search) ||
        tx.customer?.name?.toLowerCase().includes(searchLower) ||
        tx.items.some(item => item.name.toLowerCase().includes(searchLower))
      );
      return inDateRange && matchesSearch;
    });
  }, [transactions, dateRange, search]);

  // Calculate daily chart data
  const chartData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    
    return days.map(day => {
      const dayTransactions = filteredTransactions.filter(tx => {
        const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
        return txDate.toDateString() === day.toDateString();
      });
      
      const dailySales = dayTransactions.reduce((sum, tx) => sum + tx.total, 0);
      const dailyDiscounts = dayTransactions.reduce((sum, tx) => sum + tx.totalDiscount, 0);
      const dailyProfit = dailySales - dailyDiscounts;
      
      return {
        date: format(day, 'dd MMM', { locale: id }),
        fullDate: day,
        sales: dailySales,
        profit: dailyProfit,
        transactions: dayTransactions.length
      };
    });
  }, [filteredTransactions, dateRange]);

  // Calculate totals
  const totalRevenue = filteredTransactions.reduce((sum, tx) => sum + tx.total, 0);
  const totalProfit = filteredTransactions.reduce((sum, tx) => sum + (tx.total - tx.totalDiscount), 0);
  const totalTransactions = filteredTransactions.length;

  // Calculate product sales data - group by product name
  const productSalesData = useMemo(() => {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    filteredTransactions.forEach(tx => {
      tx.items.forEach(item => {
        const productName = item.name.trim();
        const existing = productMap.get(productName);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          productMap.set(productName, {
            name: productName,
            quantity: item.quantity,
            revenue: item.price * item.quantity
          });
        }
      });
    });
    
    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity) // Sort by quantity sold
      .slice(0, 10); // Top 10 products
  }, [filteredTransactions]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        <p className="text-muted-foreground text-sm">
          {totalTransactions} transaksi
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Penjualan</p>
          <p className="text-xl font-bold text-primary">{formatPrice(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">{totalTransactions} transaksi</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Laba</p>
          <p className="text-xl font-bold text-green-600">{formatPrice(totalProfit)}</p>
          <p className="text-xs text-muted-foreground">{formatPrice(totalRevenue - totalProfit)} diskon</p>
        </Card>
      </div>

      {/* Date Range & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[240px] justify-start">
              <CalendarIcon className="h-4 w-4" />
              <span className="flex-1 text-left">
                {dateRange.from ? format(dateRange.from, 'dd MMM yyyy', { locale: id }) : ''} - {dateRange.to ? format(dateRange.to, 'dd MMM yyyy', { locale: id }) : ''}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover border shadow-lg z-50" align="end">
            <div className="bg-background rounded-md border p-1">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to
                }}
                onSelect={(range) => {
                  if (!range) return;
                  
                  if (!isSelectingRange) {
                    // Klik pertama - mulai range baru
                    setDateRange({ from: range.from, to: range.from });
                    setIsSelectingRange(true);
                  } else {
                    // Klik kedua - selesaikan range
                    if (range.to) {
                      // Pastikan from selalu <= to
                      const from = range.from <= range.to ? range.from : range.to;
                      const to = range.from <= range.to ? range.to : range.from;
                      setDateRange({ from, to });
                    } else {
                      // Jika klik tanggal yang sama atau sebelum from
                      setDateRange({ from: range.from, to: range.from });
                    }
                    setIsSelectingRange(false);
                  }
                }}
                numberOfMonths={2}
                className="rounded-md border-none"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Charts */}
      <div className="space-y-4">
        {/* Sales Chart */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Grafik Penjualan Harian</h3>
          </div>
          <ChartContainer config={{ sales: { label: 'Penjualan', color: 'hsl(var(--primary))' } }} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatPrice(value).split(',')[0]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]} fill="var(--color-sales)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

{/* Profit Chart */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold">Grafik Laba Harian</h3>
        </div>
        <ChartContainer config={{ profit: { label: 'Laba', color: 'hsl(142, 76%, 36%)' } }} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatPrice(value).split(',')[0]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="var(--color-profit)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-profit)', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      {/* Product Sales Chart */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold">Produk Terlaris</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {productSalesData.length > 0 ? `Top ${productSalesData.length} produk` : 'Belum ada data'}
          </span>
        </div>
        {productSalesData.length > 0 ? (
          <ChartContainer 
            config={{ 
              quantity: { label: 'Jumlah Terjual', color: 'hsl(var(--primary))' }
            }} 
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productSalesData} margin={{ left: 10, right: 10, bottom: 60 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  height={60}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold text-sm mb-1">{data.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Terjual: <span className="font-medium text-foreground">{data.quantity} pcs</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total: <span className="font-medium text-primary">{formatPrice(data.revenue)}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="quantity" radius={[4, 4, 0, 0]} fill="var(--color-quantity)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada penjualan produk</p>
              <p className="text-xs">Data akan muncul setelah ada transaksi</p>
            </div>
          </div>
        )}
      </Card>

      {/* Product Sales Summary Table */}
      {productSalesData.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Detail Penjualan Produk</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Produk</th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-muted-foreground">Jumlah</th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-muted-foreground">Total Penjualan</th>
                </tr>
              </thead>
              <tbody>
                {productSalesData.map((product, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm font-semibold">{product.quantity}</span>
                      <span className="text-xs text-muted-foreground ml-1">pcs</span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm font-semibold text-primary">{formatPrice(product.revenue)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
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
                    <CalendarIcon className="h-3 w-3" />
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
        settings={settings}
      />
    </div>
  );
}
