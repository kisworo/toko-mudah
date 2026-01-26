import { useState } from 'react';
import { Product, Customer, Transaction, CartItem } from '@/types';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/pos/ProductCard';
import { CartPanel } from '@/components/pos/CartPanel';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface CashierPageProps {
  products: Product[];
  customers: Customer[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onCheckout: (customer?: Customer, paymentMethod?: 'cash' | 'transfer', amountPaid?: number) => Transaction;
  onFindCustomers: (query: string) => Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  cartTotal: number;
  cartTotalDiscount: number;
}

export function CashierPage({
  products,
  customers,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  onFindCustomers,
  onAddCustomer,
  cartTotal,
  cartTotalDiscount,
}: CashierPageProps) {
  const [search, setSearch] = useState('');
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckout = (customer?: Customer, paymentMethod?: 'cash' | 'transfer', amountPaid?: number) => {
    const transaction = onCheckout(customer, paymentMethod, amountPaid);
    setLastTransaction(transaction);
    setShowReceipt(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)]">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="relative mb-4 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pr-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAddToCart}
                compact
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Produk tidak ditemukan</p>
              <p className="text-sm">Coba kata kunci lain</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Cart Section */}
      <div className="lg:w-80 xl:w-96 shrink-0">
        <CartPanel
          items={cart}
          customers={customers}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemoveFromCart}
          onClearCart={onClearCart}
          onCheckout={handleCheckout}
          onFindCustomers={onFindCustomers}
          onAddCustomer={onAddCustomer}
          total={cartTotal}
          totalDiscount={cartTotalDiscount}
        />
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        transaction={lastTransaction}
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        autoPrint={true}
      />
    </div>
  );
}
