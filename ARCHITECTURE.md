# SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATION (ARCHITECTURE.md)
## PLATFORM SISTEM INFORMASI AKADEMIK, CBT & E-RAPOR SEKOLAH
**Versi Dokumen:** 1.0.0  
**Status:** Definitif  
**Teknologi Utama:** Next.js 15 (App Router), TypeScript 5, Tailwind CSS, Prisma ORM, SQLite WAL Mode / PostgreSQL, KaTeX, Sharp, Bcrypt  

---

## 1. HIGH-LEVEL SYSTEM ARCHITECTURE

Sistem dirancang menggunakan arsitektur modular berlapis (*Layered Clean Architecture*) di atas framework Next.js 15 App Router, memisahkan secara tegas antara lapisan penyajian visual (*Presentation*), logika bisnis (*Domain & Application Services*), dan lapisan persistensi data (*Data Access Layer*).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PRESENTATION LAYER                                     │
├─────────────────────────┬───────────────────────────────┬──────────────────────────────┤
│ 1. Public Portal (/)    │ 2. School Management          │ 3. CBT Live Engine           │
│    - Landing Page       │    - Admin TU Portal          │    - Student Exam Room       │
│    - PPDB Online        │    - Teacher Gradebook & TP   │    - Proctor Live Monitor    │
│    - Status 2FA Check   │    - Homeroom Ledger & Raport │    - Essay Correction Hub    │
└─────────────────────────┴───────────────────────────────┴──────────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY & GATEWAY LAYER (Anti-IDOR)                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ - Edge Route Middleware (Role-Based Access Control: ADMIN, GURU, SISWA)                │
│ - Service-Level Authorization Helpers (Row-Level Security / Ownership Verification)    │
│ - Anti-Brute Force Rate Limiter & Sanitizer (DOMPurify, Magic-Byte MIME Inspector)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION & SERVICE LAYER                                   │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ Auth & Session    │ CBT Engine        │ Grade Calculator  │ Reporting Engine           │
│ - Bcrypt Verifier │ - Atomic Seq Sync │ - TP-Based Aggreg.│ - A4 Print CSS Generator   │
│ - JWT Session     │ - Lazy Finalizer  │ - KKTP Remedial   │ - Dapodik/e-Rapor Exporter │
│ - No Plaintext    │ - Server-Time Syn.│ - Tie-Break Rank  │ - QR Token Signer          │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE LAYER (Prisma ORM)                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ - Primary Target: SQLite Engine (PRAGMA journal_mode=WAL; busy_timeout=5000)          │
│ - Cloud Target: PostgreSQL Compatible Connection Pool (Supabase/Neon)                  │
│ - Soft-Delete Invariant (onDelete: Restrict on Academic Data)                          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. AUTENTIKASI, SESI & OTORISASI (DEFENSE-IN-DEPTH)

### 2.1 Siklus Hidup Token & Password Keamanan
1. **Zero-Plaintext Password Invariant**:
   - Database tidak pernah menyimpan password plaintext dalam bentuk apa pun.
   - Password selalu di-hash menggunakan **bcrypt** dengan cost factor 10.
   - Saat admin mencetak Kartu Peserta Ujian, password sementara dibuat secara acak di memori runtime, dicetak langsung ke PDF/layar cetak, di-hash ke database, dan field `mustChangePassword` diset `true`.
2. **Sesi Berbasis Token HttpOnly**:
   - Autentikasi menggunakan token JWT bertanda tangan digital (disimpan dalam cookie `HttpOnly`, `SameSite=Lax`, `Secure` pada mode produksi).
   - Payload sesi berisi: `{ userId, username, role, name, studentId?, teacherId? }`.
3. **Penyegaran Sesi & Pemaksaan Ganti Password**:
   - Jika `mustChangePassword === true`, sistem secara otomatis mencegat akses dan mengarahkan pengguna ke halaman `/change-password` sebelum dapat mengakses modul apa pun.

