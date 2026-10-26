"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock, CheckCircle2, Clock, Send, ShieldAlert } from "lucide-react";

interface ProctorClientActionsProps {
  sessions: any[];
  totalQuestions: number;
}

export const ProctorClientActions: React.FC<ProctorClientActionsProps> = ({ sessions, totalQuestions }) => {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (sessionId: string, action: "UNLOCK" | "FORCE_SUBMIT") => {
    setLoadingId(sessionId);
    try {
      const res = await fetch("/api/cbt/proctor-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((s) => {
        const answeredCount = s.answers.filter((a: any) => a.answerText && a.answerText.trim().length > 0).length;
        const isLocked = s.status === "LOCKED";
        const isSubmitted = s.status === "SUBMITTED";

        return (
          <div
            key={s.id}
            className={`p-5 rounded-2xl border transition shadow-sm space-y-4 ${
              isLocked
                ? "bg-red-50/50 border-red-300 ring-1 ring-red-300"
                : isSubmitted
                ? "bg-slate-50 border-slate-200 opacity-90"
                : "bg-white border-slate-200 hover:shadow-md"
            }`}
          >
            {/* Header: Student Info */}
            <div className="flex justify-between items-start gap-2">
              <div>
                <h4 className="font-extrabold text-xs text-navy-900 leading-snug">{s.student.user.name}</h4>
                <p className="text-[10px] text-slate-500 font-tabular">NISN: {s.student.nisn} • {s.student.classRoom.name}</p>
              </div>

              {/* Status Badge */}
              {isLocked ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200">
                  <Lock className="w-3 h-3 text-red-600" />
                  <span>TERKUNCI</span>
                </span>
              ) : isSubmitted ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  <span>SELESAI ({s.finalScore ?? 0})</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>MENGERJAKAN</span>
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
                <span>Progres Pengerjaan</span>
                <span className="font-tabular font-bold">{answeredCount} / {totalQuestions} Soal</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-navy-900 transition-all rounded-full"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Anti-Cheat Violations Counter */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 text-[11px] flex items-center gap-1">
                <ShieldAlert className={`w-3.5 h-3.5 ${s.tabSwitchCount > 0 ? "text-red-500" : "text-slate-400"}`} />
                Pindah Tab:
              </span>
              <span className={`font-tabular font-bold ${s.tabSwitchCount >= 3 ? "text-red-600 font-black" : "text-slate-700"}`}>
                {s.tabSwitchCount} / 3
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              {isLocked ? (
                <button
                  type="button"
                  disabled={loadingId === s.id}
                  onClick={() => handleAction(s.id, "UNLOCK")}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Buka Kunci Sesi</span>
                </button>
              ) : !isSubmitted ? (
                <button
                  type="button"
                  disabled={loadingId === s.id}
                  onClick={() => handleAction(s.id, "FORCE_SUBMIT")}
                  className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kumpulkan Paksa</span>
                </button>
              ) : (
                <div className="text-center w-full text-[11px] text-slate-400 font-medium">
                  Ujian telah disahkan
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProctorClientActions;
