import React from "react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  CheckCircle2, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  Award, 
  BookOpen, 
  Layers, 
  Cpu, 
  Calendar, 
  FileSpreadsheet,
  Users,
  Compass
} from "lucide-react";

export const revalidate = 60; // ISR cache 60s

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const profile = await prisma.schoolProfile.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden bg-navy-950 text-white">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-school.jpg"
            alt="Kampus SMA Negeri Unggulan Bangsa"
            fill
            className="object-cover opacity-35 scale-105 animate-in fade-in duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl space-y-6">
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs font-bold tracking-wide backdrop-blur-sm">
              <Award className="w-4 h-4 text-gold-400" />
              <span>TERAKREDITASI A (UNGGUL) • KEMDIKBUDRISTEK</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Mencetak Generasi Berakhlak, <span className="text-gold-400 underline decoration-gold-500/50 decoration-wavy decoration-2">Unggul</span> & Siap Memimpin Bangsa
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Selamat datang di portal resmi <strong>{profile?.name || "SMA Negeri Unggulan Bangsa"}</strong>. 
              Menerapkan Kurikulum Merdeka berbasis Tujuan Pembelajaran (TP), ekosistem ujian CBT anti-curang,
              dan pelaporan e-raport digital berstandar nasional.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/ppdb"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-white font-extrabold text-sm transition-all shadow-lg hover:shadow-gold-500/25 active:scale-95"
              >
                <span>Daftar PPDB Online 2026</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition-all backdrop-blur-md active:scale-95"
              >
                <span>Masuk Portal Ujian / Akademik</span>
              </Link>
            </div>

            {/* Quick Points */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Kurikulum Merdeka 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                <span>CBT Anti-Cheat & LaTeX</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                <span>E-Raport Ber-QR Code</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 border-r border-slate-100 last:border-none">
            <div className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-tabular">100%</div>
            <div className="text-xs font-semibold text-slate-500">Kelulusan Siswa</div>
          </div>
          <div className="space-y-1 border-r border-slate-100 last:border-none">
            <div className="text-3xl sm:text-4xl font-extrabold text-gold-600 font-tabular">98.4</div>
            <div className="text-xs font-semibold text-slate-500">Skor Akreditasi Unggul</div>
          </div>
          <div className="space-y-1 border-r border-slate-100 last:border-none">
            <div className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-tabular">85%+</div>
            <div className="text-xs font-semibold text-slate-500">Diterima di PTN Favorit</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-tabular">42+</div>
            <div className="text-xs font-semibold text-slate-500">Guru Bersertifikasi Nasional</div>
          </div>
        </div>
      </section>

      {/* 3. INTEGRATED MODULES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest bg-gold-50 px-3 py-1 rounded-full border border-gold-200">
            Ekosistem Pendidikan Digital
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Enam Pilar Sistem Terpadu Sekolah
          </h2>
          <p className="text-sm text-slate-600">
            Seluruh layanan sekolah terintegrasi dalam satu platform: dari pendaftaran siswa, buku nilai guru, hingga ujian CBT berstandar proktor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: PPDB */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-navy-900 group-hover:text-gold-600 transition">
              PPDB Online Transparan
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pendaftaran peserta didik baru melalui jalur Prestasi, Afirmasi, dan Zonasi dengan nomor registrasi unik dan fitur pelacakan status 2FA mandiri.
            </p>
            <Link href="/ppdb" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
              <span>Buka Formulir PPDB</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: CBT Engine */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center font-bold">
              <Cpu className="w-6 h-6 text-navy-800" />
            </div>
            <h3 className="text-base font-extrabold text-navy-900 group-hover:text-gold-600 transition">
              CBT Engine Anti-Curang
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dilengkapi formula matematika/kimia KaTeX, penguncian layar otomatis saat beralih tab, token ujian acak, dan autosave atomik monotonic counter.
            </p>
            <Link href="/cbt" className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-800 hover:text-navy-900">
              <span>Masuk Ruang Ujian</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Gradebook */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6 text-gold-600" />
            </div>
            <h3 className="text-base font-extrabold text-navy-900 group-hover:text-gold-600 transition">
              Buku Nilai Kurikulum Merdeka
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Penilaian terperinci per Tujuan Pembelajaran (TP). Menghasilkan narasi capaian kompetensi tertinggi dan terendah siswa secara otomatis dan akurat.
            </p>
            <Link href="/guru" className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-700 hover:text-gold-800">
              <span>Buka Buku Nilai</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: E-Raport */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="text-base font-extrabold text-navy-900 group-hover:text-gold-600 transition">
              E-Raport & Cetak A4
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Format cetak resmi KOP sekolah, pembobotan nilai akhir, catatan wali kelas, projek P5, ekstrakurikuler, dan verifikasi QR Code keaslian dokumen.
            </p>
            <Link href="/raport" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800">
              <span>Lihat Rekap Raport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 5: Master Data & Excel Import */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6 text-purple-700" />
            </div>
            <h3 className="text-base font-extrabold text-navy-900 group-hover:text-gold-600 transition">
              Sinkronisasi Dapodik & Excel
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Memfasilitasi staf TU mengunggah dan mengunduh data master ribuan siswa dan guru secara instan menggunakan template resmi Excel (.xlsx).
            </p>
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800">
              <span>Kelola Master Data</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 6: Absensi Harian */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6 text-amber-700" />
            </div>
            <h3 className="text-base font-extrabold text-navy-900 group-hover:text-gold-600 transition">
              Absensi & Dispensasi Lomba
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pencatatan kehadiran harian resmi dengan status Sakit, Izin, Alpa, serta status khusus Dispensasi yang langsung tercermin di lembar rapor.
            </p>
            <Link href="/guru" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800">
              <span>Buka Presensi Kelas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. BERITA & PRESTASI TERKINI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">Warta Kampus</span>
            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight mt-1">
              Berita, Pengumuman & Prestasi
            </h2>
          </div>
          <Link href="/ppdb" className="text-xs font-bold text-navy-800 hover:text-gold-600 flex items-center gap-1">
            <span>Lihat Informasi PPDB Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-2.5 py-1 rounded-full font-bold bg-navy-50 text-navy-800">
                    {item.category}
                  </span>
                  <span className="text-slate-400">
                    {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(item.createdAt)}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-navy-900 line-clamp-2 hover:text-gold-600 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {item.content}
                </p>
              </div>
              <div className="px-6 pb-6 pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>Oleh: {item.authorName}</span>
                <span className="font-bold text-navy-800">Baca Selengkapnya →</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. PPDB CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-navy-800">
          <div className="space-y-4 max-w-xl z-10 text-center lg:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-500/20 text-gold-300 border border-gold-400/30">
              Tahun Ajaran 2026/2027
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Penerimaan Siswa Baru (PPDB) Telah Dibuka
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Bergabunglah bersama keluarga besar {profile?.name || "SMA Negeri Unggulan Bangsa"}. 
              Pendaftaran mudah secara online dengan kuota jalur Prestasi Akademik, Zonasi, dan Afirmasi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full lg:w-auto">
            <Link
              href="/ppdb"
              className="w-full sm:w-auto text-center px-8 py-3.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-white font-extrabold text-sm transition shadow-lg hover:shadow-gold-500/30"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/ppdb/status"
              className="w-full sm:w-auto text-center px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition backdrop-blur-sm"
            >
              Cek Status Pendaftaran
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
