"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, Clock, XCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function PpdbStatusPage() {
  const [registrationNo, setRegistrationNo] = useState("PPDB-2026-001"); // Preset with demo
  const [birthDate, setBirthDate] = useState("2011-03-10");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ppdb/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNo, birthDate }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memeriksa status");

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2 text-center">
        <Link href="/ppdb" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy-900 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Pendaftaran PPDB</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          Cek Status Pendaftaran PPDB
        </h1>
        <p className="text-xs text-slate-600">
          Masukkan Nomor Registrasi dan Tanggal Lahir calon siswa untuk verifikasi 2FA yang aman.
        </p>
      </div>

      {/* Search Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Nomor Registrasi PPDB</label>
            <input
              type="text"
              required
              placeholder="Contoh: PPDB-2026-0001"
              value={registrationNo}
              onChange={(e) => setRegistrationNo(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 font-tabular font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Tanggal Lahir Siswa (2FA Key)</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 font-tabular"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Periksa Hasil Seleksi Berkas</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Nomor Registrasi</span>
              <div className="text-xl font-extrabold text-navy-900 font-tabular">{result.registrationNo}</div>
            </div>

            {/* Status Badge */}
            {result.status === "ACCEPTED" ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>DITERIMA SELEKSI BERKAS</span>
              </div>
            ) : result.status === "REJECTED" ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-800 border border-red-200 text-xs font-bold">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>BELUM MEMENUHI SYARAT</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>SEDANG DIVERIFIKASI TIM TU</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Nama Lengkap</span>
              <span className="font-bold text-navy-900">{result.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">NISN</span>
              <span className="font-bold text-navy-900 font-tabular">{result.nisn}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Asal Sekolah</span>
              <span className="font-bold text-navy-900">{result.originSchool}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Peminatan Pilihan</span>
              <span className="font-bold text-navy-900">{result.targetMajor}</span>
            </div>
          </div>

          {result.notes && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-navy-900">Catatan Panitia PPDB:</span>
              <p className="text-slate-600">{result.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
