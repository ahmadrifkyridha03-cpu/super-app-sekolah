"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  Layers, 
  Clock, 
  Users, 
  Key, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  Send,
  BookOpen,
  CheckCircle2,
  Lock
} from "lucide-react";

interface QuestionBankOption {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  totalQuestions: number;
  createdAt: string;
}

interface ClassOption {
  id: string;
  name: string;
  grade: number;
}

export const AdminExamManagementView: React.FC = () => {
  const [banks, setBanks] = useState<QuestionBankOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Fields
  const [examTitle, setExamTitle] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [category, setCategory] = useState<"HARIAN" | "UTS" | "UAS" | "REMEDIAL">("HARIAN");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [token, setToken] = useState("");

  const loadBankOptions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/exams/create-from-bank");
      const data = await res.json();
      if (data.success) {
        setBanks(data.banks || []);
        setClasses(data.classes || []);
        if (data.banks?.length > 0) {
          setSelectedBankId(data.banks[0].id);
        }
        if (data.classes?.length > 0) {
          setSelectedClassIds([data.classes[0].id]);
        }
      }
    } catch (err) {
      console.error("Gagal memuat bank soal admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBankOptions();
  }, []);

  const toggleClass = (id: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      setMessage({ type: "error", text: "Nama ujian wajib diisi." });
      return;
    }
    if (!selectedBankId) {
      setMessage({ type: "error", text: "Silakan pilih salah satu Bank Soal dari guru." });
      return;
    }
    if (selectedClassIds.length === 0) {
      setMessage({ type: "error", text: "Pilih minimal 1 kelas peserta ujian." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/exams/create-from-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: examTitle,
          bankId: selectedBankId,
          category,
          durationMinutes,
          classIds: selectedClassIds,
          token: token.trim().toUpperCase() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: "success",
          text: `Ujian '${examTitle}' berhasil dirilis dengan Token: ${data.token}! Soal langsung terdistribusi ke portal ujian siswa.`,
        });
        setExamTitle("");
        setToken("");
      } else {
        setMessage({ type: "error", text: data.error || "Gagal merilis ujian." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBank = banks.find((b) => b.id === selectedBankId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Integrasi Bank Soal Guru ke CBT
          </span>
          <h3 className="text-xl font-black text-navy-900 tracking-tight mt-0.5">
            Rilis Ujian CBT Dari Bank Soal Guru
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih paket bank soal yang telah diunggah oleh guru pengampu untuk dijadikan paket soal ujian peserta didik.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Form Pemilihan Bank Soal & Rilis Ujian */}
      <form onSubmit={handleCreateExam} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Nama Ujian / Jadwal CBT *
            </label>
            <input
              type="text"
              placeholder="Contoh: Sumatif Tengah Semester (STS) Matematika"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-navy-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Kategori Asesmen
            </label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-navy-900 bg-white"
            >
              <option value="HARIAN">Penilaian Harian (PH)</option>
              <option value="UTS">Sumatif Tengah Semester (STS / UTS)</option>
              <option value="UAS">Sumatif Akhir Semester (SAS / UAS)</option>
              <option value="REMEDIAL">Ujian Remedial</option>
            </select>
          </div>
        </div>

        {/* Pemilihan Bank Soal Guru */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-navy-900 flex items-center justify-between">
            <span>Pilih Bank Soal Yang Telah Diunggah Guru:</span>
            <span className="text-[10px] text-slate-500 font-normal">
              Tersedia {banks.length} paket bank soal aktif
            </span>
          </label>

          {banks.length === 0 ? (
            <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
              Belum ada bank soal yang diunggah oleh guru. Guru dapat membuat bank soal terlebih dahulu di portal <strong>/guru</strong>.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {banks.map((b) => {
                const isSelected = selectedBankId === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBankId(b.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "bg-white border-navy-900 ring-2 ring-navy-900/10 shadow-sm"
                        : "bg-white/80 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-navy-100 text-navy-900">
                          {b.subjectName}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {b.totalQuestions} Butir Soal
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-navy-900 mt-1">{b.title}</h4>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5 mt-1">
                      <span>Guru: <strong>{b.teacherName}</strong></span>
                      {isSelected && (
                        <span className="text-navy-900 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-600" /> Terpilih
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kelas & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-navy-900">
              Pilih Kelas Peserta Ujian:
            </label>
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => {
                const isSelected = selectedClassIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClass(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-navy-900 text-white shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />}
                    <span>Kelas {c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-navy-900">
              Durasi Pengerjaan (Menit):
            </label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="10"
                max="240"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-navy-900"
              />
            </div>
          </div>
        </div>

        {/* Token Kustom Opsional */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Key className="w-4 h-4 text-gold-600" />
            <span>Token Rilis Ujian:</span>
            <input
              type="text"
              placeholder="Auto-generate 6 karakter"
              maxLength={8}
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              className="text-xs font-mono font-bold uppercase px-2.5 py-1.5 rounded-lg border border-slate-200 w-36 text-center"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || banks.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-extrabold transition shadow-md disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-gold-400" />
            <span>{isSubmitting ? "Memproses Rilis Soal..." : "Rilis Jadwal Ujian CBT"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminExamManagementView;
