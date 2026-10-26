"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  UserPlus, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  School, 
  FileCheck, 
  Search, 
  AlertCircle 
} from "lucide-react";

export default function PpdbPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    nisn: "",
    birthPlace: "",
    birthDate: "",
    originSchool: "",
    targetMajor: "MIPA",
    parentName: "",
    parentPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ registrationNo: string; fullName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ppdb/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pendaftaran gagal");

      setResult({
        registrationNo: data.registrationNo,
        fullName: data.fullName,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Banner */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-50 text-gold-800 border border-gold-200">
          Tahun Ajaran 2026/2027
        </span>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Penerimaan Peserta Didik Baru (PPDB) Online
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Silakan isi formulir resmi di bawah ini dengan data yang sesuai pada Ijazah SMP/MTs dan Kartu Keluarga.
        </p>
      </div>

      {result ? (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl p-8 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-navy-900">Pendaftaran Berhasil Dikirim!</h2>
            <p className="text-sm text-slate-600">
              Terima kasih, berkas pendaftaran calon siswa <strong>{result.fullName}</strong> telah berhasil kami terima.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-sm mx-auto space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nomor Registrasi Resmi
            </div>
            <div className="text-3xl font-black text-navy-900 font-tabular tracking-wider">
              {result.registrationNo}
            </div>
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg">
              Simpan dan catat nomor ini untuk memeriksa pengumuman kelulusan berkas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/ppdb/status"
              className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Cek Status Sekarang</span>
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setFormData({
                  fullName: "",
                  nisn: "",
                  birthPlace: "",
                  birthDate: "",
                  originSchool: "",
                  targetMajor: "MIPA",
                  parentName: "",
                  parentPhone: "",
                });
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Daftar Siswa Lain
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Top Info Bar */}
          <div className="bg-navy-900 text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold">Formulir Pendaftaran Siswa Baru</h2>
              <p className="text-xs text-slate-300">Isi seluruh data dengan benar untuk verifikasi berkas dinas</p>
            </div>
            <Link
              href="/ppdb/status"
              className="flex items-center gap-1.5 text-xs font-bold text-gold-300 hover:text-white transition bg-navy-800 px-3 py-1.5 rounded-lg border border-navy-700"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Sudah Daftar? Cek Status</span>
            </Link>
          </div>

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Section 1: Data Calon Siswa */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold-700 border-b pb-1">
                1. Identitas Calon Siswa
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Lengkap Siswa*</label>
                  <input
                    type="text"
                    required
                    placeholder="Sesuai Akta Kelahiran / Ijazah"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">NISN (10 Digit)*</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="00xxxxxxxx"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition font-tabular"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tempat Lahir*</label>
                  <input
                    type="text"
                    required
                    placeholder="Kota / Kabupaten"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tanggal Lahir (YYYY-MM-DD)*</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition font-tabular"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pilihan Peminatan & Sekolah Asal */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold-700 border-b pb-1">
                2. Sekolah Asal & Pilihan Peminatan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Sekolah Asal (SMP / MTs)*</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama SMP/MTs Asal"
                    value={formData.originSchool}
                    onChange={(e) => setFormData({ ...formData, originSchool: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pilihan Peminatan Kurikulum*</label>
                  <select
                    value={formData.targetMajor}
                    onChange={(e) => setFormData({ ...formData, targetMajor: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition bg-white"
                  >
                    <option value="MIPA">Matematika & Ilmu Pengetahuan Alam (MIPA)</option>
                    <option value="IPS">Ilmu Pengetahuan Sosial (IPS)</option>
                    <option value="BAHASA">Bahasa & Budaya</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Data Orang Tua / Wali */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold-700 border-b pb-1">
                3. Data Orang Tua / Wali Murid
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Orang Tua / Wali*</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Ayah / Ibu / Wali"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nomor WhatsApp Orang Tua*</label>
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition font-tabular"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gold-600 hover:bg-gold-500 text-white font-extrabold text-xs transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Kirim Berkas Pendaftaran PPDB</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
