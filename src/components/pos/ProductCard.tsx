import { Product } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  compact?: boolean;
}

export function ProductCard({ product, onAdd, compact = false }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all card-hover",
        isOutOfStock && "opacity-60",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shrink-0">
              <Package className="h-4 w-4 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className={cn(
                "font-medium truncate",
                compact ? "text-sm" : "text-base"
              )}>
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground">{product.category}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className={cn(
              "font-semibold text-primary",
              compact ? "text-sm" : "text-base"
            )}>
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted-foreground">
              Stok: {product.stock}
            </span>
          </div>
        </div>
        <Button
          size="icon"
          variant="default"
          className="shrink-0 h-8 w-8"
          onClick={() => onAdd(product)}
          disabled={isOutOfStock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
