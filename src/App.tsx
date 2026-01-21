import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CashierPage } from "@/pages/CashierPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useStore } from "@/hooks/useStore";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings } = useStoreSettings();
  
  const {
    products,
    categories,
    customers,
    cart,
    transactions,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
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
    <AppLayout 
      settings={settings} 
      onOpenSettings={() => setShowSettings(true)}
    >
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
              cartTotalDiscount={getCartTotalDiscount()}
            />
          }
        />
        <Route
          path="/products"
          element={
            <ProductsPage
              products={products}
              categories={categories}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
            />
          }
        />
        <Route
          path="/transactions"
          element={<TransactionsPage transactions={transactions} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
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
