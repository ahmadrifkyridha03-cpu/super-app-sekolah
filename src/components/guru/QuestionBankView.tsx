"use client";

import React, { useState, useEffect } from "react";
import { 
  FileQuestion, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Sparkles, 
  Save, 
  Eye, 
  Upload,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface QuestionItem {
  id?: string;
  type: "MULTIPLE_CHOICE" | "ESSAY";
  content: string;
  options: string[];
  correctAnswer: string;
  defaultWeight: number;
  explanation?: string;
}

interface QuestionBankItem {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  totalQuestions: number;
  multipleChoiceCount: number;
  essayCount: number;
  createdAt: string;
  questions: QuestionItem[];
}

interface QuestionBankViewProps {
  teacherId: string;
  subjects: { id: string; name: string; code: string }[];
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  teacherId,
  subjects,
}) => {
  const [banks, setBanks] = useState<QuestionBankItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedBankId, setExpandedBankId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      type: "MULTIPLE_CHOICE",
      content: "Bentuk sederhana dari ekspresi aljabar $(2x + 3)(x - 4)$ adalah...",
      options: ["2x^2 - 5x - 12", "2x^2 + 5x - 12", "2x^2 - 11x - 12", "2x^2 + 11x + 12"],
      correctAnswer: "A",
      defaultWeight: 1.0,
      explanation: "Kalikan suku per suku: 2x(x) - 8x + 3x - 12 = 2x^2 - 5x - 12.",
    },
    {
      type: "MULTIPLE_CHOICE",
      content: "Diketahui fungsi $f(x) = 3x^2 - 2x + 5$. Nilai dari $f'(2)$ adalah...",
      options: ["10", "12", "14", "16"],
      correctAnswer: "A",
      defaultWeight: 1.0,
      explanation: "f'(x) = 6x - 2, maka f'(2) = 6(2) - 2 = 10.",
    },
  ]);

  // Load Banks
  const loadBanks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/guru/question-banks?teacherId=${teacherId}`);
      const data = await res.json();
      if (data.success && data.banks) {
        setBanks(data.banks);
      }
    } catch (err) {
      console.error("Gagal memuat bank soal:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanks();
  }, [teacherId]);

  // Add Question to Form
  const addQuestion = (type: "MULTIPLE_CHOICE" | "ESSAY") => {
    setQuestions((prev) => [
      ...prev,
      {
        type,
        content: "",
        options: type === "MULTIPLE_CHOICE" ? ["", "", "", ""] : [],
        correctAnswer: type === "MULTIPLE_CHOICE" ? "A" : "",
        defaultWeight: 1.0,
        explanation: "",
      },
    ]);
  };

  // Remove Question from Form
  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Bank Soal
  const handleSubmitBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: "error", text: "Judul bank soal wajib diisi." });
      return;
    }

    if (questions.length === 0) {
      setMessage({ type: "error", text: "Minimal tambahkan 1 butir soal." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/guru/question-banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subjectId,
          teacherId,
          questions,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: "success",
          text: `Bank Soal '${title}' berhasil disimpan! Admin sekarang dapat memilih bank soal ini saat merilis ujian CBT.`,
        });
        setIsCreating(false);
        setTitle("");
        loadBanks();
      } else {
        setMessage({ type: "error", text: data.error || "Gagal menyimpan bank soal." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan saat menyimpan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Manajemen Konten & Butir Soal Ujian CBT
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight mt-0.5">
            Bank Soal Mandiri Guru
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload butir soal Anda di sini. Bank soal yang tersimpan dapat dipilih oleh Admin saat merilis jadwal ujian.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreating(!isCreating);
            setMessage(null);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm"
        >
          {isCreating ? <FileQuestion className="w-4 h-4 text-gold-400" /> : <Plus className="w-4 h-4 text-gold-400" />}
          <span>{isCreating ? "Tutup Form Input" : "Buat Bank Soal Baru"}</span>
        </button>
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

      {/* Form Buat Bank Soal Baru */}
      {isCreating && (
        <form onSubmit={handleSubmitBank} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-sm text-navy-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>Input Butir Soal & Konfigurasi Paket</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              Total Soal: <strong className="text-navy-900">{questions.length}</strong> Butir
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Judul Paket Bank Soal *
              </label>
              <input
                type="text"
                placeholder="Contoh: Ulangan Harian Bab 3: Matriks & Transformasi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Mata Pelajaran *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-navy-900 bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List Butir Soal */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Daftar Butir Soal ({questions.length})
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addQuestion("MULTIPLE_CHOICE")}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ Pilihan Ganda</span>
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion("ESSAY")}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>+ Soal Essay</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-navy-900 text-white">
                        Nomor {qIdx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {q.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda (A-D)" : "Uraian / Essay"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Isi Pertanyaan (Mendukung simbol $KaTeX$):
                    </label>
                    <textarea
                      rows={2}
                      value={q.content}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuestions((prev) =>
                          prev.map((item, i) => (i === qIdx ? { ...item, content: val } : item))
                        );
                      }}
                      placeholder="Ketikkan teks soal di sini..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-navy-900 bg-white"
                    />
                  </div>

                  {q.type === "MULTIPLE_CHOICE" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {["A", "B", "C", "D"].map((optLetter, optIdx) => (
                        <div key={optLetter} className="flex items-center gap-2">
                          <span
                            onClick={() => {
                              setQuestions((prev) =>
                                prev.map((item, i) =>
                                  i === qIdx ? { ...item, correctAnswer: optLetter } : item
                                )
                              );
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black cursor-pointer transition shrink-0 ${
                              q.correctAnswer === optLetter
                                ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                            title="Klik untuk memilih sebagai kunci jawaban"
                          >
                            {optLetter}
                          </span>
                          <input
                            type="text"
                            placeholder={`Pilihan ${optLetter}`}
                            value={q.options[optIdx] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuestions((prev) =>
                                prev.map((item, i) => {
                                  if (i !== qIdx) return item;
                                  const newOpts = [...item.options];
                                  newOpts[optIdx] = val;
                                  return { ...item, options: newOpts };
                                })
                              );
                            }}
                            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-navy-900 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>
                      Kunci Jawaban: <strong className="text-emerald-700">{q.correctAnswer || "Belum dipilih"}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span>Bobot:</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={q.defaultWeight}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1.0;
                          setQuestions((prev) =>
                            prev.map((item, i) => (i === qIdx ? { ...item, defaultWeight: val } : item))
                          );
                        }}
                        className="w-16 text-center text-xs px-2 py-1 rounded border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-gold-400" />
              <span>{isSubmitting ? "Menyimpan Paket..." : "Simpan Bank Soal"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Daftar Bank Soal Tersimpan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-navy-900" />
            <h3 className="font-extrabold text-xs text-navy-900 uppercase tracking-wider">
              Bank Soal Tersimpan Milik Anda ({banks.length} Paket)
            </h3>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
            ✓ Siap Dipilih Admin untuk Ujian CBT
          </span>
        </div>

        {banks.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              Anda belum memiliki Bank Soal. Klik tombol <strong>&quot;Buat Bank Soal Baru&quot;</strong> untuk mengunggah paket butir soal pertama Anda.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {banks.map((bank) => {
              const isExpanded = expandedBankId === bank.id;
              return (
                <div key={bank.id} className="p-5 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-navy-100 text-navy-900">
                          {bank.subjectName}
                        </span>
                        <h4 className="font-black text-sm text-navy-900">{bank.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Total {bank.totalQuestions} Soal ({bank.multipleChoiceCount} Pilihan Ganda, {bank.essayCount} Essay) • Dibuat: {new Date(bank.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedBankId(isExpanded ? null : bank.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-navy-900 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-gold-600" />
                        <span>{isExpanded ? "Tutup Pratinjau" : "Lihat Butir Soal"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Questions Detail */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      {bank.questions.map((q, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-navy-900">
                              No. {idx + 1} ({q.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Essay"})
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Kunci: {q.correctAnswer} (Bobot: {q.defaultWeight})
                            </span>
                          </div>
                          <p className="text-slate-800 leading-relaxed font-mono text-[11px]">
                            {q.content}
                          </p>
                          {q.options && q.options.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-1.5">
                                  <strong className="text-navy-900">{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankView;
