"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Leaf, AlertCircle, Mail, Lock, Loader2, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email hoặc mật khẩu không đúng.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Leaf className="w-10 h-10 text-primary fill-primary/20" />
          </div>
          <h1 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">
            Fruitholic
          </h1>
          <p className="text-on-surface-variant font-body mt-2 text-sm">
            Cổng quản trị hệ thống
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_20px_60px_rgba(43,48,45,0.08)]">
          <h2 className="text-xl font-bold font-headline mb-6 text-on-surface">
            Đăng nhập
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-error/10 text-error text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@fruitholic.vn"
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                />
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
