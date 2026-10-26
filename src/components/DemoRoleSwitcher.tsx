"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Shield, GraduationCap, School, LogIn, ChevronDown, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export const DemoRoleSwitcher: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>("Tamu / Publik");

  useEffect(() => {
    // Check current session from local storage or cookie
    const savedRole = localStorage.getItem("demo_role");
    if (savedRole) setCurrentRole(savedRole);
  }, []);

  const roles = [
    {
      id: "admin",
      label: "Super Admin",
      sublabel: "Akses penuh sistem & master data",
      icon: Shield,
      color: "bg-red-50 text-red-700 border-red-200",
      username: "admin",
      targetUrl: "/admin",
    },
    {
      id: "wali_kelas",
      label: "Guru & Wali Kelas X-A",
      sublabel: "Drs. Budi Santoso, M.Pd. (Ledger, TP, CBT)",
      icon: School,
      color: "bg-navy-50 text-navy-800 border-navy-200",
      username: "198002152005011004",
      targetUrl: "/guru",
    },
    {
      id: "siswa",
      label: "Siswa (Kelas X-A)",
      sublabel: "Ahmad Fauzi Pratama (CBT & E-Raport)",
      icon: GraduationCap,
      color: "bg-amber-50 text-amber-800 border-amber-200",
      username: "0081234567",
      targetUrl: "/siswa",
    },
    {
      id: "guest",
      label: "Calon Siswa (PPDB)",
      sublabel: "Portal Pendaftaran & Info Publik",
      icon: UserCheck,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      username: "guest",
      targetUrl: "/ppdb",
    },
  ];

  const handleSwitch = async (roleItem: (typeof roles)[0]) => {
    try {
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleItem.id, username: roleItem.username }),
      });

      if (res.ok) {
        localStorage.setItem("demo_role", roleItem.label);
        setCurrentRole(roleItem.label);
        setIsOpen(false);
        router.push(roleItem.targetUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("Demo switch failed:", err);
    }
  };

  return (
    <div className="relative inline-block no-print z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-gold-50 border border-gold-300 text-gold-900 hover:bg-gold-100 transition shadow-sm"
      >
        <Sparkles className="w-3.5 h-3.5 text-gold-600 animate-pulse" />
        <span className="hidden sm:inline text-slate-600">Demo Role:</span>
        <span className="font-bold text-navy-900">{currentRole}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-2 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-xs font-bold text-navy-900 uppercase tracking-wider">Demo Quick Switcher</p>
            <p className="text-[11px] text-slate-500">Beralih peran 1-klik untuk pengujian fitur</p>
          </div>

          <div className="space-y-1">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSwitch(r)}
                  className={`w-full text-left p-2.5 rounded-lg border flex items-start gap-3 transition hover:shadow-sm ${r.color}`}
                >
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">{r.label}</div>
                    <div className="text-[10px] opacity-80">{r.sublabel}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoRoleSwitcher;
