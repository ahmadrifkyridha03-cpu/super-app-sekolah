# PRODUCT REQUIREMENT DOCUMENT (PRD)
## PLATFORM SISTEM INFORMASI AKADEMIK, CBT & E-RAPOR SEKOLAH TERPADU
**Versi:** 1.0.0  
**Status:** Approved / Ready for Implementation  
**Target Rilis:** Tahun Ajaran 2026/2027  
**Tech Stack Utama:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma ORM, SQLite WAL Mode, Lucide Icons, KaTeX  

---

## 1. EXECUTIVE SUMMARY & PRODUK OVERVIEW

### 1.1 Latar Belakang
Operasional sekolah modern di Indonesia sering kali terpecah ke dalam berbagai aplikasi yang tidak saling terhubung: aplikasi ujian online (CBT) berdiri sendiri, absensi manual di buku jurnal, penilaian guru mapel terpisah di spreadsheet, dan pengisian rapor memakan waktu berminggu-minggu karena wali kelas harus mengetik ulang narasi deskripsi capaian kompetensi secara manual. Selain itu, sistem CBT yang ada rentan mengalami gangguan server saat koneksi internet sekolah tidak stabil atau mati lampu.

### 1.2 Visi Produk
Membangun satu ekosistem web sekolah terpadu (*Super-App Sekolah*) yang menggabungkan:
1. **Wajah Publik**: Landing Page resmi yang elegan, informatif, dan portal PPDB Online.
2. **Mesin CBT Anti-Gangguan**: Ujian online berbasis komputer dengan proteksi balapan data (*atomic sequence*), auto-save offline bertingkat, dukungan rumus eksak KaTeX, dan monitoring proktor real-time.
3. **Sistem Penilaian Cerdas & E-Rapor**: Penilaian terstruktur berbasis Tujuan Pembelajaran (TP) yang secara otomatis menyusun narasi deskripsi rapor Kurikulum Merdeka, buku leger nilai kelas, integrasi rapor P5/kokurikuler, serta fitur ekspor format resmi e-Rapor SNPMB/Dapodik Kemendikbudristek.
4. **Administrasi Sekolah Efisien**: Pengelolaan master siswa/guru dengan form manual, import masal Excel tervalidasi, kartu ujian siap cetak, dan absensi terpisah (harian vs mapel).

---

## 2. PENGGUNA SISTEM & PERAN (ROLE-BASED ACCESS CONTROL)

| Peran (Role) | Deskripsi Akses & Tanggung Jawab |
|---|---|
| **SUPER_ADMIN** | Memiliki kendali penuh atas sistem, konfigurasi tahun ajaran, backup/restore database, audit log, dan pengaturan profil sekolah/KOP resmi. |
| **ADMIN_TU** | Mengelola data master siswa, guru, kelas, mata pelajaran, penugasan mengajar, import/export Excel, jadwal pelajaran, kartu ujian, dan verifikasi berkas PPDB. |
| **KEPALA_SEKOLAH** | Hak akses *Read-Only* eksekutif untuk melihat statistik sekolah, absensi, leger nilai seluruh kelas, dan pembubuhan tanda tangan/validasi rapor. |
| **GURU (Mapel)** | Mengakses kelas yang diampu, mengunggah bahan ajar, mencatat presensi jam mapel, membuat bank soal CBT, mengawasi ujian, menginput asesmen per TP, dan menarik nilai CBT. |
| **WALI_KELAS** | Guru yang ditugaskan membina satu kelas: menginput absensi harian sekolah, memantau leger kelas, menginput catatan sikap/wali kelas, dan mencetak E-Raport (Akademik & P5). |
| **PEMBINA_EKSKUL** | Guru yang membina ekstrakurikuler: menginput nilai dan catatan keaktifan anggota ekskul binaannya secara mandiri. |
| **SISWA** | Mengakses jadwal pelajaran, mengunduh bahan ajar, melihat rekap kehadiran pribadi, mengikuti ujian CBT, dan melihat/mengunduh lembar e-rapor. |
| **CALON_SISWA** | Pengguna publik di landing page yang mendaftar PPDB Online dan mengecek status kelulusan dengan 2-Faktor. |

