import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { CashierPage } from "@/pages/CashierPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { AboutPage, HelpPage, ContactPage } from "@/pages/SupportPages";
import { Navigate } from "react-router-dom";
import { ProductsPage } from "@/pages/ProductsPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useStore } from "@/hooks/useStore";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings } = useStoreSettings();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
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
    updateCustomer,
    deleteCustomer,
    findCustomers,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartTotalDiscount,
    checkout,
  } = useStore();

  return (
    <AppLayout 
      settings={settings} 
      onOpenSettings={() => setShowSettings(true)}
      isAuthenticated={isAuthenticated}
    >
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          path="/cashier"
          element={
            <ProtectedRoute>
              <CashierPage
                products={products}
                customers={customers}
                cart={cart}
                onAddToCart={addToCart}
                onUpdateQuantity={updateCartQuantity}
                onRemoveFromCart={removeFromCart}
                onClearCart={clearCart}
                onCheckout={checkout}
                onFindCustomers={findCustomers}
                onAddCustomer={addCustomer}
                cartTotal={getCartTotal()}
                cartTotalDiscount={getCartTotalDiscount()}
                settings={settings}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage
                products={products}
                categories={categories}
                onAddProduct={addProduct}
                onUpdateProduct={updateProduct}
                onDeleteProduct={deleteProduct}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage transactions={transactions} settings={settings} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomersPage
                customers={customers}
                transactions={transactions}
                onAddCustomer={addCustomer}
                onUpdateCustomer={updateCustomer}
                onDeleteCustomer={deleteCustomer}
              />
            </ProtectedRoute>
          }
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
