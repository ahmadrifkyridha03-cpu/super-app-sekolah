"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  GraduationCap, 
  Layers, 
  CheckCircle, 
  FileText, 
  Menu, 
  X, 
  LogIn,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import DemoRoleSwitcher from "./DemoRoleSwitcher";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide Navbar when student is in active CBT exam
  if (pathname.startsWith("/cbt/exam/")) {
    return null;
  }

  const navLinks = [
    { href: "/", label: "Beranda", icon: BookOpen },
    { href: "/ppdb", label: "PPDB Online", icon: UserCheck, badge: "Buka" },
    { href: "/admin", label: "Administrasi", icon: Layers },
    { href: "/guru", label: "Buku Nilai & TP", icon: FileText },
    { href: "/cbt", label: "CBT Ujian", icon: CheckCircle },
    { href: "/raport", label: "E-Raport", icon: GraduationCap },
    { href: "/siswa", label: "Portal Siswa", icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm no-print">
      {/* Top Academic Ribbon */}
      <div className="bg-navy-900 text-slate-200 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-navy-950">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-gold-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Terakreditasi A (Unggul)
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">NPSN: 20104050 • Kemdikbudristek</span>
        </div>
        <div className="flex items-center gap-4">
          <DemoRoleSwitcher />
          <Link
            href="/login"
            className="flex items-center gap-1 text-slate-200 hover:text-white font-medium transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login Portal</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & School Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src="/images/logo.svg"
                alt="Logo SMA Negeri Unggulan Bangsa"
                fill
                className="object-contain transition-transform group-hover:scale-105"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-navy-900 text-base sm:text-lg tracking-tight leading-none group-hover:text-gold-600 transition">
                SMAN UNGGULAN BANGSA
              </span>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
                Portal Akademik, CBT & E-Raport
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all relative ${
                    isActive
                      ? "text-navy-900 bg-navy-50 font-extrabold"
                      : "text-slate-600 hover:text-navy-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-gold-600" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gold-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold ${
                  isActive ? "bg-navy-50 text-navy-900" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-gold-600" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-100 text-emerald-800">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