---

## 3. SPESIFIKASI KEBUTUHAN FUNGSIONAL (FUNCTIONAL REQUIREMENTS)

### MODUL 1: LANDING PAGE PUBLIK & PROFIL SEKOLAH
* **FR-1.1 Header & Navigasi**: Logo sekolah, nama instansi, tautan Profil, Fasilitas, Prestasi, Berita, Kontak, Tombol CTA "Daftar PPDB", dan Tombol "Masuk Portal".
* **FR-1.2 Hero Banner**: Tampilan visual modern, tagline visi sekolah, dan status Akreditasi Resmi.
* **FR-1.3 Sambutan Kepala Sekolah**: Foto resmi, profil, kutipan sambutan selamat datang.
* **FR-1.4 Statistik Cepat (Live Counter)**: Total siswa aktif, guru bersertifikasi, prestasi diraih, dan fasilitas lab.
* **FR-1.5 Berita & Kalender Akademik**: Daftar artikel pengumuman dan kalender agenda kegiatan sekolah.
* **FR-1.6 Footer & Informasi Kontak**: Alamat lengkap, Google Maps, nomor telepon, email, jam operasional, dan sosial media.

### MODUL 2: PPDB ONLINE (PENERIMAAN PESERTA DIDIK BARU)
* **FR-2.1 Formulir Pendaftaran Publik (`/ppdb`)**:
  - Kolom: Nama Lengkap, NISN asal, Tempat/Tanggal Lahir, Jenis Kelamin, Asal Sekolah, Pilihan Jurusan/Peminatan, Nama Orang Tua, Nomor WhatsApp.
  - Verifikasi Anti-Bot (Captcha).
  - Generator Nomor Registrasi Unik otomatis (Format: `PPDB-2026-XXXX`).
* **FR-2.2 Cek Status Kelulusan 2-Faktor (Kepatuhan UU PDP)**:
  - Calon siswa/wali mengecek status seleksi menggunakan **Nomor Registrasi** + **Tanggal Lahir**. Data calon siswa tidak terbuka untuk publik umum.
* **FR-2.3 Panel Verifikasi Admin PPDB (`/admin/ppdb`)**:
  - Tabel data calon siswa dengan filter status (*PENDING*, *ACCEPTED*, *REJECTED*).
  - Tombol **"Terima & Terbitkan Akun Siswa"**: Otomatis membuat record `Student` dan akun login aktif di kelas yang ditentukan.

### MODUL 3: MANAJEMEN MASTER DATA AKADEMIK (ADMIN TU)
* **FR-3.1 Manajemen Tahun Ajaran (`AcademicYear`)**:
  - Pembuatan tahun ajaran aktif (misal `2026/2027` Semester 1 Ganjil).
  - Input **Titimangsa Rapor** dinamis (tanggal resmi pembagian rapor dari Dinas).
* **FR-3.2 Manajemen Data Siswa (`/admin/siswa`)**:
  - Input manual satu per satu: NIS lokal, NISN nasional, nama lengkap, TTL, gender, alamat, nama & nomor ortu, kelas aktif.
  - **Import Masal Excel/CSV**: Upload file `.xlsx` dengan pratinjau data (*data preview*), validasi duplikasi NISN, dan proteksi formula injection (`=`, `+`, `-`, `@`).
  - **Manajemen Status Siswa**: Pengaturan status enum (`ACTIVE`, `MUTASI`, `ALUMNI`, `DROPOUT`). Siswa yang non-aktif tidak bisa login, namun seluruh riwayat nilainya tetap utuh (*soft-delete*).
  - **Cetak Kartu Peserta Ujian Massal**: Layout A4 siap potong berisi Nama, NIS/NISN, Kelas, Ruang, dan Username + Password sementara.
  - **Reset Password Akun**: Admin dapat mereset kata sandi akun siswa yang lupa password.
