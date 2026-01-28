import { useState, useMemo } from 'react';
import { Customer, Transaction } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  User, 
  Phone, 
  Plus, 
  Edit2, 
  Trash2, 
  Receipt,
  ShoppingCart,
  X
} from 'lucide-react';

interface CustomersPageProps {
  customers: Customer[];
  transactions: Transaction[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer>;
  onUpdateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
}

export function CustomersPage({ 
  customers, 
  transactions, 
  onAddCustomer, 
  onUpdateCustomer, 
  onDeleteCustomer 
}: CustomersPageProps) {
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const searchLower = search.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchLower) ||
      c.phone?.toLowerCase().includes(searchLower)
    );
  }, [customers, search]);

  const getCustomerTransactions = (customerId: string) => {
    return transactions.filter(tx => tx.customer?.id === customerId);
  };

  const getCustomerStats = (customerId: string) => {
    const customerTx = getCustomerTransactions(customerId);
    const totalSpent = customerTx.reduce((sum, tx) => sum + tx.total, 0);
    const totalTransactions = customerTx.length;
    const lastTransaction = customerTx[0];
    
    return { totalSpent, totalTransactions, lastTransaction };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      if (editingCustomer) {
        await onUpdateCustomer(editingCustomer.id, formData);
      } else {
        await onAddCustomer(formData);
      }
      setShowAddDialog(false);
      setEditingCustomer(null);
      setFormData({ name: '', phone: '' });
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, phone: customer.phone || '' });
    setShowAddDialog(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Hapus pelanggan "${customer.name}"?`)) return;
    
    try {
      await onDeleteCustomer(customer.id);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

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
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pelanggan</h1>
          <p className="text-muted-foreground text-sm">
            {customers.length} pelanggan terdaftar
          </p>
        </div>
        <Button onClick={() => {
          setEditingCustomer(null);
          setFormData({ name: '', phone: '' });
          setShowAddDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pelanggan
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari pelanggan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Customers List */}
      <div className="grid gap-3">
        {filteredCustomers.map(customer => {
          const stats = getCustomerStats(customer.id);
          
          return (
            <Card 
              key={customer.id} 
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setViewingCustomer(customer)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{customer.name}</h3>
                    {customer.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{stats.totalTransactions} transaksi</span>
                      <span>•</span>
                      <span>Total: {formatPrice(stats.totalSpent)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(customer);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(customer);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Belum ada pelanggan</p>
          <p className="text-sm">Tambahkan pelanggan baru</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama pelanggan"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor Telepon (Opsional)</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddDialog(false)}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Customer Details Dialog */}
      <Dialog open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pelanggan</DialogTitle>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{viewingCustomer.name}</h3>
                  {viewingCustomer.phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {viewingCustomer.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              {(() => {
                const stats = getCustomerStats(viewingCustomer.id);
                return (
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Total Transaksi</p>
                      <p className="text-xl font-bold">{stats.totalTransactions}</p>
                    </Card>
                    <Card className="p-3">
                      <p className="text-xs text-muted-foreground">Total Belanja</p>
                      <p className="text-xl font-bold text-primary">{formatPrice(stats.totalSpent)}</p>
                    </Card>
                  </div>
                );
              })()}

              {/* Transaction History */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Riwayat Transaksi
                </h4>
                <div className="space-y-2">
                  {getCustomerTransactions(viewingCustomer.id).map(tx => (
                    <Card key={tx.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">#{tx.id.slice(-6)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <ShoppingCart className="h-3 w-3" />
                            {tx.items.length} item
                          </div>
                        </div>
                        <p className="font-semibold text-primary">{formatPrice(tx.total)}</p>
                      </div>
                    </Card>
                  ))}
                  {getCustomerTransactions(viewingCustomer.id).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada transaksi
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
