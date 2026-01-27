import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Receipt,
  Smartphone,
  Printer,
  TrendingUp,
  Users,
  Check,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Sparkles,
  Heart
} from "lucide-react";
import { useEffect, useState } from "react";

export function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col pb-12 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4">
        <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/20 hover:from-primary/30 hover:to-secondary/30 transition-all animate-fade-in">
          <Sparkles className="w-3 h-3 mr-1" />
          Platform Kasir #1 untuk UMKM Indonesia
        </Badge>

<h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-slide-in">
      <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Kasier
      </span>
    </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10 animate-fade-in leading-relaxed">
          Kelola usaha Anda dengan mudah. Transaksi cepat, stok terkontrol,
          dan laporan lengkap dalam satu aplikasi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-scale-in">
          <Link to="/register">
            <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105">
              Mulai Gratis Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold border-2 hover:bg-primary/5 transition-all">
              Demo Login
            </Button>
          </Link>
        </div>

        {/* Demo Credentials */}
        <div className="mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-2xl">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Akun Demo</p>
              <p className="text-sm text-muted-foreground">
                Username: <kbd className="px-2 py-0.5 bg-background rounded border font-mono text-sm">user</kbd>
                {" "}| Password: <kbd className="px-2 py-0.5 bg-background rounded border font-mono text-sm">password</kbd>
              </p>
            </div>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className={`relative w-full max-w-5xl mx-auto transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative bg-gradient-to-br from-card via-card to-muted/50 rounded-3xl border-2 border-primary/10 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: ShoppingCart, label: "10K+", sub: "Transaksi/Hari", color: "text-blue-500", bg: "bg-blue-500/10" },
                { icon: Users, label: "5K+", sub: "Toko Aktif", color: "text-green-500", bg: "bg-green-500/10" },
                { icon: Package, label: "99.9%", sub: "Uptime", color: "text-purple-500", bg: "bg-purple-500/10" },
                { icon: Star, label: "4.9", sub: "Rating", color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className={`p-6 rounded-2xl ${item.bg} border border-border/50 group-hover:scale-105 group-hover:shadow-lg transition-all duration-300`}>
                    <item.icon className={`h-10 w-10 ${item.color} mb-3`} />
                    <p className="text-2xl font-bold">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-6 -left-6 p-4 bg-background rounded-2xl shadow-xl border animate-bounce delay-500">
            <Zap className="h-6 w-6 text-amber-500" />
          </div>
          <div className="absolute -bottom-6 -right-6 p-4 bg-background rounded-2xl shadow-xl border animate-bounce delay-700">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground mb-8 text-sm uppercase tracking-wider font-medium">
            Dipercaya oleh ribuan pebisnis di Indonesia
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {["Warung Sejahtera", "Toko Berkah", "Mart 99", "Store Jaya", "Berkat Grosir"].map((name, i) => (
              <div key={i} className="text-lg font-bold text-muted-foreground">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Fitur Unggulan</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Fitur lengkap untuk mengembangkan usaha Anda ke level berikutnya
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShoppingCart,
                title: "Kasir Cepat",
                description: "Proses transaksi dalam hitungan detik dengan kalkulasi otomatis",
                color: "from-blue-500/20 to-blue-600/5",
                iconColor: "text-blue-500",
              },
              {
                icon: Package,
                title: "Manajemen Stok",
                description: "Pantau stok real-time dengan notifikasi otomatis",
                color: "from-green-500/20 to-green-600/5",
                iconColor: "text-green-500",
              },
              {
                icon: Receipt,
                title: "Laporan Lengkap",
                description: "Analisis penjualan dengan grafik dan ekspor data",
                color: "from-purple-500/20 to-purple-600/5",
                iconColor: "text-purple-500",
              },
              {
                icon: Users,
                title: "Database Pelanggan",
                description: "Kenali pelanggan dan berikan pelayanan personal",
                color: "from-pink-500/20 to-pink-600/5",
                iconColor: "text-pink-500",
              },
              {
                icon: Printer,
                title: "Cetak Struk",
                description: "Support printer thermal USB & Bluetooth",
                color: "from-amber-500/20 to-amber-600/5",
                iconColor: "text-amber-500",
              },
              {
                icon: Smartphone,
                title: "Multi Device",
                description: "Akses dari mana saja, desktop, tablet, atau HP",
                color: "from-cyan-500/20 to-cyan-600/5",
                iconColor: "text-cyan-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl border bg-gradient-to-br from-card to-muted/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/20">
              Promo Terbatas
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Harga Terjangkau untuk Semua
            </h2>
            <p className="text-xl text-muted-foreground">
              Mulai gratis, upgrade kapan saja sesuai kebutuhan
            </p>
          </div>

          <div className="relative">
            {/* Glowing effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 animate-pulse" />

            <div className="relative bg-card rounded-3xl border-2 border-primary/20 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-2 rounded-bl-2xl font-bold text-sm">
                HEMAT 80%
              </div>

              <div className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Paket Tahunan</h3>
                  <p className="text-muted-foreground mb-6">Akses penuh selama 1 tahun</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-2xl text-muted-foreground line-through">Rp 500.000</span>
                    <div className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                      Rp 99.000
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2">hanya Rp 8.250/bulan</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {[
                    "Unlimited Transaksi",
                    "Unlimited Produk",
                    "Database Pelanggan",
                    "Laporan Penjualan",
                    "Cetak Struk Thermal",
                    "Support Prioritas",
                    "Backup Data Otomatis",
                    "Tanpa Iklan",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link to="/register">
                  <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                    Ambil Promo Sekarang
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Garansi uang kembali 30 hari
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Testimoni</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Kata Mereka Tentang Kami
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Budi Santoso",
                role: "Pemilik Warung Berkah",
                content: "Sejak pakai Kasier, stok lebih terkontrol dan omset naik 30%. Sangat recommended!",
                rating: 5,
              },
              {
                name: "Siti Aminah",
                role: "Owner Mart 99",
                content: "Aplikasinya mudah banget dipakai. Karyawan saya juga cepat belajarnya.",
                rating: 5,
              },
              {
                name: "Ahmad Fauzi",
                role: "Pengelola Minimarket",
                content: "Laporannya lengkap, bisa analisis produk terlaris dengan mudah. Harganya juga terjangkau.",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div key={i} className="p-6 bg-card rounded-2xl border shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">{testimonial.content}</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-12 md:p-16 text-center text-white">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAwLTItMi00LTJoLTJ2LTJoMnYtMmgydjJoMnYtMmgydjJoMnYtMmgydjJoMnYtMmgyYzIgMCA0IDIgNCAydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

            <div className="relative">
              <Heart className="h-16 w-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Siap Mengembangkan Usaha Anda?
              </h2>
<p className="text-xl opacity-90 mb-10 max-w-xl mx-auto">
      Bergabung dengan ribuan pebisnis yang sudah merasakan kemudahan mengelola usaha dengan Kasier.
    </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="h-14 px-8 text-lg font-bold bg-white text-primary hover:bg-white/90 shadow-xl">
                    Daftar Sekarang - Gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
<h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Kasier
        </h3>
              <p className="text-muted-foreground mt-1">Solusi kasir modern untuk UMKM Indonesia</p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">Tentang</Link>
              <Link to="/help" className="hover:text-primary transition-colors">Bantuan</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Kontak</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 Kasier. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
