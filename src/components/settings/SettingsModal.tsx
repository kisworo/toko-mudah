import { useState, useRef } from 'react';
import { StoreSettings, ThemeTone } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Palette, ImageIcon, Upload, Trash2, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
}

const THEME_OPTIONS: { value: ThemeTone; label: string; color: string }[] = [
  { value: 'green', label: 'Hijau', color: 'bg-green-500' },
  { value: 'blue', label: 'Biru', color: 'bg-blue-500' },
  { value: 'purple', label: 'Ungu', color: 'bg-purple-500' },
  { value: 'orange', label: 'Oranye', color: 'bg-orange-500' },
  { value: 'rose', label: 'Rose', color: 'bg-rose-500' },
];

export function SettingsModal({ open, onClose, settings, onUpdateSettings }: SettingsModalProps) {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress || '');
  const [storePhone, setStorePhone] = useState(settings.storePhone || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSaveStore = () => {
    onUpdateSettings({
      storeName: storeName.trim() || 'TokoKu',
      storeAddress: storeAddress.trim(),
      storePhone: storePhone.trim(),
    });
  };

  const handleThemeChange = (tone: ThemeTone) => {
    onUpdateSettings({ themeTone: tone });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize for performance
        const canvas = document.createElement('canvas');
        const maxSize = 1920;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
        onUpdateSettings({ backgroundImage: resizedImage });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  const handleRemoveBackground = () => {
    onUpdateSettings({ backgroundImage: undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Pengaturan Toko
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="store" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="store" className="gap-1.5">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Toko</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-1.5">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Tema</span>
            </TabsTrigger>
            <TabsTrigger value="background" className="gap-1.5">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Latar</span>
            </TabsTrigger>
          </TabsList>

          {/* Store Info Tab */}
          <TabsContent value="store" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Nama Toko</Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Nama toko Anda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-address">Alamat (untuk struk)</Label>
              <Input
                id="store-address"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Alamat toko"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">No. Telepon (untuk struk)</Label>
              <Input
                id="store-phone"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <Button onClick={handleSaveStore} className="w-full">
              Simpan Informasi Toko
            </Button>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-4 mt-4">
            <Label>Pilih Warna Tema</Label>
            <div className="grid grid-cols-5 gap-3">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleThemeChange(theme.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:scale-105',
                    settings.themeTone === theme.value
                      ? 'border-primary bg-accent'
                      : 'border-transparent bg-muted hover:border-muted-foreground/20'
                  )}
                >
                  <div className={cn('w-8 h-8 rounded-full', theme.color)} />
                  <span className="text-xs font-medium">{theme.label}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Tema akan langsung berubah setelah dipilih
            </p>
          </TabsContent>

          {/* Background Tab */}
          <TabsContent value="background" className="space-y-4 mt-4">
            <Label>Gambar Latar Belakang</Label>
            
            {settings.backgroundImage ? (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={settings.backgroundImage}
                    alt="Background preview"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveBackground}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Hover gambar untuk menghapus
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Pilih gambar untuk latar belakang halaman
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cameraInputRef.current?.click()}
                      className="gap-1"
                    >
                      <Camera className="h-4 w-4" />
                      Kamera
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageUpload}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
