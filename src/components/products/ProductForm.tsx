import { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ImageUploader } from './ImageUploader';
import { Package, DollarSign, Hash, Check, Percent, Tag } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
}

export function ProductForm({ product, categories, open, onClose, onSubmit }: ProductFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | ''>('');
  const [discountValue, setDiscountValue] = useState('');

  // Reset form when product changes or dialog opens
  useEffect(() => {
    if (open) {
      setName(product?.name || '');
      setPrice(product?.price?.toString() || '');
      setStock(product?.stock?.toString() || '');
      setCategory(product?.category || categories[0]?.name || '');
      setImage(product?.image);
      setDiscountType(product?.discountType || '');
      setDiscountValue(product?.discountValue?.toString() || '');
    }
  }, [open, product, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !price || !stock || !category) return;

    onSubmit({
      name: name.trim(),
      price: parseInt(price),
      stock: parseInt(stock),
      category,
      image,
      discountType: discountType || undefined,
      discountValue: discountValue ? parseInt(discountValue) : undefined,
    });

    onClose();
  };

  const formatPrice = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('id-ID');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPrice(raw);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {product ? 'Edit Produk' : 'Tambah Produk Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Foto Produk</Label>
            <ImageUploader image={image} onChange={setImage} />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input
              id="name"
              placeholder="Contoh: Kopi Susu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Harga</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  Rp
                </span>
                <Input
                  id="price"
                  type="text"
                  inputMode="numeric"
                  placeholder="10.000"
                  value={formatPrice(price)}
                  onChange={handlePriceChange}
                  required
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stok</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="stock"
                  type="number"
                  placeholder="100"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  min="0"
                  className="pl-10 h-11"
                />
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Kategori</Label>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`
                      relative px-4 py-2 rounded-full border-2 transition-all text-sm font-medium
                      ${category === cat.name 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                    style={category === cat.name ? {
                      borderColor: cat.color,
                      backgroundColor: `${cat.color}15`,
                      color: cat.color
                    } : undefined}
                  >
                    {category === cat.name && (
                      <Check className="inline-block h-3 w-3 mr-1" />
                    )}
                    {cat.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                Belum ada kategori. Tambahkan kategori terlebih dahulu.
              </p>
            )}
          </div>

          {/* Discount Section */}
          <div className="space-y-3 p-3 rounded-lg border border-dashed">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">Diskon Produk (Opsional)</Label>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDiscountType(discountType === 'percentage' ? '' : 'percentage')}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm
                  ${discountType === 'percentage' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <Percent className="h-4 w-4" />
                Persen
              </button>
              <button
                type="button"
                onClick={() => setDiscountType(discountType === 'fixed' ? '' : 'fixed')}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm
                  ${discountType === 'fixed' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <DollarSign className="h-4 w-4" />
                Nominal
              </button>
            </div>

            {discountType && (
              <div className="relative">
                {discountType === 'percentage' ? (
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                )}
                <Input
                  type="number"
                  placeholder={discountType === 'percentage' ? 'Contoh: 10' : '5000'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  className={discountType === 'fixed' ? 'pl-10 h-11' : 'pr-10 h-11'}
                />
                {discountType === 'percentage' && discountValue && parseInt(price) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Harga setelah diskon: Rp {(parseInt(price) * (1 - parseInt(discountValue) / 100)).toLocaleString('id-ID')}
                  </p>
                )}
                {discountType === 'fixed' && discountValue && parseInt(price) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Harga setelah diskon: Rp {Math.max(0, parseInt(price) - parseInt(discountValue)).toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!name.trim() || !price || !stock || !category}
            >
              {product ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
