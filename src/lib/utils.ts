import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) return "-";
  return Number.isInteger(score) ? score.toString() : score.toFixed(1);
}

export function getPredicate(score: number | null | undefined): string {
  if (score === null || score === undefined) return "-";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  return "D";
}

export function generateExamToken(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export interface TpScoreInput {
  code: string;
  description: string;
  score: number;
}

/**
 * Otomatis menghasilkan narasi capaian kompetensi e-raport Kurikulum Merdeka
 * berdasarkan Tujuan Pembelajaran (TP) dengan skor tertinggi dan terendah.
 */
export function generateCurriculumNarrative(
  studentName: string,
  scores: TpScoreInput[],
  kktp = 75.0
): string {
  if (!scores || scores.length === 0) {
    return `${studentName} telah mengikuti kegiatan pembelajaran dengan baik.`;
  }

  // Sort descending
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  let narrative = "";

  if (highest && highest.score >= kktp) {
    narrative += `Menunjukkan penguasaan yang sangat baik dalam ${highest.description.toLowerCase()}`;
  } else if (highest) {
    narrative += `Menunjukkan penguasaan cukup dalam ${highest.description.toLowerCase()}`;
  }

  if (lowest && lowest.code !== highest?.code) {
    if (lowest.score < kktp) {
      narrative += `, namun perlu bimbingan lebih lanjut dalam ${lowest.description.toLowerCase()}.`;
    } else {
      narrative += `, serta terampil dalam ${lowest.description.toLowerCase()}.`;
    }
  } else {
    narrative += ".";
  }

  return narrative;
}
