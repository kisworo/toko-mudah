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
              compact ? "w-14 h-14" : "w-16 h-16"
            )}
          />
        ) : (
          <div className={cn(
            "flex items-center justify-center rounded-lg bg-accent shrink-0",
            compact ? "w-14 h-14" : "w-16 h-16"
          )}>
            <Package className={cn(
              "text-accent-foreground",
              compact ? "h-6 w-6" : "h-7 w-7"
            )} />
          </div>
        )}
        
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium truncate",
            compact ? "text-sm" : "text-base"
          )}>
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "font-semibold text-primary",
                compact ? "text-sm" : "text-base"
              )}>
                {formatPrice(discountedPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              Stok: {product.stock}
            </span>
          </div>
        </div>

        {/* Add Button - appears on hover */}
        <Button
          size="icon"
          variant="default"
          className={cn(
            "shrink-0 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2",
            compact ? "h-8 w-8" : "h-10 w-10",
            hasDiscount ? "top-10" : "top-1/2 -translate-y-1/2"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product);
          }}
          disabled={isOutOfStock}
        >
          <Plus className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </Button>
      </div>
    </Card>
  );
}
