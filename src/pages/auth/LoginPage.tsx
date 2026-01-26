import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";

// Demo credentials
const DEMO_USERNAME = "user";
const DEMO_PASSWORD = "password";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Check demo credentials
    if (email === DEMO_USERNAME && password === DEMO_PASSWORD) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify({ username: DEMO_USERNAME, isDemo: true }));
      window.location.href = "/cashier"; // Force reload to update app state
    } else {
      setError("Username atau password salah. Gunakan akun demo di halaman depan.");
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
            Masukkan username dan password untuk masuk ke aplikasi
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
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="Masukkan username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-xs text-primary hover:underline">
                  Lupa password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Masuk
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