* **FR-3.3 Manajemen Data Guru & Staf (`/admin/guru`)**:
  - Input NIP/NUPTK, nama + gelar resmi, kontak WhatsApp, email, dan spesialisasi mapel.
  - Penetapan penugasan Wali Kelas dan Pembina Ekstrakurikuler.
  - Import dan export data guru via Excel.
* **FR-3.4 Manajemen Kelas & Mata Pelajaran**:
  - CRUD Kelas (Tingkat 10, 11, 12, nama rombel, penetapan wali kelas).
  - CRUD Mapel (Kode mapel, nama pelajaran, nilai standar KKTP).
* **FR-3.5 Penugasan Mengajar Guru (`TeachingAssignment`)**:
  - Memetakan `[Tahun Ajaran] + [Guru] + [Mata Pelajaran] + [Kelas]`.
  - Konfigurasi bobot komponen penilaian: Tugas (%), CBT/Ulangan (%), UTS (%), UAS (%).

### MODUL 4: MANAJEMEN JADWAL PELAJARAN (TIMETABLE)
* **FR-4.1 Penyusunan Jadwal Kelas**: Mengatur mapel per hari (Senin s/d Sabtu), jam mulai, jam selesai, dan ruang kelas.
* **FR-4.2 Validasi Deteksi Bentrok Otomatis**:
  - Peringatan jika satu guru dijadwalkan mengajar di 2 kelas berbeda pada hari dan jam yang sama.
  - Peringatan jika satu ruang kelas dipakai oleh 2 mapel berbeda secara bersamaan.
* **FR-4.3 Dashboard Jadwal**:
  - Siswa melihat *"Jadwal Pelajaran Hari Ini"*.
  - Guru melihat *"Jadwal Mengajar Saya Hari Ini"*.

### MODUL 5: SISTEM ABSENSI TERPISAH (HARIAN VS MAPEL)
* **FR-5.1 Absensi Harian Sekolah (`DailyAttendance`)**:
  - Dikelola oleh Wali Kelas / Guru Piket setiap pagi per kelas.
  - Status kehadiran: **Hadir (H)**, **Sakit (S)**, **Izin (I)**, **Dispensasi (D)**, **Alpa (A)**.
  - *Catatan Penting*: Status `DISPENSASI` (tugas dinas/lomba mewakili sekolah) dihitung **Hadir 100%** dalam rekapitulasi kehadiran.
  - Tombol cepat 1-klik: *"Tandai Semua Hadir"*.
  - Menjadi **sumber data resmi rekap ketidakhadiran** pada lembar rapor.
* **FR-5.2 Presensi Jam Mata Pelajaran (`SubjectAttendance`)**:
  - Dicatat oleh Guru Mapel pada setiap sesi/jam pertemuan di kelas untuk memantau keaktifan siswa.

### MODUL 6: E-LEARNING RINGAN (BAHAN AJAR DIGITAL)
* **FR-6.1 Upload Materi Belajar**: Guru mapel mengunggah modul (PDF) atau menyematkan link video pembelajaran sesuai kelas dan mapel yang diampu.
* **FR-6.2 Akses Siswa**: Siswa dapat membaca dan mengunduh bahan ajar sebelum ujian CBT dilaksanakan.

### MODUL 7: CORE CBT ENGINE (COMPUTER BASED TEST)
* **FR-7.1 Bank Soal Fleksibel**:
  - Pilihan Ganda (opsi A s/d E) dan Essay.
  - Dukungan parser rumus matematika & sains eksak berbasis **KaTeX** ($\sqrt{x}$, $\frac{a}{b}$, matriks, simbol kimia).
  - Dukungan gambar soal dengan kompresi otomatis (`sharp`).
  - Rubrik pedoman penskoran untuk soal essay.
