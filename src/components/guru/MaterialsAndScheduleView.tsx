"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Calendar, 
  Upload, 
  FileText, 
  Trash2, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Layers
} from "lucide-react";

interface ScheduleItemProps {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
  subject: { name: string };
  classRoom: { name: string };
}

interface LearningMaterialItem {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  className: string;
  subjectName: string;
  createdAt: string;
}

interface MaterialsAndScheduleViewProps {
  teacherId: string;
  classId: string;
  subjectId: string;
  schedules: ScheduleItemProps[];
}

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export const MaterialsAndScheduleView: React.FC<MaterialsAndScheduleViewProps> = ({
  teacherId,
  classId,
  subjectId,
  schedules,
}) => {
  const [materials, setMaterials] = useState<LearningMaterialItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadMaterials = async () => {
    try {
      const res = await fetch(`/api/guru/materials?teacherId=${teacherId}`);
      const data = await res.json();
      if (data.success && data.materials) {
        setMaterials(data.materials);
      }
    } catch (err) {
      console.error("Gagal memuat materi:", err);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [teacherId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      setMessage({ type: "error", text: "Judul materi dan Tautan/URL File wajib diisi." });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/guru/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fileUrl,
          classId,
          subjectId,
          teacherId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: `Bahan ajar '${title}' berhasil dibagikan ke siswa!` });
        setTitle("");
        setDescription("");
        setFileUrl("");
        loadMaterials();
      } else {
        setMessage({ type: "error", text: data.error || "Gagal mengunggah materi." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bahan ajar ini?")) return;

    try {
      const res = await fetch(`/api/guru/materials?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Bahan ajar berhasil dihapus." });
        loadMaterials();
      }
    } catch (err) {
      console.error("Gagal menghapus:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Jadwal Mengajar Guru */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Calendar className="w-4 h-4 text-navy-900" />
          <h3 className="font-extrabold text-sm text-navy-900 uppercase tracking-wider">
            Jadwal Mengajar Mingguan Anda
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {schedules.length === 0 ? (
            <div className="col-span-full p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center italic">
              Belum ada jadwal mengajar terdaftar pada sistem.
            </div>
          ) : (
            schedules.map((sch) => (
              <div
                key={sch.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-black text-[10px] bg-navy-900 text-white">
                    {DAYS[sch.dayOfWeek] || "Senin"}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold-600" />
                    {sch.startTime} - {sch.endTime}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-navy-900">{sch.subject.name}</h4>
                <p className="text-[11px] text-slate-500">
                  Kelas: <strong className="text-navy-900">{sch.classRoom.name}</strong> • Ruang: {sch.room || "R.101"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Bahan Ajar & Repository */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Upload className="w-4 h-4 text-gold-600" />
            <h4 className="font-extrabold text-xs text-navy-900 uppercase tracking-wider">
              Upload Bahan Ajar Digital
            </h4>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-navy-900 mb-1">
                Judul Materi / Modul *
              </label>
              <input
                type="text"
                placeholder="Contoh: Modul Limit Aljabar & Turunan PDF"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-navy-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy-900 mb-1">
                Tautan File Dokumen / Slide / Cloud URL *
              </label>
              <input
                type="text"
                placeholder="Contoh: /templates/template_siswa.xlsx atau link GDrive"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-navy-900 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-navy-900 mb-1">
                Deskripsi Singkat / Instruksi Pengerjaan:
              </label>
              <textarea
                rows={2}
                placeholder="Pelajari latihan halaman 15-20 sebelum ulangan CBT..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-navy-900"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              <span>{isUploading ? "Mengunggah..." : "Bagikan ke Siswa"}</span>
            </button>
          </form>
        </div>

        {/* List Bahan Ajar Tersedia */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-navy-900" />
              <h4 className="font-extrabold text-xs text-navy-900 uppercase tracking-wider">
                Bahan Ajar Yang Telah Dibagikan ({materials.length})
              </h4>
            </div>
          </div>

          <div className="p-4 flex-1">
            {materials.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                Belum ada bahan ajar digital yang diunggah. Gunakan form di sebelah kiri untuk membagikan materi.
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-navy-100 text-navy-900">
                          {mat.className}
                        </span>
                        <h5 className="font-bold text-xs text-navy-900">{mat.title}</h5>
                      </div>
                      {mat.description && (
                        <p className="text-[11px] text-slate-600 leading-relaxed">{mat.description}</p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        Diunggah pada: {new Date(mat.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={mat.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-900 text-white text-xs font-bold transition hover:bg-navy-800"
                      >
                        <ExternalLink className="w-3 h-3 text-gold-400" />
                        <span>Akses</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(mat.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialsAndScheduleView;