### 2.2 Otorisasi Baris Data (Row-Level Security Anti-IDOR)
Mencegah kerentanan *Insecure Direct Object References* (IDOR) dengan menerapkan validasi kepemilikan di tingkat *Application Service*:

```typescript
// Contoh Service Authorization Guard
export function assertStudentAccess(session: AuthSession, targetStudentId: string) {
  if (session.role === 'SUPER_ADMIN' || session.role === 'ADMIN_TU') return;
  if (session.role === 'SISWA' && session.studentId !== targetStudentId) {
    throw new ForbiddenError("Akses ditolak: Anda tidak memiliki izin melihat data ini.");
  }
}

export async function assertTeacherAssignment(session: AuthSession, assignmentId: string, prisma: PrismaClient) {
  if (session.role === 'SUPER_ADMIN') return;
  const assignment = await prisma.teachingAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.teacherId !== session.teacherId) {
    throw new ForbiddenError("Akses ditolak: Anda bukan pengampu penugasan mengajar ini.");
  }
}
```

---

## 3. CORE CBT ENGINE: KEANDALAN KONKURENSI & ANTI-RACE CONDITION

### 3.1 Pencegahan Balapan Jawaban (Monotonic Sequence Architecture)
Untuk menangani kondisi internet sekolah yang tidak stabil di mana request jawaban lama bisa tiba terlambat di server dan menimpa jawaban baru (*Latency Inversion*), digunakan skema nomor urut monotonik (`seq`):

```
Siswa di Browser                    Jaringan Sekolah                      Server Database
   [Klik Opsi A]  ───(Request A, seq=1)───────► [Tertunda di Jaringan]
         │
   1 Detik Kemudian
   [Ganti Opsi B] ───(Request B, seq=2)─────────────────────────────► [Update Sukses: Jawaban=B, seq=2]
                                                                                │
                                                 [Request A Baru Tiba] ─────────┤
                                                 (seq=1 < current seq=2)        ▼
                                                                     [DITOLAK OTOMATIS OLEH DB]
```

**Query Eksekusi Atomik di Server**:
```sql
UPDATE "StudentAnswer"
SET "answerText" = $1, "seq" = $2, "isDoubtful" = $3, "updatedAt" = CURRENT_TIMESTAMP
WHERE "sessionId" = $4 AND "examQuestionId" = $5 AND "seq" < $2;
```

### 3.2 Sinkronisasi Waktu Server & Lazy Auto-Finalization
1. **Server-Time Authority**:
   - Frontend tidak menghitung timer berdasarkan jam laptop lokal siswa.
   - Saat sesi ujian dibuat atau diakses, server mengembalikan:
     $$\text{deadline} = \min(\text{startTime} + \text{durationMinutes}, \text{exam.endTime})$$
     $$\text{remainingSeconds} = \max(0, \lfloor(\text{deadline} - \text{serverCurrentTime})/1000\rfloor)$$
   - Frontend menyinkronkan hitung mundur berdasarkan `remainingSeconds` tersebut.
2. **Lazy Server Finalization Pipeline**:
   - Karena Next.js tidak memiliki daemon cron bawaan, sistem menerapkan finalisasi *lazy*:
     - Setiap kali siswa memanggil API `/api/cbt/autosave` atau `/api/cbt/questions`.
     - Atau setiap kali guru/proktor membuka halaman `/api/cbt/proctor/live`.
     - Sistem menjalankan evaluasi: jika $\text{now} > \text{deadline} + 120\text{ detik}$, status sesi otomatis diubah menjadi `EXPIRED`/`SUBMITTED` dan skor pilihan ganda dihitung seketika.

### 3.3 Keamanan Payload Soal (Server-Side Stripping)
- Endpoint siswa `/api/cbt/questions` **secara mutlak menyaring** atribut `correctAnswer` dan `explanation`.
- Siswa hanya menerima `{ id, examQuestionId, orderNumber, content, options, type, scoreWeight }`. Kunci jawaban murni tersimpan di sisi server.