* **FR-7.2 Paket & Jadwal Ujian**:
  - Pemilihan Soal Fleksibel via `ExamQuestion`: Guru dapat memilih sebagian soal dari bank soal (misal 30 soal dari 100 soal yang ada) dan menentukan bobot skor masing-masing.
  - Target Peserta: Pilihan seluruh kelas (`ExamClass`) atau siswa tertentu untuk **Ujian Susulan / Remedial** (`ExamParticipant`).
  - Pengaturan token ujian 6 karakter, waktu mulai, waktu selesai, durasi menit, acak urutan soal, dan acak opsi.
  - Penguncian otomatis (`isLocked = true`) begitu ada sesi ujian siswa yang aktif.
* **FR-7.3 Ruang Ujian Siswa (Exam Room)**:
  - Acuan Waktu Jam Server (**Server-Time Reference**), kebal manipulasi jam lokal perangkat.
  - Urutan nomor soal dan opsi disimpan konsisten per sesi (`questionOrder`), refresh browser tidak mengubah urutan.
  - Palet navigasi nomor soal: Abu-abu (Belum dijawab), Kuning (Ragu-ragu), Hijau (Sudah terjawab).
  - **Dual-Layer AutoSave dengan Monotonic Sequence (`seq`)**:
    - Jawaban disimpan instan di LocalStorage lokal dan dikirim ke server.
    - Query update atomik `WHERE seq < :newSeq` mencegah balapan data (*race condition*) jika koneksi internet tersendat.
  - **Deteksi Anti-Curang**: Menghitung frekuensi perpindahan tab/jendela (`tabSwitchCount`), blokir klik kanan, copy-paste, dan seleksi teks.
  - Auto-submit otomatis saat waktu habis + konfirmasi submit manual.
* **FR-7.4 Panel Proktor & Live Monitoring**:
  - Memantau kehadiran siswa di ruang ujian secara realtime (Belum Masuk, Sedang Mengerjakan, Submit, Sisa Waktu, Pelanggaran Tab).
  - Tombol **"Reset Sesi Siswa"**: Membuka kunci siswa yang perangkatnya macet/restart tanpa menghilangkan jawaban yang telah dikerjakan.
  - **Alur Koreksi Essay**: Antarmuka guru mengoreksi jawaban essay siswa per nomor, menginput nilai (`scoreEarned`), dan memberi feedback.
  - **Hitung Ulang Nilai (Recalculate Scores)**: Fitur koreksi kunci jawaban pasca-ujian via `overrideCorrectAnswer` yang otomatis memperbarui skor seluruh siswa.

### MODUL 8: PENILAIAN BERBASIS TUJUAN PEMBELAJARAN (TP) & BUKU NILAI GURU
* **FR-8.1 Pengelolaan Tujuan Pembelajaran (`LearningObjective`)**:
  - Guru mapel menginput 2-4 poin TP per semester (misal: *"memahami relasi fungsi kuadrat"*, *"menganalisis trigonometri"*).
* **FR-8.2 Buku Nilai Guru Mapel**:
  - Membuat item asesmen (`Assessment`) yang ditautkan ke jenis asesmen (Tugas, Ulangan Harian CBT, UTS, UAS, Remedial) dan ditautkan ke TP terkait.
  - Tombol **"Tarik Nilai dari CBT"**: Nilai ujian online siswa langsung masuk otomatis ke kolom asesmen yang bersangkutan.
  - Kolom nilai aman bertipe `Float?` (tanpa default 0): membedakan siswa yang belum ada nilai (`null`) dari nilai 0 murni.
  - Nilai remedial dicatat terpisah dan dibatasi maksimal sama dengan nilai KKTP mapel.
