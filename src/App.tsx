import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CashierPage } from "@/pages/CashierPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { useStore } from "@/hooks/useStore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const {
    products,
    customers,
    cart,
    transactions,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    findCustomers,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getCartTotal,
    checkout,
  } = useStore();

  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
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
            />
          }
        />
        <Route
          path="/products"
          element={
            <ProductsPage
              products={products}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
            />
          }
        />
        <Route
          path="/transactions"
          element={<TransactionsPage transactions={transactions} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