---

## 4. PENILAIAN BERBASIS TUJUAN PEMBELAJARAN (TP) & GENERATOR RAPOR

### 4.1 Model Penilaian Bertingkat & Pembatasan Remedial
Penilaian dirancang hierarkis berbasis Tujuan Pembelajaran (TP) Kurikulum Merdeka:
$$\text{Subject} \longrightarrow \text{LearningObjective (TP)} \longleftarrow \text{Assessment (Tugas/CBT/UTS/UAS)} \longrightarrow \text{AssessmentScore}$$

**Aturan Penilaian Remedial**:
- Jika siswa mengikuti remedial, nilai asli disimpan di `rawScore` dan nilai remedial disimpan di `remedialScore`.
- Nilai akhir asesmen dihitung dengan aturan batas ketuntasan nasional:
  $$\text{finalScore} = \begin{cases} \min(\text{remedialScore}, \text{kktp}), & \text{jika remedial ada} \\ \text{rawScore}, & \text{jika tidak ada remedial} \end{cases}$$

### 4.2 Algoritma Auto-Generator Deskripsi Capaian Rapor
Sistem secara otomatis menghitung rata-rata skor siswa per `LearningObjective` (TP) pada mata pelajaran bersangkutan:
1. **TP Tertinggi ($\ge \text{KKTP}$)** dikelompokkan ke dalam daftar capaian unggul ($TP_{\text{max}}$).
2. **TP Terendah ($< \text{KKTP}$)** dikelompokkan ke dalam daftar capaian butuh bimbingan ($TP_{\text{min}}$).
3. **Penyusunan Narasi Deskripsi**:
   - Jika semua TP tuntas: *"Menunjukkan penguasaan yang sangat baik dalam [Deskripsi TP 1] dan [Deskripsi TP 2]."*
   - Jika terdapat TP yang belum tuntas: *"Menunjukkan penguasaan yang baik dalam [Deskripsi TP 1], namun perlu bimbingan lebih lanjut dalam [Deskripsi TP 3]."*

### 4.3 Algoritma Perangkingan Kelas (Tie-Breaker Ranking)
Menggunakan standar *Standard Competition Ranking* (1224) untuk memastikan keadilan siswa dengan nilai rata-rata kembar:
```typescript
export function calculateClassRanks(students: { studentId: string; averageScore: number }[]) {
  // Sort descending berdasarkan averageScore
  const sorted = [...students].sort((a, b) => b.averageScore - a.averageScore);
  
  let currentRank = 1;
  return sorted.map((student, index) => {
    if (index > 0 && student.averageScore < sorted[index - 1].averageScore) {
      currentRank = index + 1;
    }
    return { studentId: student.studentId, rank: currentRank };
  });
}
```

---

## 5. DATABASE ARCHITECTURE & KONFIGURASI SQLITE WAL

### 5.1 Pengaturan Konkurensi Tinggi (Concurrency Tuning)
Untuk menjamin kestabilan saat ratusan siswa ujian serentak di jaringan lokal sekolah, SQLite dikonfigurasi melalui query inisialisasi koneksi pool Prisma:
```sql
PRAGMA journal_mode = WAL;         -- Menulis ke write-ahead log, membaca tidak memblokir menulis
PRAGMA busy_timeout = 5000;        -- Toleransi antrean tulis hingga 5000ms tanpa error locked
PRAGMA synchronous = NORMAL;       -- Keseimbangan optimal antara kecepatan disk I/O dan integritas data
PRAGMA cache_size = -64000;        -- Alokasi memori cache 64MB di RAM server
PRAGMA foreign_keys = ON;          -- Penegakan integritas relasional data
```