* **FR-8.3 Generator Otomatis Deskripsi Rapor**:
  - Sistem menghitung rata-rata skor siswa pada masing-masing TP.
  - TP dengan skor tertinggi otomatis dirangkai menjadi: *"Menunjukkan penguasaan sangat baik dalam [deskripsi TP 1] dan [deskripsi TP 2]"*.
  - TP dengan skor di bawah KKTP otomatis dirangkai menjadi: *"Perlu bimbingan lebih lanjut dalam [deskripsi TP 3]"*.
* **FR-8.4 Penguncian Nilai Mapel (`isLocked`)**: Guru dapat mengunci nilai mapel setelah selesai, hanya admin yang dapat membuka kunci jika ada revisi resmi.

### MODUL 9: PORTAL WALI KELAS, LEGER KELAS & E-RAPOR RESMI
* **FR-9.1 Dashboard Wali Kelas**: Memantau kelengkapan nilai dari seluruh guru mata pelajaran untuk kelas binaannya.
* **FR-9.2 Buku Leger Nilai Kelas**:
  - Tabel matriks besar berisi data seluruh siswa, nilai angka semua mapel, rata-rata, total nilai, dan peringkat/ranking kelas.
  - **Algoritma Ranking Tie-Breaker**: Menangani nilai kembar secara adil (misal ranking 1, 2, 3=, 3=, lalu 5).
* **FR-9.3 Form Kelengkapan Rapor**:
  - Input Catatan Wali Kelas per siswa.
  - Input Nilai Kepribadian / Sikap.
  - Tarik otomatis data absensi semesteran dari modul `DailyAttendance`.
  - Tarik otomatis data nilai ekstrakurikuler dari Pembina Ekskul.
* **FR-9.4 Cetak Raport Digital Resmi (E-Raport)**:
  - Format cetak A4 presisi anti-potong (`@media print` dengan `page-break-inside: avoid`).
  - KOP resmi sekolah dinamis, menampilkan NIS dan NISN berdampingan.
  - Tabel capaian akademik seluruh mapel + KKTP + Predikat + Deskripsi Capaian TP.
  - Tabel rekap absensi (Sakit, Izin, Dispensasi, Alpa).
  - Kolom tanda tangan resmi Orang Tua, Wali Kelas, dan Kepala Sekolah.
  - **QR Code Verifikasi Resmi**: Memuat token unik yang jika dipindai mengarah ke URL verifikasi keaslian dokumen (`/verify/report/[token]`).
* **FR-9.5 Ekspor Format e-Rapor SNPMB/Dapodik**:
  - Tombol ekspor data nilai format Excel/CSV yang sesuai dengan skema impor aplikasi e-Rapor resmi Kemendikbudristek untuk kebutuhan data dukung seleksi SNPMB.

### MODUL 10: MODUL KOKURIKULER (P5 DINAMIS) & EKSTRAKURIKULER
* **FR-10.1 Modul Kokurikuler Fleksibel**:
  - Pembuatan Projek Kokurikuler (`CoCurricularProject`): Judul projek, deskripsi tema, dan dimensi profil lulusan yang dinilai.
  - Input penilaian dimensi (*Mulai Berkembang*, *Sedang Berkembang*, *Berkembang Sesuai Harapan*, *Sangat Berkembang*).
  - Cetak lembar Rapor Kokurikuler terpisah.
* **FR-10.2 Modul Ekstrakurikuler Mandiri**:
  - Pembina Ekskul menginput nilai ekskul (*Sangat Baik / Baik / Cukup*) dan catatan kegiatan anggota ekskul secara mandiri di portal guru.
  - Nilai otomatis mengalir ke rapor wali kelas.

---

## 4. KEBUTUHAN NON-FUNGSIONAL (NON-FUNCTIONAL REQUIREMENTS)

