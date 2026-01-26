import { useState } from 'react';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ProductForm } from '@/components/products/ProductForm';
import { CategoryManager } from '@/components/products/CategoryManager';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  Package, 
  Pencil, 
  Trash2,
  AlertCircle,
  Settings2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';

interface ProductsPageProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
}

export function ProductsPage({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
}: ProductsPageProps) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSubmit = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      onUpdateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } else {
      onAddProduct(productData);
    }
  };

  const handleDelete = () => {
    if (deletingProduct) {
      onDeleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  // Group by category
  const productsByCategory = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const getCategoryColor = (categoryName: string) => {
    return categories.find(c => c.name === categoryName)?.color || '#6b7280';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Produk</h1>
          <p className="text-muted-foreground text-sm">
            {products.length} produk terdaftar
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCategoryManager(!showCategoryManager)}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            Kategori
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* Category Manager */}
      <Collapsible open={showCategoryManager}>
        <CollapsibleContent>
          <Card className="p-4 my-4 bg-muted/30">
            <CategoryManager
              categories={categories}
              onAdd={onAddCategory}
              onDelete={onDeleteCategory}
            />
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Search */}
      <div className="relative my-4 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Products by Category - Scrollable */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 pr-4">
          {Object.entries(productsByCategory).map(([categoryName, categoryProducts]) => (
            <div key={categoryName} className="space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getCategoryColor(categoryName) }}
                />
                <h2 className="text-lg font-semibold text-muted-foreground">{categoryName}</h2>
                <span className="text-sm text-muted-foreground">({categoryProducts.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryProducts.map(product => (
              <Card key={product.id} className="p-3 animate-fade-in overflow-hidden">
                <div className="flex items-center gap-3">
                  {/* Product Image or Icon */}
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-accent shrink-0">
                      <Package className="h-8 w-8 text-accent-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{product.name}</h3>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stok: {product.stock}
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-20 w-20 rounded-r-none [&_svg]:size-8"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil className="h-8 w-8" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-20 w-20 rounded-l-none text-destructive hover:text-destructive border-l-0 [&_svg]:size-8"
                      onClick={() => setDeletingProduct(product)}
                    >
                      <Trash2 className="h-8 w-8" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada produk</p>
              <p className="text-sm">Klik tombol "Tambah Produk" untuk memulai</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Product Form Modal */}
      <ProductForm
        product={editingProduct || undefined}
        categories={categories}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Hapus Produk
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{deletingProduct?.name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
