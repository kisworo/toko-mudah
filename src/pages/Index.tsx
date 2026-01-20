import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { CashierPage } from '@/pages/CashierPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { useStore } from '@/hooks/useStore';

const Index = () => {
  const {
    products,
    cart,
    transactions,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getCartTotal,
    checkout,
  } = useStore();

  return (
    <AppLayout>
      <CashierPage
        products={products}
        cart={cart}
        onAddToCart={addToCart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveFromCart={removeFromCart}
        onCheckout={checkout}
        cartTotal={getCartTotal()}
      />
    </AppLayout>
  );
};

export default Index;