### 4.1 Keamanan & Privasi Data (Security Hardening)
1. **Otorisasi Tingkat Baris (Defense-in-Depth Anti-IDOR)**:
   - Setiap endpoint API memvalidasi kepemilikan data: Siswa A ditolak jika mencoba mengakses data/rapor Siswa B (HTTP 403 Forbidden).
   - Guru A ditolak jika mencoba mengubah nilai kelas Guru B.
2. **Zero-Plaintext Password Policy**:
   - Database dilarang keras menyimpan password plaintext. Seluruh password disimpan dalam bentuk hash **bcrypt** (salt rounds 10).
   - Kartu ujian mencetak password sementara yang digenerate di memori dan langsung dipaksa ganti saat login pertama.
3. **Penyembunyian Kunci Jawaban CBT di Server**:
   - API soal ujian `/api/cbt/questions` menyaring (*strip*) kolom `correctAnswer` dan `explanation`. Browser siswa tidak pernah menerima kunci jawaban sampai ujian selesai dievaluasi di server.
4. **Sanitasi XSS & Upload Aman**:
   - Konten soal KaTeX/HTML disanitasi ketat dari tag berbahaya (`<script>`, `<iframe>`).
   - Berkas upload divalidasi MIME type asli (magic bytes), batas 5MB, dan nama file teracak UUID.
5. **Rate Limiting & Anti-Brute Force**:
   - Batas login: Maksimal 5 kali percobaan gagal per IP/akun (cooldown 15 menit).
   - Batas token CBT: Maksimal 3 kali salah per siswa (cooldown 1 menit).
6. **Audit Trail**:
   - Model `AuditLog` mencatat aksi krusial: perubahan nilai rapor, reset sesi ujian, hitung ulang skor, dan buka kunci nilai beserta timestamp, user ID, dan IP address.

### 4.2 Performa & Konkurensi Database
1. **Konfigurasi SQLite WAL Mode**:
   - Dijalankan dengan `PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA synchronous = NORMAL;`.
   - Pembacaan paralel tidak memblokir penulisan.
2. **Skalabilitas Portabel (Prisma ORM)**:
   - Skema Prisma dirancang portabel sehingga jika sekolah ingin bermigrasi ke PostgreSQL / MySQL, hanya perlu mengganti `DATABASE_URL` tanpa merombak kode aplikasi.

### 4.3 Keandalan Operasional & Disaster Recovery
1. **Dual-Layer AutoSave CBT**:
   - Jawaban ujian tersimpan seketika di LocalStorage lokal dan disinkronkan ke server. Jika listrik padam atau laptop siswa mati, jawaban tetap utuh saat perangkat dinyalakan kembali.
2. **Backup & Restore 1-Klik**:
   - Admin dapat mengunduh backup file database (`school.db`) langsung dari panel kontrol admin dan menjalankan restore dengan verifikasi password Super Admin.

### 4.4 Aksesibilitas & Responsivitas Mobile
- Seluruh antarmuka CBT dan portal siswa dirancang mobile-first, ramah sentuhan, dan responsif untuk siswa yang mengerjakan ujian via smartphone atau tablet.

---

## 5. RENCANA IMPLEMENTASI & TAHAPAN RILIS (MILESTONE ROADMAP)

Untuk menjamin kualitas dan mencegah pembengkakan ruang lingkup (*scope creep*), pengerjaan dibagi menjadi **3 Milestone Terukur**:

```mermaid
gantt
    title Roadmap Implementasi Sistem Sekolah & CBT Terpadu
    dateFormat  YYYY-MM-DD
    section Milestone 1: Inti Akademik & CBT
    Fase 1: Auth, IDOR & Database WAL         :m1_1, 2026-10-27, 2d
    Fase 2: Master Akademik & Import Excel     :m1_2, after m1_1, 3d
    Fase 3: Core CBT Engine (KaTeX, seq, Proktor):m1_3, after m1_2, 4d
    Fase 4: Buku Nilai TP, Leger & E-Rapor     :m1_4, after m1_3, 3d
    section Milestone 2: Operasional Sekolah
    Fase 5: Absensi Terpisah & Kartu Ujian     :m2_1, after m1_4, 2d
    Fase 6: Kokurikuler P5 & Ekstrakurikuler   :m2_2, after m2_1, 2d
    section Milestone 3: Portal Publik & Final
    Fase 7: Landing Page & PPDB Online 2FA     :m3_1, after m2_2, 3d
    Fase 8: End-to-End Testing & Backup DB     :m3_2, after m3_1, 2d
```

