import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Package, 
  Receipt, 
  Settings, 
  Smartphone, 
  Printer, 
  TrendingUp,
  Users,
  Check
} from "lucide-react";

export function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 pt-12 md:pt-20">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
          Kasir Toko Mudah
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          Solusi kasir modern, cepat, dan mudah untuk mengelola usaha Anda. 
          Pantau stok, catat transaksi, dan layani pelanggan dengan lebih efisien.
        </p>
        
        {/* Illustration */}
        <div className="py-8 animate-fade-in">
          <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-background rounded-2xl shadow-2xl flex items-center justify-center border">
              <div className="grid grid-cols-2 gap-4 p-6 opacity-80">
                <div className="h-20 w-20 bg-primary/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-10 w-10 text-primary" />
                </div>
                <div className="h-20 w-20 bg-secondary rounded-lg flex items-center justify-center">
                  <Package className="h-10 w-10 text-secondary-foreground" />
                </div>
                <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="h-20 w-20 bg-accent rounded-lg flex items-center justify-center">
                  <Receipt className="h-10 w-10 text-accent-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="flex justify-center">
        <div className="relative rounded-2xl border bg-card p-8 shadow-lg max-w-lg w-full overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-xl font-medium text-sm">
            PROMO TERBATAS
          </div>
          <div className="text-center space-y-4 mb-6">
            <h3 className="text-2xl font-bold">Paket Tahunan</h3>
            <div className="space-y-1">
              <p className="text-muted-foreground line-through text-lg">Rp 500.000</p>
              <p className="text-4xl font-bold text-primary">Rp 99.000 <span className="text-base font-normal text-muted-foreground">/ tahun</span></p>
            </div>
            <p className="text-muted-foreground">Hemat 80% untuk akses penuh selamanya</p>
          </div>
          <div className="space-y-4 mb-6">
            {[
              "Akses Semua Fitur Premium",
              "Unlimited Produk & Transaksi",
              "Database Pelanggan",
              "Laporan Penjualan Lengkap",
              "Prioritas Support 24/7"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <Link to="/register">
            <Button className="w-full h-12 text-lg font-bold">
              Ambil Promo Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Kasir Cepat</h3>
          <p className="text-muted-foreground">
            Proses transaksi dengan cepat, hitung kembalian otomatis, dan cetak struk instan.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Manajemen Stok</h3>
          <p className="text-muted-foreground">
            Pantau stok produk secara real-time. Tambah, edit, dan hapus produk dengan mudah.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Receipt className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Riwayat Transaksi</h3>
          <p className="text-muted-foreground">
            Lihat riwayat penjualan harian, mingguan, atau bulanan. Pantau omset usaha Anda.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Database Pelanggan</h3>
          <p className="text-muted-foreground">
            Simpan data pelanggan setia Anda untuk pelayanan yang lebih personal.
          </p>
        </div>
      </section>

      {/* Additional Features */}
      <section className="bg-muted/50 rounded-3xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold">Fitur Unggulan Lainnya</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Responsif</h4>
                  <p className="text-sm text-muted-foreground">Tampilan optimal di desktop, tablet, dan HP.</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border">
                  <Printer className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Cetak Struk</h4>
                  <p className="text-sm text-muted-foreground">Mendukung printer thermal untuk cetak struk fisik.</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Kustomisasi Toko</h4>
                  <p className="text-sm text-muted-foreground">Atur nama toko, alamat, dan logo struk sesuai identitas usaha.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-[400px] aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-32 h-32 text-primary opacity-80" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
