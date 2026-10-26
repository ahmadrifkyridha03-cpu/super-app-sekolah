"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Calendar, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Users, 
  Sparkles, 
  History,
  Check
} from "lucide-react";

interface SubjectAttendanceViewProps {
  assignmentId: string;
  subjectName: string;
  className: string;
  students: { id: string; user: { name: string }; nisn: string }[];
}

export const SubjectAttendanceView: React.FC<SubjectAttendanceViewProps> = ({
  assignmentId,
  subjectName,
  className,
  students: initialStudents,
}) => {
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [topic, setTopic] = useState("");
  const [studentRecords, setStudentRecords] = useState(
    initialStudents.map((s) => ({
      studentId: s.id,
      name: s.user.name,
      nisn: s.nisn,
      status: "HADIR" as const,
      note: "",
    }))
  );
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadPastSessions = async () => {
    try {
      const res = await fetch(`/api/attendance/subject?assignmentId=${assignmentId}`);
      const data = await res.json();
      if (data.success && data.assignment?.sessions) {
        setPastSessions(data.assignment.sessions);
      }
    } catch (err) {
      console.error("Gagal memuat sesi mapel:", err);
    }
  };

  useEffect(() => {
    loadPastSessions();
  }, [assignmentId]);

  const markAllHadir = () => {
    setStudentRecords((prev) =>
      prev.map((s) => ({ ...s, status: "HADIR" }))
    );
  };

  const updateStatus = (studentId: string, status: any) => {
    setStudentRecords((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setMessage({ type: "error", text: "Topik / Materi pertemuan wajib diisi." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/attendance/subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          date,
          topic,
          records: studentRecords.map((s) => ({
            studentId: s.studentId,
            status: s.status,
            note: s.note,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: "success",
          text: `Presensi sesi mata pelajaran '${topic}' berhasil disimpan!`,
        });
        setTopic("");
        loadPastSessions();
      } else {
        setMessage({ type: "error", text: data.error || "Gagal menyimpan presensi mapel." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Presensi Tatap Muka Per Jam Pertemuan
          </span>
          <h3 className="text-xl font-black text-navy-900 tracking-tight mt-0.5">
            Presensi Sesi Mapel: {subjectName}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelas: <strong className="text-navy-900">{className}</strong> • Total Pertemuan Tercatat: {pastSessions.length} Sesi
          </p>
        </div>
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

      {/* Form Buka Sesi Baru */}
      <form onSubmit={handleSaveSession} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h4 className="font-extrabold text-xs text-navy-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gold-600" />
            <span>Formulir Presensi Pertemuan Hari Ini</span>
          </h4>
          <button
            type="button"
            onClick={markAllHadir}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition border border-emerald-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hadir Semua</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Tanggal Pertemuan *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-navy-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Pokok Bahasan / Materi Pertemuan *
            </label>
            <input
              type="text"
              placeholder="Contoh: Bab 2 - Limit Fungsi Aljabar dan Aplikasi Turunan"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-navy-900"
            />
          </div>
        </div>

        {/* Tabel Siswa Presensi Sesi */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-4">Nama Siswa / NISN</th>
                <th className="py-2.5 px-4 text-center">Status Kehadiran</th>
                <th className="py-2.5 px-4">Catatan Keterlibatan Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRecords.map((s, idx) => (
                <tr key={s.studentId} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-navy-900">
                    <div>{s.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{s.nisn}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {(["HADIR", "SAKIT", "IZIN", "DISPENSASI", "ALPA"] as const).map((st) => {
                        const isSelected = s.status === st;
                        const label = st === "HADIR" ? "H" : st === "SAKIT" ? "S" : st === "IZIN" ? "I" : st === "DISPENSASI" ? "D" : "A";
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateStatus(s.studentId, st)}
                            className={`w-7 h-7 rounded-lg text-xs font-black transition ${
                              isSelected
                                ? st === "HADIR" ? "bg-emerald-600 text-white shadow-sm" :
                                  st === "SAKIT" ? "bg-blue-600 text-white shadow-sm" :
                                  st === "IZIN" ? "bg-amber-500 text-white shadow-sm" :
                                  st === "DISPENSASI" ? "bg-purple-600 text-white shadow-sm" :
                                  "bg-rose-600 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      placeholder="Aktif bertanya, tugas selesai, dll..."
                      value={s.note}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStudentRecords((prev) =>
                          prev.map((item) => (item.studentId === s.studentId ? { ...item, note: val } : item))
                        );
                      }}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>{isSaving ? "Menyimpan Sesi..." : "Simpan Sesi Presensi Mapel"}</span>
          </button>
        </div>
      </form>

      {/* Riwayat Sesi Mapel Terdahulu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-navy-900" />
            <h4 className="font-extrabold text-xs text-navy-900 uppercase tracking-wider">
              Riwayat Pertemuan Sesi Mapel ({pastSessions.length} Sesi)
            </h4>
          </div>
        </div>

        {pastSessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 italic">
            Belum ada riwayat sesi pertemuan mapel yang tercatat.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pastSessions.map((session, idx) => (
              <div key={session.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-700">
                      Sesi {pastSessions.length - idx}
                    </span>
                    <h5 className="font-bold text-xs text-navy-900">{session.topic}</h5>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tanggal: {session.date} • Kehadiran: <strong className="text-emerald-700">{session.totalHadir} / {session.totalSiswa} Siswa ({((session.totalHadir / (session.totalSiswa || 1)) * 100).toFixed(0)}%)</strong>
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  ✓ Tersimpan
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectAttendanceView;