### Milestone 1: Inti Akademik & CBT Engine (MVP Inti)
* **Fase 1**: Setup proyek Next.js 15, Prisma SQLite WAL, autentikasi Bcrypt/JWT, dan otorisasi baris anti-IDOR. *(Unit Test: Auth & IDOR)*.
* **Fase 2**: Master Data Akademik (Tahun Ajaran, Kelas, Mapel, Tujuan Pembelajaran, Siswa, Guru) + Form Tambah Manual & Import Excel Validasi. *(Unit Test: Parser Excel & Validasi NISN)*.
* **Fase 3**: Core CBT Engine (Bank Soal KaTeX, ExamQuestion, Ruang Ujian, Update Atomik `seq`, Proktor Live Monitor, Reset Sesi, Koreksi Essay). *(Unit Test: Scoring CBT & Atomic seq)*.
* **Fase 4**: Buku Nilai Guru Mapel (Asesmen per TP, Tarik CBT otomatis), Buku Leger Kelas (Ranking Tie-Breaker), Template Cetak E-Raport A4/PDF, dan Ekspor format e-Rapor resmi SNPMB. *(Unit Test: Auto-Deskripsi TP & Null-safe Calculator)*.

### Milestone 2: Operasional Sekolah Lengkap
* **Fase 5**: Absensi Harian Sekolah (termasuk status Dispensasi) vs Presensi Jam Mapel + Generator Cetak Kartu Peserta Ujian Massal. *(Unit Test: Rekapitulasi Absensi)*.
* **Fase 6**: Modul Kokurikuler Dinamis (P5), Modul Pembina Ekstrakurikuler Mandiri, dan Manajemen Jadwal Pelajaran dengan deteksi bentrok otomatis. *(Unit Test: Deteksi Bentrok Jadwal)*.

### Milestone 3: Portal Publik & Finalisasi
* **Fase 7**: Landing Page Publik responsif (Profil, Berita/Artikel, Fasilitas, Sambutan Kepsek) + PPDB Online dengan verifikasi 2-Faktor.
* **Fase 8**: Pengujian menyeluruh (End-to-End Playwright, pengujian konkurensi SQLite), fitur backup/restore database, dan validasi build produksi `npm run build`.

---

## 6. STRATEGI TESTING & ACCEPTANCE CRITERIA

### 6.1 Kriteria Keberhasilan (Acceptance Criteria)
1. **Keamanan**: Tidak ada kebocoran kunci jawaban pada inspeksi browser siswa; pengujian akses direct URL siswa lain mengembalikan status HTTP 403.
2. **Keandalan Ujian**: Uji coba refresh browser dan simulasi pemutusan internet di tengah ujian menunjukkan jawaban siswa tidak hilang dan timer melanjutkan sisa waktu sebelumnya.
3. **Akurasi Nilai & Rapor**: Nilai rapor teragregasi otomatis dari asesmen per TP; narasi deskripsi tersusun otomatis tanpa error; cetak print preview pas di kertas A4 tanpa tabel terpotong.
4. **Efisiensi Data**: Upload 500 data siswa via file Excel berhasil terproses dalam waktu < 5 detik dengan laporan validasi yang jelas jika ada kesalahan data.

---

*Dokumen PRD ini disahkan sebagai acuan tunggal dalam pembangunan sistem aplikasi sekolah.*
