import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GraduationCap } from "lucide-react";
import TeacherPortalTabs from "@/components/guru/TeacherPortalTabs";

export const revalidate = 0; // Dynamic server rendering

export default async function TeacherGradebookPage() {
  // Fetch active teaching assignments
  const assignment = await prisma.teachingAssignment.findFirst({
    include: {
      teacher: { include: { user: true } },
      subject: true,
      classRoom: true,
      academicYear: true,
      assessments: {
        include: {
          objective: true,
          scores: {
            include: { student: { include: { user: true } } },
          },
        },
      },
      subjectGrades: {
        include: { student: { include: { user: true } } },
      },
    },
  });

  const teacher = assignment?.teacher;

  // Check homeroom class for this teacher
  const homeroomClass = await prisma.classRoom.findFirst({
    where: { homeroomTeacherId: teacher?.id },
  }) || assignment?.classRoom;

  // Active classroom ID to manage
  const targetClassId = homeroomClass?.id || assignment?.classId || "class-x-a";
  const targetClassName = homeroomClass?.name || assignment?.classRoom.name || "X-A";

  // Students in this classroom
  const students = await prisma.student.findMany({
    where: { classId: targetClassId, status: "ACTIVE" },
    include: { user: true },
    orderBy: { nisn: "asc" },
  });

  // Learning Objectives for TP evaluation
  const learningObjectives = await prisma.learningObjective.findMany({
    where: { subjectId: assignment?.subjectId },
    orderBy: { code: "asc" },
  });

  // All active subjects for Question Bank authoring
  const allSubjects = await prisma.subject.findMany({
    where: { isArchived: false },
    orderBy: { name: "asc" },
  });

  // Teaching schedules for this teacher
  const schedules = await prisma.scheduleItem.findMany({
    where: { teacherId: teacher?.id },
    include: {
      subject: true,
      classRoom: true,
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">
            Portal Terpadu Guru & Wali Kelas (Kurikulum Merdeka)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-1">
            Dashboard Akademik, Presensi & Bank Soal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Guru: <strong className="text-navy-900">{teacher?.user?.name || "Drs. Budi Santoso, M.Pd."}</strong> • NIP: <span className="font-mono">{teacher?.nip || "198002152005011004"}</span> • Wali Kelas: <strong className="text-navy-900">{targetClassName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/raport"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition shadow-sm"
          >
            <GraduationCap className="w-4 h-4 text-gold-400" />
            <span>Lihat Lembar Raport Kelas</span>
          </Link>
        </div>
      </div>

      {/* Main Multi-Tab Portal */}
      <TeacherPortalTabs
        assignment={assignment}
        students={students}
        learningObjectives={learningObjectives}
        allSubjects={allSubjects}
        schedules={schedules}
        teacherId={teacher?.id || ""}
        teacherName={teacher?.user?.name || "Drs. Budi Santoso, M.Pd."}
        classId={targetClassId}
        className={targetClassName}
      />
    </div>
  );
}