### 5.2 Strategi Soft-Delete & Immutability
- Seluruh relasi data akademik vital (seperti relasi `ClassRoom` ke `Student`, `Question` ke `ExamQuestion`, `TeachingAssignment` ke `SubjectGrade`) menggunakan `onDelete: Restrict`.
- Siswa yang lulus atau mutasi diberi penanda status `StudentStatus.ALUMNI` atau `StudentStatus.MUTASI` sehingga akun tidak aktif, namun riwayat nilai masa lalunya tetap utuh selamanya.

---

## 6. SPESIFIKASI KONTRAK API UTAMA (API CONTRACTS)

### 6.1 Autentikasi & Akun
* `POST /api/auth/login`: Menerima `{ username, password }`. Mengembalikan cookie sesi HttpOnly dan status `mustChangePassword`.
* `POST /api/auth/change-password`: Menerima `{ oldPassword, newPassword }`. Mengganti password terenkripsi bcrypt dan mematikan flag `mustChangePassword`.
* `POST /api/auth/logout`: Membersihkan cookie sesi.

### 6.2 CBT Exam Engine
* `POST /api/cbt/verify-token`: Siswa memasukkan token 6 digit. Server memvalidasi jadwal (`now >= startTime && now <= endTime`) dan ketersediaan target kelas/siswa.
* `GET /api/cbt/session-init`: Memulai atau memulihkan sesi ujian siswa. Mengembalikan sisa waktu (`remainingSeconds`), urutan soal (`questionOrder`), dan daftar soal **tanpa kunci jawaban**.
* `POST /api/cbt/autosave`: Menerima `{ examQuestionId, answerText, isDoubtful, seq }`. Menjalankan update atomik berbasis `seq`.
* `POST /api/cbt/submit`: Memfinalisasi ujian, menghitung skor pilihan ganda, dan mengubah status sesi menjadi `SUBMITTED`.
* `GET /api/cbt/proctor/live`: Memantau daftar siswa aktif, sisa waktu, dan counter pelanggaran tab.
* `POST /api/cbt/proctor/reset-session`: Membuka kunci siswa yang perangkatnya macet agar dapat login kembali tanpa kehilangan progres jawaban.
* `POST /api/cbt/recalculate`: Proktor/guru memperbarui skor seluruh siswa jika ada revisi kunci jawaban pasca ujian.

### 6.3 Penilaian & Rapor
* `GET /api/teacher/grades`: Mengambil daftar siswa dan nilai asesmen per TP pada kelas yang diampu.
* `POST /api/teacher/grades/save`: Menyimpan nilai tugas/ulangan dan memicu penghitungan nilai akhir serta auto-deskripsi capaian TP.
* `POST /api/teacher/grades/sync-cbt`: Menarik nilai dari paket ujian CBT ke kolom asesmen yang bersangkutan secara instan.
* `GET /api/homeroom/ledger`: Mengambil matriks rekap nilai seluruh mapel satu kelas beserta peringkat.
* `GET /api/homeroom/export-erapor`: Mengunduh file Excel/CSV dengan struktur kolom yang kompatibel 100% dengan aplikasi e-Rapor resmi SNPMB Kemendikbudristek.
* `GET /verify/report/[token]`: Endpoint publik untuk memverifikasi keaslian lembar rapor digital yang dipindai melalui QR Code.

### 6.4 Administrasi & Master Data
* `POST /api/admin/students/import`: Menerima file Excel/CSV data siswa, memvalidasi duplikasi NISN, dan mengembalikan pratinjau data valid vs error.
* `POST /api/admin/students/import/commit`: Menyimpan data siswa yang tervalidasi ke database dan menerbitkan akun login awal.
* `GET /api/admin/exam-cards`: Mengembalikan data kartu peserta ujian massal siap cetak format A4.
* `POST /api/admin/backup`: Mengunduh file snapshot database SQLite (`school.db`).

---

## 7. STRUKTUR DIREKTORI PROYEK (NEXT.JS 15 CODEBASE)

