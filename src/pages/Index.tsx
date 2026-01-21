import { AppLayout } from '@/components/layout/AppLayout';
import { CashierPage } from '@/pages/CashierPage';
import { useStore } from '@/hooks/useStore';

const Index = () => {
  const {
    products,
    customers,
    cart,
    addCustomer,
    findCustomers,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getCartTotal,
    getCartTotalDiscount,
    checkout,
  } = useStore();

  return (
    <AppLayout>
      <CashierPage
        products={products}
        customers={customers}
        cart={cart}
        onAddToCart={addToCart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveFromCart={removeFromCart}
        onCheckout={checkout}
        onFindCustomers={findCustomers}
        onAddCustomer={addCustomer}
        cartTotal={getCartTotal()}
        cartTotalDiscount={getCartTotalDiscount()}
      />
    </AppLayout>
  );
};

export default Index;
