import { Product, getDiscountedPrice } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  compact?: boolean;
}

export function ProductCard({ product, onAdd, compact = false }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.discountType && product.discountValue;
  const discountedPrice = getDiscountedPrice(product);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountLabel = () => {
    if (!hasDiscount) return '';
    if (product.discountType === 'percentage') return `-${product.discountValue}%`;
    return `-${formatPrice(product.discountValue!)}`;
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all card-hover cursor-pointer group",
        isOutOfStock && "opacity-60",
        compact ? "p-2" : "p-4"
      )}
      onClick={() => !isOutOfStock && onAdd(product)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <Badge 
          variant="destructive" 
          className="absolute top-1 right-1 z-10 text-[10px] px-1.5 py-0.5"
        >
          {getDiscountLabel()}
        </Badge>
      )}

      <div className="flex items-center gap-3">
        {/* Product Image */}
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className={cn(
              "rounded-lg object-cover shrink-0",
              compact ? "w-20 h-20" : "w-24 h-24"
            )}
          />
        ) : (
          <div className={cn(
            "flex items-center justify-center rounded-lg bg-accent shrink-0",
            compact ? "w-20 h-20" : "w-24 h-24"
          )}>
            <Package className={cn(
              "text-accent-foreground",
              compact ? "h-10 w-10" : "h-12 w-12"
            )} />
          </div>
        )}
        
        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <h3 className="font-bold truncate text-lg leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="truncate">{product.category}</span>
            <span className="shrink-0">Stok: {product.stock}</span>
          </div>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0">
            <span className="font-bold text-primary text-xl">
              {formatPrice(discountedPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Add Button - appears on hover */}
        <Button
          size="icon"
          variant="default"
          className={cn(
            "shrink-0 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 [&_svg]:size-5",
            compact ? "h-8 w-8" : "h-9 w-9",
            hasDiscount ? "top-9" : "top-2"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product);
          }}
          disabled={isOutOfStock}
        >
          <Plus className={compact ? "h-5 w-5" : "h-5 w-5"} />
        </Button>
      </div>
    </Card>
  );
}
