import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Eye, EyeOff, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Generate random CAPTCHA code
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput("");
    setCaptchaError("");
  };

  // Initialize CAPTCHA on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCaptchaError("");

    // Validate CAPTCHA
    if (captchaInput.toUpperCase() !== captchaCode) {
      setCaptchaError("Kode CAPTCHA tidak cocok. Silakan coba lagi.");
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      // Clear old token before login
      api.clearToken();
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");

      const response = await api.login(email, password);
      // Store the token
      api.setToken(response.token);
      // Store user info
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("isAuthenticated", "true");
      // Redirect to cashier
      window.location.href = "/cashier";
    } catch (err: any) {
      setError(err.message || "Email atau password salah. Gunakan akun demo di halaman depan.");
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Masuk</CardTitle>
          <CardDescription>
            Masukkan email dan password untuk masuk ke aplikasi
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-xs text-primary hover:underline">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="space-y-2">
              <Label htmlFor="captcha">Verifikasi Keamanan</Label>
              <div className="flex items-center gap-2">
                {/* CAPTCHA Image */}
                <div 
                  className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border rounded-md px-4 py-2 select-none"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    letterSpacing: '4px',
                    textDecoration: 'line-through',
                    textDecorationColor: '#ef4444',
                    textDecorationThickness: '2px',
                    color: '#374151',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                    minWidth: '140px',
                    textAlign: 'center',
                    userSelect: 'none'
                  }}
                >
                  {captchaCode.split('').map((char, i) => (
                    <span 
                      key={i} 
                      style={{
                        display: 'inline-block',
                        transform: `rotate(${Math.random() * 20 - 10}deg)`,
                        color: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 5]
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  title="Generate CAPTCHA baru"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <Input
                id="captcha"
                type="text"
                placeholder="Masukkan kode di atas"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
                disabled={isLoading}
                maxLength={4}
                className="uppercase"
              />
              {captchaError && (
                <p className="text-sm text-red-600">{captchaError}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Belum punya akun?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Daftar sekarang
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
