"use client";

import React, { useState, useEffect } from "react";
import { 
  FileSignature, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Lock, 
  Unlock, 
  Sparkles,
  Users,
  GraduationCap
} from "lucide-react";

interface StudentReportItem {
  studentId: string;
  name: string;
  nisn: string;
  homeroomNotes: string;
  behaviorGrade: string;
  sickDays: number;
  permissionDays: number;
  dispensationDays: number;
  unexcusedDays: number;
  status: "DRAFT" | "LOCKED" | "PUBLISHED";
  lockedAt?: string | null;
}

interface HomeroomAdminViewProps {
  classId: string;
  className: string;
  teacherName: string;
  initialStudents: { id: string; user: { name: string }; nisn: string }[];
}

export const HomeroomAdminView: React.FC<HomeroomAdminViewProps> = ({
  classId,
  className,
  teacherName,
  initialStudents,
}) => {
  const [students, setStudents] = useState<StudentReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/guru/homeroom-notes?classId=${classId}`);
      const data = await res.json();
      if (data.success && data.students && data.students.length > 0) {
        setStudents(data.students);
      } else {
        // Fallback to initial students
        setStudents(
          initialStudents.map((s) => ({
            studentId: s.id,
            name: s.user.name,
            nisn: s.nisn,
            homeroomNotes: "Pertahankan prestasi akademikmu dan terus kembangkan bakat serta kepemimpinan.",
            behaviorGrade: "Sangat Baik",
            sickDays: 0,
            permissionDays: 0,
            dispensationDays: 0,
            unexcusedDays: 0,
            status: "DRAFT",
          }))
        );
      }
    } catch (err) {
      console.error("Gagal memuat catatan wali kelas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [classId]);

  const updateNotes = (studentId: string, notes: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, homeroomNotes: notes } : s))
    );
  };

  const updateBehavior = (studentId: string, behaviorGrade: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, behaviorGrade } : s))
    );
  };

  const toggleLock = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? { ...s, status: s.status === "LOCKED" ? "DRAFT" : "LOCKED" }
          : s
      )
    );
  };

  const applyTemplate = (studentId: string, templateText: string) => {
    updateNotes(studentId, templateText);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/guru/homeroom-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          studentNotes: students.map((s) => ({
            studentId: s.studentId,
            homeroomNotes: s.homeroomNotes,
            behaviorGrade: s.behaviorGrade,
            status: s.status,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: "success",
          text: data.message || "Catatan wali kelas & administrasi rapor berhasil disimpan!",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Gagal menyimpan administrasi." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest flex items-center gap-1.5">
            <FileSignature className="w-3.5 h-3.5" />
            Portal Khusus Wali Kelas (Homeroom Administration)
          </span>
          <h3 className="text-xl font-black text-navy-900 tracking-tight mt-0.5">
            Catatan Wali Kelas & Predikat Karakter Rapor
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Wali Kelas: <strong className="text-navy-900">{teacherName}</strong> • Kelas Binaan: <strong className="text-navy-900">{className}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-gold-400" />
          <span>{isSaving ? "Menyimpan Catatan..." : "Simpan Catatan & Rapor"}</span>
        </button>
      </div>

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

      {/* Tabel Input Catatan Rapor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-navy-900" />
            <h4 className="font-extrabold text-xs text-navy-900 uppercase tracking-wider">
              Data Siswa Kelas {className} ({students.length} Peserta Didik)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Status Terkunci: {students.filter((s) => s.status === "LOCKED").length} / {students.length} Siswa
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {students.map((student, idx) => (
            <div key={student.studentId} className="p-5 hover:bg-slate-50/50 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-navy-100 text-navy-900 font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-sm text-navy-900">{student.name}</h5>
                    <p className="text-[11px] text-slate-500">
                      NISN: <span className="font-mono">{student.nisn}</span> • 
                      Rekap Kehadiran: <strong className="text-navy-900">S: {student.sickDays}, I: {student.permissionDays}, D: {student.dispensationDays}, A: {student.unexcusedDays}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Predikat Sikap:</span>
                    <select
                      value={student.behaviorGrade}
                      onChange={(e) => updateBehavior(student.studentId, e.target.value)}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-navy-900 focus:outline-none focus:border-navy-900"
                    >
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Kurang">Kurang</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleLock(student.studentId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                      student.status === "LOCKED"
                        ? "bg-amber-50 text-amber-900 border-amber-300"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {student.status === "LOCKED" ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Terkunci</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Draft</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Textarea Catatan Wali Kelas */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-navy-900">
                    Catatan Wali Kelas di Lembar Rapor:
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-slate-400">Template cepat:</span>
                    <button
                      type="button"
                      onClick={() => applyTemplate(student.studentId, "Pertahankan prestasi membanggakan ini dan terus asah jiwa kepemimpinanmu di berbagai kegiatan sekolah.")}
                      className="text-navy-800 hover:underline font-semibold"
                    >
                      Prestasi Unggul
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => applyTemplate(student.studentId, "Tingkatkan ketekunan dalam belajar dan partisipasi aktif dalam diskusi kelas agar potensimu berkembang maksimal.")}
                      className="text-navy-800 hover:underline font-semibold"
                    >
                      Motivasi Belajar
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={student.homeroomNotes}
                  onChange={(e) => updateNotes(student.studentId, e.target.value)}
                  placeholder="Ketik catatan dan pesan pembinaan untuk siswa..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-navy-900 bg-slate-50/50"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>Simpan Seluruh Catatan Wali Kelas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeroomAdminView;
