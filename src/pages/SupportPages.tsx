import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, HelpCircle, Info, MessageSquare, ArrowLeft, Heart, Zap, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function BackButton() {
  return (
    <div className="container max-w-4xl py-4">
      <Link to="/">
        <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      
      {/* Hero Section */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 -z-10" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="container max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Heart className="h-4 w-4 fill-primary" />
            <span>Dibuat dengan Cinta untuk UMKM</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight animate-slide-in">
            Mengapa Kami Ada?
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in delay-100">
            Kami percaya setiap usaha kecil berhak mendapatkan teknologi kelas dunia. 
            Misi kami adalah mendigitalkan UMKM Indonesia agar bisa bersaing di era modern.
          </p>
        </div>
      </div>

      <div className="container max-w-5xl pb-24">
        {/* Story Card */}
        <Card className="mb-16 border-none shadow-2xl bg-gradient-to-br from-card to-muted/20 overflow-hidden animate-scale-in">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                  <Info className="h-6 w-6" />
                </div>
                Visi & Misi
              </h2>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                <p>
                  Toko Mudah lahir dari keinginan sederhana: memberikan akses teknologi kasir (Point of Sale) 
                  yang canggih namun mudah digunakan bagi jutaan pelaku usaha mikro, kecil, dan menengah di Indonesia.
                </p>
                <p>
                  Kami ingin membebaskan pemilik usaha dari kerumitan administrasi manual, 
                  sehingga mereka bisa fokus pada hal yang paling penting: 
                  <span className="text-foreground font-semibold"> Melayani Pelanggan & Mengembangkan Bisnis.</span>
                </p>
              </div>
            </div>
            <div className="bg-muted/50 p-8 md:p-12 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />
               <div className="grid grid-cols-2 gap-4 relative z-10 w-full max-w-sm">
                 <div className="bg-card p-4 rounded-2xl shadow-lg animate-bounce delay-700">
                    <Zap className="h-8 w-8 text-amber-500 mb-2" />
                    <div className="font-bold text-lg">Cepat</div>
                    <div className="text-xs text-muted-foreground">Transaksi Kilat</div>
                 </div>
                 <div className="bg-card p-4 rounded-2xl shadow-lg mt-8 animate-bounce delay-1000">
                    <Shield className="h-8 w-8 text-blue-500 mb-2" />
                    <div className="font-bold text-lg">Aman</div>
                    <div className="text-xs text-muted-foreground">Data Terenkripsi</div>
                 </div>
                 <div className="bg-card p-4 rounded-2xl shadow-lg animate-bounce delay-500">
                    <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                    <div className="font-bold text-lg">Tumbuh</div>
                    <div className="text-xs text-muted-foreground">Analisa Bisnis</div>
                 </div>
               </div>
            </div>
          </div>
        </Card>

        {/* Values Grid */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nilai Kami</h2>
          <p className="text-muted-foreground">Apa yang membuat kami berbeda</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Simpel Itu Kunci",
              desc: "Kami mendesain antarmuka yang intuitif. Nenek-nenek pun bisa menggunakannya tanpa manual tebal.",
              icon: Zap,
              color: "text-amber-500",
              bg: "bg-amber-500/10"
            },
            {
              title: "Harga Jujur",
              desc: "Fitur premium dengan harga yang masuk akal bagi UMKM. Tanpa biaya tersembunyi.",
              icon: Heart,
              color: "text-pink-500",
              bg: "bg-pink-500/10"
            },
            {
              title: "Selalu Ada",
              desc: "Tim support kami bukan robot. Kami siap membantu kendala Anda dengan pendekatan personal.",
              icon: MessageSquare,
              color: "text-blue-500",
              bg: "bg-blue-500/10"
            }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-card rounded-2xl border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon className={`h-7 w-7 ${item.color}`} />
              </div>
              <h3 className="font-bold text-xl mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      
      <div className="container max-w-3xl py-12 animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Pusat Bantuan</h1>
          <p className="text-xl text-muted-foreground">Temukan jawaban untuk pertanyaan Anda</p>
        </div>

        <div className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                Cara Memulai
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="pb-4 border-b last:border-0 last:pb-0">
                <h3 className="font-semibold text-lg mb-2">Bagaimana cara mendaftar?</h3>
                <p className="text-muted-foreground">Klik tombol <span className="font-medium text-foreground">"Daftar"</span> di halaman depan atau pojok kanan atas. Isi formulir dengan data diri dan nama toko Anda. Akun akan langsung aktif dan Anda bisa langsung berjualan.</p>
              </div>
              <div className="pb-4 border-b last:border-0 last:pb-0">
                <h3 className="font-semibold text-lg mb-2">Apakah ada versi gratis?</h3>
                <p className="text-muted-foreground">Ya! Kami menyediakan versi gratis selamanya dengan fitur dasar yang cukup untuk operasional harian toko kecil. Anda bisa upgrade kapan saja jika butuh fitur lebih lanjut.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                Kendala Teknis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="pb-4 border-b last:border-0 last:pb-0">
                <h3 className="font-semibold text-lg mb-2">Lupa password akun?</h3>
                <p className="text-muted-foreground">Saat ini fitur reset password otomatis sedang dalam pengembangan. Silakan hubungi admin melalui WhatsApp di halaman Kontak untuk bantuan reset password manual. Tim kami akan merespon secepatnya.</p>
              </div>
              <div className="pb-4 border-b last:border-0 last:pb-0">
                <h3 className="font-semibold text-lg mb-2">Printer tidak terdeteksi?</h3>
                <p className="text-muted-foreground">
                  1. Pastikan printer sudah menyala dan baterai cukup.<br/>
                  2. Pastikan bluetooth/USB terhubung ke perangkat.<br/>
                  3. Gunakan browser Google Chrome untuk kompatibilitas terbaik.<br/>
                  4. Coba refresh halaman aplikasi.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 text-center p-8 bg-muted/30 rounded-2xl border border-dashed">
          <p className="font-medium mb-2">Masih butuh bantuan?</p>
          <Link to="/contact">
            <Button>Hubungi Dukungan Pelanggan</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <BackButton />

      <div className="container max-w-4xl py-12 animate-fade-in">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Hubungi Kami</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Punya pertanyaan atau ingin kerjasama? Tim kami siap mendengarkan Anda.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <Card className="md:col-span-2 bg-primary text-primary-foreground border-none shadow-xl">
            <CardContent className="p-8 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Info Kontak</h3>
                <p className="text-primary-foreground/80 mb-8">Hubungi kami melalui saluran berikut untuk respon tercepat.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5" />
                    <span>0857-2742-1193</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5" />
                    <span>kisworodsp@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5" />
                    <span>Indonesia</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-primary-foreground/20">
                <div className="flex gap-4">
                  {/* Social Media Placeholders */}
                  <div className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center cursor-pointer">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.072 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 overflow-hidden">
             <div className="h-2 bg-gradient-to-r from-primary to-purple-500" />
            <CardContent className="p-8 space-y-8">
               <div className="grid gap-6">
                 <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="p-3 bg-green-500/10 rounded-full shrink-0">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">WhatsApp</h3>
                      <p className="text-muted-foreground mb-2 text-sm">Respon tercepat untuk bantuan teknis</p>
                      <a href="https://wa.me/6285727421193" target="_blank" rel="noreferrer">
                        <Button variant="outline" className="gap-2 border-green-500/30 text-green-600 hover:text-green-700 hover:bg-green-50">
                           Chat WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="p-3 bg-primary/10 rounded-full shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Email</h3>
                      <p className="text-muted-foreground mb-2 text-sm">Untuk proposal kerjasama & umum</p>
                      <a href="mailto:kisworodsp@gmail.com">
                        <Button variant="outline" className="gap-2">
                           Kirim Email
                        </Button>
                      </a>
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
