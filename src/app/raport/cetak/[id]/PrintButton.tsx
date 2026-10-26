"use client";

import React from "react";
import { Printer } from "lucide-react";

export const PrintButton: React.FC = () => {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-md hover:shadow-lg active:scale-95"
    >
      <Printer className="w-4 h-4 text-gold-400" />
      <span>Cetak Rapor A4 (Ctrl+P)</span>
    </button>
  );
};
