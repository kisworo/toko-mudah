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
        compact ? "p-2" : "p-3"
      )}
      onClick={() => onAdd(product)}
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
              compact ? "w-16 h-16" : "w-24 h-24"
            )}
          />
        ) : (
          <div className={cn(
            "flex items-center justify-center rounded-lg bg-accent shrink-0",
            compact ? "w-16 h-16" : "w-24 h-24"
          )}>
            <Package className={cn(
              "text-accent-foreground",
              compact ? "h-8 w-8" : "h-12 w-12"
            )} />
          </div>
        )}
        
        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <h3 className="font-semibold truncate text-base leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{product.category}</span>
            {product.stock > 0 && (
              <span className="shrink-0">Stok: {product.stock}</span>
            )}
          </div>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0 mt-0.5">
            <span className="font-bold text-primary text-lg">
              {formatPrice(discountedPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Add Button - always visible on mobile, hover on desktop */}
        <Button
          size="icon"
          variant="default"
          className={cn(
            "shrink-0 transition-opacity absolute right-2 [&_svg]:size-4",
            compact ? "h-7 w-7" : "h-9 w-9",
            hasDiscount ? "top-8" : "top-2",
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product);
          }}
        >
          <Plus className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </Button>
      </div>
    </Card>
  );
}
