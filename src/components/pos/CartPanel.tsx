import { useState, useEffect, useRef } from 'react';
import { CartItem, Customer } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Trash2, ShoppingBag, User, Phone, Search, UserPlus, X } from 'lucide-react';

interface CartPanelProps {
  items: CartItem[];
  customers: Customer[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: (customer?: Customer, paymentMethod?: 'cash' | 'transfer', amountPaid?: number) => void;
  onFindCustomers: (query: string) => Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  total: number;
}

export function CartPanel({ 
  items, 
  customers,
  onUpdateQuantity, 
  onRemove, 
  onCheckout,
  onFindCustomers,
  onAddCustomer,
  total 
}: CartPanelProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Search customers
  useEffect(() => {
    if (customerSearch.trim()) {
      const results = onFindCustomers(customerSearch);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [customerSearch, onFindCustomers]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setSearchResults([]);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
  };

  const handleAddNewCustomer = () => {
    if (!newCustomerName.trim()) return;
    
    const newCustomer = onAddCustomer({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim() || undefined,
    });
    
    setSelectedCustomer(newCustomer);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setShowNewCustomerForm(false);
  };

  const handleProceedToPayment = () => {
    setShowPayment(true);
    setAmountPaid(total.toString());
  };

  const handleCheckout = () => {
    const paid = parseInt(amountPaid) || total;
    onCheckout(selectedCustomer || undefined, paymentMethod, paid);
    
    // Reset state
    setSelectedCustomer(null);
    setCustomerSearch('');
    setAmountPaid('');
    setShowPayment(false);
    setPaymentMethod('cash');
  };

  const change = (parseInt(amountPaid) || 0) - total;

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Keranjang</h2>
          <span className="ml-auto text-sm text-muted-foreground">
            {items.length} item
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Keranjang kosong</p>
            <p className="text-sm">Pilih produk untuk memulai</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center gap-3 animate-fade-in">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-sm text-primary">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer & Payment Section */}
      {items.length > 0 && !showPayment && (
        <div className="p-4 border-t space-y-3">
          {/* Customer Search */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Pelanggan</Label>
            
            {selectedCustomer ? (
              <div className="flex items-center gap-2 p-2 bg-accent rounded-lg">
                <User className="h-4 w-4 text-accent-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedCustomer.name}</p>
                  {selectedCustomer.phone && (
                    <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
                  )}
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleClearCustomer}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : showNewCustomerForm ? (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pelanggan Baru</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setShowNewCustomerForm(false)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Nama pelanggan"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="h-9"
                />
                <Input
                  placeholder="No. HP (opsional)"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="h-9"
                />
                <Button size="sm" className="w-full" onClick={handleAddNewCustomer} disabled={!newCustomerName.trim()}>
                  Simpan Pelanggan
                </Button>
              </div>
            ) : (
              <div ref={searchRef} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama/no HP pelanggan..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-8 pr-10 h-9 text-sm"
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => setShowNewCustomerForm(true)}
                  title="Tambah pelanggan baru"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-10 max-h-40 overflow-auto">
                    {searchResults.map(customer => (
                      <button
                        key={customer.id}
                        className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{customer.name}</p>
                          {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {customerSearch && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-10 p-3">
                    <p className="text-sm text-muted-foreground text-center mb-2">Pelanggan tidak ditemukan</p>
                    <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => {
                      setNewCustomerName(customerSearch);
                      setShowNewCustomerForm(true);
                      setCustomerSearch('');
                    }}>
                      <UserPlus className="h-3 w-3" />
                      Tambah "{customerSearch}"
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Section */}
      {items.length > 0 && showPayment && (
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Pembayaran</Label>
            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setShowPayment(false)}>
              Kembali
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setPaymentMethod('cash')}
            >
              Tunai
            </Button>
            <Button
              variant={paymentMethod === 'transfer' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setPaymentMethod('transfer')}
            >
              Transfer
            </Button>
          </div>

          {paymentMethod === 'cash' && (
            <div className="space-y-2">
              <Label htmlFor="amount-paid" className="text-xs">Uang Diterima</Label>
              <Input
                id="amount-paid"
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="text-lg font-semibold text-center"
              />
              {change >= 0 && parseInt(amountPaid) > 0 && (
                <div className="text-center p-2 bg-accent rounded-lg">
                  <p className="text-xs text-muted-foreground">Kembalian</p>
                  <p className="text-xl font-bold text-primary">{formatPrice(change)}</p>
                </div>
              )}
              {change < 0 && (
                <p className="text-sm text-destructive text-center">Uang kurang {formatPrice(Math.abs(change))}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Total & Checkout */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground">Total</span>
          <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
        </div>
        
        {!showPayment ? (
          <Button
            className="w-full"
            size="lg"
            disabled={items.length === 0}
            onClick={handleProceedToPayment}
          >
            Lanjut Bayar
          </Button>
        ) : (
          <Button
            className="w-full"
            size="lg"
            disabled={paymentMethod === 'cash' && change < 0}
            onClick={handleCheckout}
          >
            Selesaikan Transaksi
          </Button>
        )}
      </div>
    </Card>
  );
}
