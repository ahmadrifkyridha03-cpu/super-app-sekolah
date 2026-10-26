"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  User, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap, 
  School,
  Sparkles 
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"siswa" | "guru" | "admin">("siswa");
  const [username, setUsername] = useState("0081234567"); // Default NISN Ahmad Fauzi
  const [password, setPassword] = useState("siswa123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (selectedTab: "siswa" | "guru" | "admin") => {
    setTab(selectedTab);
    setError(null);
    if (selectedTab === "siswa") {
      setUsername("0081234567");
      setPassword("siswa123");
    } else if (selectedTab === "guru") {
      setUsername("198002152005011004");
      setPassword("guru123");
    } else {
      setUsername("admin");
      setPassword("admin123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk");
      }

      // Route based on role
      if (data.user.role === "SUPER_ADMIN" || data.user.role === "ADMIN_TU") {
        router.push("/admin");
      } else if (data.user.role === "GURU") {
        router.push("/guru");
      } else {
        router.push("/cbt");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <Image
              src="/images/logo.svg"
              alt="Logo Sekolah"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Portal Masuk Terpadu
          </h1>
          <p className="text-xs text-slate-500">
            SMA Negeri Unggulan Bangsa • Tahun Ajaran 2026/2027
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => handleTabChange("siswa")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                tab === "siswa"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-slate-600 hover:text-navy-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-gold-600" />
              <span>Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("guru")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                tab === "guru"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-slate-600 hover:text-navy-900"
              }`}
            >
              <School className="w-3.5 h-3.5 text-navy-800" />
              <span>Guru</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("admin")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                tab === "admin"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-slate-600 hover:text-navy-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
              <span>Admin TU</span>
            </button>
          </div>

          {/* Quick Demo Fill Notice */}
          <div className="p-3 bg-gold-50 border border-gold-200 rounded-xl flex items-start gap-2.5 text-xs text-gold-900">
            <Sparkles className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Mode Demo Aktif:</span> Kredensial akun {tab} terisi otomatis. Anda dapat langsung menekan tombol Masuk.
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{tab === "siswa" ? "NISN Siswa" : tab === "guru" ? "NIP Guru" : "Username"}</span>
                <span className="text-[10px] text-slate-400 font-normal">Format resmi</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={tab === "siswa" ? "10 digit NISN" : "NIP / Username"}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition font-tabular"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-slate-400 font-normal">Tersandi bcrypt</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun {tab === "siswa" ? "Siswa" : tab === "guru" ? "Guru" : "Admin"}</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Butuh bantuan akses login? Hubungi </span>
            <span className="text-navy-900 font-bold">Staf Tata Usaha</span>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link href="/" className="text-xs font-bold text-slate-500 hover:text-navy-900 transition">
            ← Kembali ke Beranda Sekolah
          </Link>
        </div>
      </div>
    </div>
  );
}
