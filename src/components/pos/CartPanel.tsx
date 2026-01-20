import { CartItem, Customer } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, User, Phone } from 'lucide-react';
import { useState } from 'react';

interface CartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: (customer?: Customer, paymentMethod?: 'cash' | 'transfer') => void;
  total: number;
}

export function CartPanel({ 
  items, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout, 
  total 
}: CartPanelProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    const customer = customerName ? { name: customerName, phone: customerPhone || undefined } : undefined;
    onCheckout(customer, paymentMethod);
    setCustomerName('');
    setCustomerPhone('');
  };

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

      {/* Customer Info */}
      {items.length > 0 && (
        <div className="p-4 border-t space-y-3">
          <div className="space-y-2">
            <Label htmlFor="customer-name" className="text-xs text-muted-foreground">
              Data Pembeli (Opsional)
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customer-name"
                  placeholder="Nama"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="No. HP"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
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
        </div>
      )}

      {/* Total & Checkout */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground">Total</span>
          <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={items.length === 0}
          onClick={handleCheckout}
        >
          Bayar Sekarang
        </Button>
      </div>
    </Card>
  );
}
