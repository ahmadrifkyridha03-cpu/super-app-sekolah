"use client";

import React, { useState, useEffect, useRef, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Bookmark, 
  Send, 
  ShieldAlert,
  Lock,
  ArrowLeft
} from "lucide-react";
import KatexRenderer from "@/components/KatexRenderer";

interface ExamPageProps {
  params: Promise<{ id: string }>;
}

export default function ExamExecutionPage({ params }: ExamPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { text: string; doubtful: boolean; seq: number }>>({});
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60); // In seconds
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const seqCounter = useRef(1);

  // Fetch Session Data
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/cbt/session-data?sessionId=${sessionId}`);
        if (!res.ok) throw new Error("Gagal memuat sesi ujian");
        const data = await res.json();

        setSession(data.session);
        setTabSwitchCount(data.session.tabSwitchCount || 0);
        if (data.session.status === "LOCKED") setIsLocked(true);
        if (data.session.status === "SUBMITTED") {
          setIsSubmitted(true);
          setFinalScore(data.session.finalScore);
        }

        // Initialize answers map
        const ansMap: Record<string, { text: string; doubtful: boolean; seq: number }> = {};
        for (const a of data.session.answers || []) {
          ansMap[a.examQuestionId] = {
            text: a.answerText || "",
            doubtful: Boolean(a.isDoubtful),
            seq: a.seq || 1,
          };
        }
        setAnswers(ansMap);

        // Calculate remaining seconds
        const deadline = new Date(data.session.deadline).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((deadline - now) / 1000));
        setTimeLeft(diff);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  // Finalize Submission
  const handleFinalize = useCallback(async (isAuto = false) => {
    if (isLocked || isSubmitted) return;
    if (!isAuto) {
      const confirm = window.confirm("Apakah Anda yakin ingin menyelesaikan dan mengumpulkan ujian ini sekarang?");
      if (!confirm) return;
    }

    try {
      const res = await fetch("/api/cbt/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSubmitted(true);
        setFinalScore(data.finalScore);
      }
    } catch (err) {
      console.error("Finalize error:", err);
    }
  }, [isLocked, isSubmitted, sessionId]);

  const handleFinalizeRef = useRef(handleFinalize);
  useEffect(() => {
    handleFinalizeRef.current = handleFinalize;
  }, [handleFinalize]);

  // Countdown Timer
  useEffect(() => {
    if (loading || isLocked || isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalizeRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isLocked, isSubmitted, timeLeft]);

  // Anti-Cheat: Tab Switch Detection
  useEffect(() => {
    if (isLocked || isSubmitted) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        try {
          const res = await fetch("/api/cbt/tab-switch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          setTabSwitchCount(data.tabSwitchCount);
          setShowWarningModal(true);
          if (data.isLocked) {
            setIsLocked(true);
          }
        } catch (err) {
          console.error("Tab switch reporting failed:", err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sessionId, isLocked, isSubmitted]);

  // Autosave handler with Monotonic sequence
  const handleSelectOption = async (examQuestionId: string, optionValue: string) => {
    if (isLocked || isSubmitted) return;

    seqCounter.current += 1;
    const currentSeq = seqCounter.current;
    const isDoubtful = answers[examQuestionId]?.doubtful || false;

    // Optimistic UI update
    setAnswers((prev) => ({
      ...prev,
      [examQuestionId]: {
        text: optionValue,
        doubtful: isDoubtful,
        seq: currentSeq,
      },
    }));

    // Server Autosave
    try {
      await fetch("/api/cbt/autosave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          examQuestionId,
          answerText: optionValue,
          isDoubtful,
          seq: currentSeq,
        }),
      });
    } catch (err) {
      console.error("Autosave failed:", err);
    }
  };

  const handleToggleDoubtful = async (examQuestionId: string) => {
    if (isLocked || isSubmitted) return;

    seqCounter.current += 1;
    const currentSeq = seqCounter.current;
    const currentAnswer = answers[examQuestionId]?.text || "";
    const newDoubtful = !answers[examQuestionId]?.doubtful;

    setAnswers((prev) => ({
      ...prev,
      [examQuestionId]: {
        text: currentAnswer,
        doubtful: newDoubtful,
        seq: currentSeq,
      },
    }));

    try {
      await fetch("/api/cbt/autosave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          examQuestionId,
          answerText: currentAnswer,
          isDoubtful: newDoubtful,
          seq: currentSeq,
        }),
      });
    } catch (err) {
      console.error("Autosave failed:", err);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold tracking-wider uppercase">Memuat Soal Ujian & Sinkronisasi Waktu...</p>
        </div>
      </div>
    );
  }

  // Format Time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const questions = session?.exam?.examQuestions || [];
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentEqId = currentQ?.id;
  const currentAnswer = answers[currentEqId]?.text || "";
  const isCurrentDoubtful = answers[currentEqId]?.doubtful || false;

  const parsedOptions: string[] = currentQ?.question?.options
    ? JSON.parse(currentQ.question.options)
    : [];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* 1. TOP HEADER: CBT Bar */}
      <header className="bg-navy-950 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-navy-900 shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold-600 flex items-center justify-center font-black text-xs">
            CBT
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-extrabold tracking-tight truncate max-w-[200px] sm:max-w-md">
              {session?.exam?.title}
            </h1>
            <p className="text-[10px] text-slate-400">
              Siswa: <strong>{session?.student?.user?.name}</strong> (NISN: {session?.student?.nisn})
            </p>
          </div>
        </div>

        {/* Server Countdown Timer */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-xs sm:text-sm font-bold font-tabular shadow-inner ${
            timeLeft < 300
              ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
              : "bg-navy-900 text-gold-400 border-navy-800"
          }`}>
            <Clock className="w-4 h-4 shrink-0" />
            <span>Sisa Waktu: {timeFormatted}</span>
          </div>

          <button
            onClick={() => handleFinalize(false)}
            disabled={isLocked || isSubmitted}
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-white font-extrabold text-xs transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Selesai Ujian</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN EXAM BODY */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question Content & Options (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            {/* Question Info Bar */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 text-xs">
              <span className="font-extrabold text-navy-900 px-3 py-1 bg-navy-50 rounded-lg border border-navy-200">
                Soal Nomor {currentIndex + 1} dari {totalQuestions}
              </span>

              <button
                onClick={() => handleToggleDoubtful(currentEqId)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold transition text-xs ${
                  isCurrentDoubtful
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isCurrentDoubtful ? "fill-amber-600 text-amber-600" : ""}`} />
                <span>Ragu-ragu</span>
              </button>
            </div>

            {/* Question Statement with KaTeX */}
            <div className="text-base text-slate-900 leading-relaxed min-h-[100px]">
              <KatexRenderer content={currentQ?.question?.content || ""} />
            </div>

            {/* Multiple Choice Options */}
            {currentQ?.question?.type === "MULTIPLE_CHOICE" ? (
              <div className="space-y-3 pt-2">
                {parsedOptions.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx); // "A", "B", "C", ...
                  const isSelected = currentAnswer.startsWith(letter);

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isLocked || isSubmitted}
                      onClick={() => handleSelectOption(currentEqId, letter)}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition ${
                        isSelected
                          ? "bg-navy-900 text-white border-navy-900 shadow-md"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? "bg-gold-500 text-navy-950" : "bg-white border border-slate-300 text-navy-900"
                      }`}>
                        {letter}
                      </span>
                      <div className="pt-0.5 text-xs sm:text-sm font-medium flex-1">
                        <KatexRenderer content={opt.replace(/^[A-E]\.\s*/, "")} className={isSelected ? "text-white" : ""} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Essay Box */
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">Tulis Jawaban Essay Anda:</label>
                <textarea
                  rows={6}
                  disabled={isLocked || isSubmitted}
                  value={currentAnswer}
                  onChange={(e) => handleSelectOption(currentEqId, e.target.value)}
                  placeholder="Ketik jawaban lengkap beserta langkah perhitungan..."
                  className="w-full p-4 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 leading-relaxed font-mono"
                />
              </div>
            )}

            {/* Bottom Nav Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                disabled={currentIndex === totalQuestions - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Number Grid Panel (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-extrabold text-xs text-navy-900 uppercase tracking-wider border-b pb-2">
              Navigasi Nomor Soal
            </h3>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q: any, idx: number) => {
                const ans = answers[q.id];
                const hasAnswer = Boolean(ans?.text && ans.text.trim().length > 0);
                const isDoubtful = Boolean(ans?.doubtful);
                const isCurrent = idx === currentIndex;

                let colorClasses = "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
                if (isCurrent) {
                  colorClasses = "ring-2 ring-navy-900 border-navy-900 font-black";
                }
                if (isDoubtful) {
                  colorClasses = "bg-amber-400 text-amber-950 border-amber-500 font-bold";
                } else if (hasAnswer) {
                  colorClasses = "bg-emerald-600 text-white border-emerald-700 font-bold";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl border flex items-center justify-center text-xs font-tabular transition ${colorClasses}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 pt-3 border-t text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 shrink-0" />
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 shrink-0" />
                <span>Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300 shrink-0" />
                <span>Belum Dijawab</span>
              </div>
            </div>

            {/* Anti-Cheat Violations Counter */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-red-800">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Pelanggaran Pindah Tab:</span>
              </div>
              <p className="text-red-700 font-tabular font-extrabold text-sm">
                {tabSwitchCount} dari 3 Kali Batas Maksimal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: TAB SWITCH WARNING */}
      {showWarningModal && !isLocked && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-red-200 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-navy-900">Peringatan Berpindah Tab!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda terdeteksi meninggalkan halaman ujian. Pelanggaran ke-<strong>{tabSwitchCount}</strong> dari 3 telah tercatat di monitor proktor.
            </p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-extrabold text-xs transition"
            >
              Saya Mengerti & Lanjutkan Ujian
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: SESSION LOCKED (AUTO-PENALTY) */}
      {isLocked && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl border border-red-300">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-navy-900">Ujian Telah Dikunci Otomatis</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda telah melampaui batas toleransi berpindah tab/jendela (3 kali). Sesi ujian Anda telah dibekukan. 
                Silakan melapor kepada guru pengawas/proktor di ruang ujian untuk membuka kembali sesi Anda.
              </p>
            </div>
            <Link
              href="/cbt"
              className="block w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Kembali ke Menu CBT
            </Link>
          </div>
        </div>
      )}

      {/* MODAL 3: EXAM SUBMITTED */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl border border-emerald-200 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-navy-900">Ujian Berhasil Dikumpulkan!</h2>
              <p className="text-xs text-slate-600">
                Seluruh jawaban telah tersimpan dengan aman di server basis data sekolah.
              </p>
            </div>

            {finalScore !== null && (
              <div className="p-4 bg-navy-50 rounded-xl border border-navy-100 space-y-1">
                <span className="text-xs font-semibold text-slate-500">Skor Hasil Ujian CBT:</span>
                <div className="text-4xl font-black text-navy-900 font-tabular">{finalScore}</div>
              </div>
            )}

            <Link
              href="/cbt"
              className="block w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-extrabold text-xs transition shadow-md"
            >
              Kembali ke Portal CBT
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
