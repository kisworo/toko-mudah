import { useState } from 'react';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Tag } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id'>) => void;
  onDelete: (id: string) => void;
}

const colorOptions = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function CategoryManager({ categories, onAdd, onDelete }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  const handleAdd = () => {
    if (!newCategory.trim()) return;
    
    // Check if category already exists
    if (categories.some(c => c.name.toLowerCase() === newCategory.trim().toLowerCase())) {
      return;
    }

    onAdd({ name: newCategory.trim(), color: selectedColor });
    setNewCategory('');
    setSelectedColor(colorOptions[Math.floor(Math.random() * colorOptions.length)]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Kelola Kategori</h3>
      </div>

      {/* Add new category */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Nama kategori baru..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-12"
          />
          <div 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full cursor-pointer border-2 border-background shadow-sm"
            style={{ backgroundColor: selectedColor }}
            onClick={() => {
              const currentIndex = colorOptions.indexOf(selectedColor);
              setSelectedColor(colorOptions[(currentIndex + 1) % colorOptions.length]);
            }}
          />
        </div>
        <Button onClick={handleAdd} size="icon" disabled={!newCategory.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Color picker */}
      <div className="flex gap-2 flex-wrap">
        {colorOptions.map(color => (
          <button
            key={color}
            type="button"
            className={`w-6 h-6 rounded-full transition-all ${
              selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>

      {/* Existing categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Badge
            key={category.id}
            variant="secondary"
            className="pl-3 pr-1 py-1.5 gap-1 text-sm"
            style={{ 
              backgroundColor: `${category.color}20`,
              borderColor: category.color,
              color: category.color
            }}
          >
            {category.name}
            <button
              type="button"
              onClick={() => onDelete(category.id)}
              className="ml-1 hover:bg-background/50 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada kategori</p>
        )}
      </div>
    </div>
  );
}
