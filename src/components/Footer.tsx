import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Globe, Shield, Award, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: School Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/images/logo.svg"
                  alt="Logo SMA Negeri Unggulan Bangsa"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative w-12 h-12">
                <Image
                  src="/images/logo-tut-wuri.svg"
                  alt="Logo Tut Wuri Handayani"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg tracking-tight">
                  SMA NEGERI UNGGULAN BANGSA
                </h3>
                <p className="text-xs text-gold-400 font-semibold tracking-wider">
                  Mencetak Generasi Berakhlak, Unggul & Berprestasi
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Sistem Informasi Terpadu yang mengintegrasikan Penerimaan Siswa Baru (PPDB),
              Manajemen Master Data Dapodik, Penilaian Kurikulum Merdeka (TP-based), E-Raport Berstandar Nasional,
              dan Mesin Ujian CBT Anti-Curang.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1 bg-navy-900 px-3 py-1 rounded-full border border-navy-800 text-gold-400 font-bold">
                <Award className="w-3.5 h-3.5" /> Akreditasi A (Unggul)
              </span>
              <span className="flex items-center gap-1 bg-navy-900 px-3 py-1 rounded-full border border-navy-800 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> NPSN: 20104050
              </span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-navy-800 pb-2">
              Modul Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/ppdb" className="hover:text-gold-400 transition">
                  Pendaftaran PPDB Online
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-gold-400 transition">
                  Master Data Siswa & Guru
                </Link>
              </li>
              <li>
                <Link href="/guru" className="hover:text-gold-400 transition">
                  Buku Nilai Kurikulum Merdeka
                </Link>
              </li>
              <li>
                <Link href="/cbt" className="hover:text-gold-400 transition">
                  Ujian CBT & Ruang Proktor
                </Link>
              </li>
              <li>
                <Link href="/raport" className="hover:text-gold-400 transition">
                  Cetak Raport & QR Verifikasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-navy-800 pb-2">
              Sekretariat Sekolah
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span>Jl. Pendidikan No. 45, Menteng, Jakarta Pusat, DKI Jakarta 10310</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <span>(021) 555-0199 / 0812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                <span>info@sekolah.sch.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gold-500 shrink-0" />
                <span>https://sekolah.sch.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-navy-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <p>© 2026 SMA Negeri Unggulan Bangsa. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-1">
            Dirancang dengan dedikasi untuk kemajuan pendidikan Indonesia <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