```
d:/test/
├── PRD.md                             # Product Requirement Document Resmi
├── ARCHITECTURE.md                    # Dokumen Arsitektur Teknis Sistem
├── .env.example                       # Contoh Variabel Lingkungan
├── package.json                       # Konfigurasi Dependensi Proyek
├── tsconfig.json                      # Konfigurasi TypeScript Strict
├── prisma/
│   ├── schema.prisma                  # Skema Database Definitif
│   └── seed.ts                        # Script Seeder Data Awal Realistis
├── public/
│   ├── templates/                     # File Template Excel Import Siswa & Guru
│   └── uploads/                       # Direktori Upload Berkas (Foto, PDF, Materi)
└── src/
    ├── app/                           # Next.js 15 App Router
    │   ├── (public)/                  # Route Group Publik
    │   │   ├── page.tsx               # Landing Page Sekolah
    │   │   ├── ppdb/page.tsx          # Portal PPDB Online & Cek Kelulusan 2FA
    │   │   └── verify/report/[token]  # Verifikasi QR Code Keaslian Rapor
    │   ├── (auth)/                    # Autentikasi
    │   │   ├── login/page.tsx         # Halaman Login Multi-Peran
    │   │   └── change-password/       # Halaman Wajib Ganti Password Pertama
    │   ├── admin/                     # Portal Admin TU & Super Admin
    │   │   ├── page.tsx               # Dashboard Statistik Eksekutif
    │   │   ├── siswa/                 # Manajemen Siswa & Import Excel
    │   │   ├── guru/                  # Manajemen Guru & Penugasan
    │   │   ├── kelas/                 # Manajemen Kelas & Rombel
    │   │   ├── mapel/                 # Manajemen Mata Pelajaran & KKTP
    │   │   ├── jadwal/                # Jadwal Pelajaran & Deteksi Bentrok
    │   │   └── kartu-ujian/           # Cetak Kartu Peserta Ujian Massal
    │   ├── guru/                      # Portal Guru Mata Pelajaran
    │   │   ├── page.tsx               # Jadwal Mengajar & Ringkasan Mapel
    │   │   ├── materi/                # Modul Upload Bahan Ajar Digital
    │   │   ├── absensi/               # Presensi Jam Mapel
    │   │   ├── cbt/                   # Bank Soal KaTeX & Jadwal Ujian
    │   │   ├── cbt/monitor/[id]/      # Live Monitoring Proktor & Reset Sesi
    │   │   ├── nilai/                 # Buku Nilai Asesmen per TP & Tarik CBT
    │   │   └── wali-kelas/            # Dashboard Wali Kelas, Leger & Cetak Rapor
    │   ├── siswa/                     # Portal Siswa
    │   │   ├── page.tsx               # Dashboard Siswa & Jadwal Hari Ini
    │   │   ├── materi/                # Unduh Bahan Ajar
    │   │   ├── cbt/                   # Ruang Ujian CBT Siswa Anti-Curang
    │   │   └── raport/                # Riwayat Nilai & Rapor Digital
    │   └── api/                       # REST API Handlers & Endpoints
    ├── components/                    # Komponen Antarmuka Reusable
    │   ├── ui/                        # Komponen Dasar (Button, Modal, Input, Badge)
    │   ├── cbt/                       # CBT Exam Runner, Timer, KaTeX Renderer
    │   └── raport/                    # Template Cetak Rapor A4 Resmi & QR Code
    └── lib/                           # Core Library & Utilities
        ├── auth/                      # JWT Helper, Password Hasher, RBAC Guards
        ├── db/                        # Prisma Client Singleton (SQLite WAL init)
        ├── excel/                     # Parser & Validator Excel Import/Export
        └── utils/                     # Format Tanggal Indonesia, Titimangsa, Math
```

---

*Dokumen ARCHITECTURE.md ini disahkan sebagai acuan teknis definitif dalam konstruksi kode sistem aplikasi sekolah.*
