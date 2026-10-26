# DESIGN SYSTEM & UI/UX SPECIFICATION (DESIGN_SYSTEM.md)
## PLATFORM SISTEM INFORMASI AKADEMIK, CBT & E-RAPOR SEKOLAH TERPADU
**Versi Dokumen:** 1.0.0  
**Status:** Definitif & Disahkan  
**Filosofi Desain:** *Craft-First Engineering* (Emil Kowalski), *Tri-Mode Architecture* (Impeccable), *Institutional Swiss Modernism 2.0* (UI/UX Pro Max), dan *Modern Web Platform Standards*.

---

## 1. PRINSIP DESAIN & FILOSOFI CRAFT

Platform ini melayani spektrum pengguna yang luas: mulai dari calon siswa dan orang tua yang mengakses Landing Page, hingga guru dan siswa yang menatap layar selama 90 menit penuh saat ujian CBT. Desain dibangun atas 4 pilar inti:

1. **Unseen Details Compound (Emil Kowalski)**:
   - Pengguna mungkin tidak menyadari mengapa aplikasi terasa sangat mulus, responsif, dan tenang saat digunakan. Itu adalah hasil akumulasi dari ratusan detail tak kasat mata: angka tabular yang tidak bergeser saat timer berdetak, tombol yang merespons tekanan jari seketika, dan transisi yang tidak pernah menghalangi navigasi.
2. **Tri-Mode Surface Distinction (Impeccable)**:
   - **Persuade Mode** (Landing Page & PPDB): Visual berani, kontras tinggi, kedalaman tipografi, menginspirasi kepercayaan orang tua murid.
   - **Operate Mode** (Admin TU, Buku Nilai Guru, Proctoring, & Ruang Ujian CBT): Kerapatan informasi tinggi, kontras teks maksimal, zero decorative noise, keyboard-friendly.
   - **Read Mode** (E-Raport Digital & Cetak PDF): Presisi kertas A4, hierarki formal kelembagaan, dan keterbacaan cetak sempurna.
3. **Tabular Numerics Everywhere**:
   - Seluruh elemen angka (Timer hitung mundur CBT, NISN, NIP, nilai angka, bobot persen, dan tanggal) **wajib menggunakan angka tabular (`font-variant-numeric: tabular-nums`)** agar tidak terjadi getaran tata letak (*layout jitter*).
4. **Accessible by Default (WCAG 2.1 AA)**:
   - Kontras teks normal minimal 4.5:1, teks kecil minimal 7:1 terhadap latar belakang.
   - Indikator fokus yang jelas dan tegas untuk navigasi keyboard siswa disabilitas.

---

## 2. PALET WARNA RESMI (COLOR TOKENS)

Palet warna dirancang berdasarkan *Institutional Navy & Academic Gold* yang merefleksikan kehormatan institusi pendidikan, ketelitian akademik, dan kejelasan status operasional.

### 2.1 Skema Warna Inti (Core Palette)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SKEMA WARNA CORE SISTEM                                   │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ Primary Navy      │ Royal Blue        │ Academic Gold     │ Crisp Background           │
│ #0F2942           │ #2563EB           │ #D97706           │ #F8FAFC                    │
│ Institusi/Wibawa  │ Aksi/Interaktif   │ Prestasi/Highlight│ Latar Utama Bersih         │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────┘
```

| Token CSS | Kode HEX | RGB / HSL | Penggunaan & Kontras |
|---|---|---|---|
| `--color-primary-900` | `#0A1B2D` | `rgb(10, 27, 45)` | Sidebar gelap, teks judul hero, kop formal. |
| `--color-primary-800` | `#0F2942` | `rgb(15, 41, 66)` | **Brand Primary**. Header dashboard, tombol utama. |
| `--color-primary-700` | `#1A3D63` | `rgb(26, 61, 99)` | Hover state tombol utama, header tabel. |
| `--color-primary-100` | `#E8F0F8` | `rgb(232, 240, 248)` | Background badge primary, active item sidebar. |
| `--color-secondary-600` | `#2563EB` | `rgb(37, 99, 235)` | **Interactive Accent**. Tautan aktif, fokus ring, progress bar. |
| `--color-secondary-50` | `#EFF6FF` | `rgb(239, 246, 255)` | Highlight baris tabel, banner info. |
| `--color-accent-600` | `#D97706` | `rgb(217, 119, 6)` | **Academic Gold**. Badge ranking 1-3, PPDB CTA, status ragu-ragu. |
| `--color-accent-50` | `#FFFBEB` | `rgb(255, 251, 235)` | Background badge ranking/ragu-ragu. |
| `--color-bg-base` | `#F8FAFC` | `rgb(248, 250, 252)` | Latar belakang seluruh halaman admin & CBT. |
| `--color-bg-surface` | `#FFFFFF` | `rgb(255, 255, 255)` | Kartu konten (*card*), modal, lembar soal ujian. |
| `--color-border-subtle`| `#E2E8F0` | `rgb(226, 232, 240)` | Garis batas kartu, pemisah baris tabel. |
| `--color-border-strong`| `#CBD5E1` | `rgb(203, 213, 225)` | Garis batas form input, divider panel. |
| `--color-text-main` | `#0F172A` | `rgb(15, 23, 42)` | Teks isi utama (Kontras 16.5:1 terhadap putih). |
| `--color-text-muted` | `#475569` | `rgb(71, 85, 105)` | Label, deskripsi, metadata (Kontras 7.2:1 terhadap putih). |

### 2.2 Token Status Semantik & Absensi Sekolah

Warna status dirancang spesifik untuk kebutuhan administrasi sekolah dan CBT:

| Status Sekolah / CBT | Warna Teks | Warna Background | Border | Arti & Konteks Penggunaan |
|---|---|---|---|---|
| **Hadir (H) / Tuntas** | `#047857` (Emerald 700) | `#ECFDF5` (Emerald 50) | `#A7F3D0` | Siswa hadir di kelas / Nilai $\ge$ KKTP. |
| **Sakit (S) / Pending** | `#B45309` (Amber 700) | `#FFFBEB` (Amber 50) | `#FDE68A` | Siswa sakit / Menunggu verifikasi berkas PPDB. |
| **Izin (I)** | `#0369A1` (Sky 700) | `#F0F9FF` (Sky 50) | `#BAE6FD` | Siswa izin keperluan keluarga. |
| **Dispensasi (D)** | `#4338CA` (Indigo 700) | `#EEF2FF` (Indigo 50) | `#C7D2FE` | Tugas dinas/lomba (Dihitung **Hadir 100%**). |
| **Alpa (A) / Bahaya** | `#B91C1C` (Rose 700) | `#FEF2F2` (Rose 50) | `#FECACA` | Tanpa keterangan / Siswa belum ada nilai. |
| **CBT Ragu-Ragu** | `#854D0E` (Yellow 800) | `#FEF9C3` (Yellow 100) | `#FACC15` | Soal ditandai ragu-ragu di lembar ujian siswa. |
| **CBT Terjawab** | `#065F46` (Emerald 800) | `#D1FAE5` (Emerald 100) | `#34D399` | Nomor soal yang sudah tersimpan di server. |
| **CBT Belum Dijawab**| `#475569` (Slate 600) | `#F1F5F9` (Slate 100) | `#CBD5E1` | Nomor soal yang masih kosong. |

---

## 3. TIPOGRAFI & SKALA SKALABILITAS (TYPOGRAPHY)

### 3.1 Pilihan Font & Peruntukan
* **Font Antarmuka & Teks Utama**: **`Plus Jakarta Sans`** (Google Fonts)
  - Geometric sans-serif modern dengan legibilitas superior pada layar monitor dan HP.
* **Font Angka Tabular (Timer & Nilai)**: **`Plus Jakarta Sans`** dengan CSS `tabular-nums` atau fallback `JetBrains Mono` / `ui-monospace`.
* **Font Rumus Matematika**: **`KaTeX Fonts`** (Computer Modern) untuk simbol eksak $\sqrt{x^2+y^2}$, pecahan $\frac{a}{b}$, dan matriks.
* **Font KOP Rapor Cetak**: **`EB Garamond`** atau **`Times New Roman`** untuk KOP resmi dinas sekolah, dipadukan dengan Plus Jakarta Sans untuk tabel nilai.

### 3.2 Skala Ukuran Tipografi (Fluid Scale)

| Token Tipe | Ukuran (px / rem) | Line Height | Weight | Penggunaan Utama |
|---|---|---|---|---|
| `text-display` | `36px` / `2.25rem` | `1.2` | Bold (`700`) | Hero headline Landing Page. |
| `text-h1` | `28px` / `1.75rem` | `1.25` | Bold (`700`) | Judul modul dashboard, KOP nama sekolah. |
| `text-h2` | `22px` / `1.375rem` | `1.3` | SemiBold (`600`) | Sub-judul bagian, nama siswa di kartu ujian. |
| `text-h3` | `18px` / `1.125rem` | `1.4` | SemiBold (`600`) | Judul kartu, sub-seksi form. |
| `text-body` | `14px` / `0.875rem` | `1.5` | Regular (`400`) | Teks isi data tabel, soal ujian, deskripsi rapor. |
| `text-body-sm` | `13px` / `0.8125rem` | `1.45` | Regular (`400`) | Catatan kaki, bantuan form input, label tabel. |
| `text-caption` | `11px` / `0.6875rem` | `1.4` | Medium (`500`) | Badge status absensi, timestamp log audit. |
| `text-timer` | `24px` / `1.5rem` | `1.0` | Bold (`700`), `tnum` | **Timer countdown CBT** (bebas layout shift). |

---

## 4. KERANGKA KERJA ANIMASI & MIKRO-INTERAKSI (EMIL KOWALSKI CRAFT)

Animasi dirancang secara sangat disiplin untuk memberikan umpan balik fisik (*tactile feedback*) tanpa membuat pengguna merasa diperlambat.

### 4.1 Kapan Beranimasi vs Kapan Tidak Boleh Beranimasi

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        THE ANIMATION DECISION MATRIX                                   │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│ ❌ DILARANG BERANIMASI (0ms)      │ Navigasi tombol palet nomor soal CBT, keyboard     │
│    "Kecepatan & Refleks Siswa"    │ shortcuts, perpindahan baris tabel input nilai.    │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ ⚡ MIKRO-RESPONS (100ms - 150ms)   │ Button `:active` press scale, checkbox centang,    │
│    "Konfirmasi Sentuhan Fisik"    │ hover status kartu.                                │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 🎯 TRANSISI SPASIAL (200ms)       │ Buka dialog modal, drawer filter, toast autosave.  │
│    "Kesadaran Ruang Spasial"      │ Easing: cubic-bezier(0.16, 1, 0.3, 1) [Snappy Out] │
└───────────────────────────────────┴────────────────────────────────────────────────────┘
```

### 4.2 Tabel Standar Kualitas Craft (Before vs After)

| Praktik Buruk (Before) | Standar Craft Sistem Kita (After) | Alasan Teknis & Filosofi Craft |
|---|---|---|
| `transition: all 300ms` | `transition: transform 100ms ease-out, background-color 150ms ease-out` | Hindari menganimasikan seluruh properti (sebabkan lag CPU/GPU). |
| `transform: scale(0)` saat modal muncul | `transform: scale(0.96); opacity: 0` $\rightarrow$ `scale(1); opacity: 1` | Benda di dunia nyata tidak pernah muncul dari titik nol gaib. |
| Tombol klik tanpa status `:active` | `active:scale-[0.98]` dengan transisi 100ms | Memberikan kepastian fisik bahwa sentuhan/klik pengguna diterima. |
| Timer CBT bergetar saat detik berubah | `font-variant-numeric: tabular-nums` | Angka 1 lebih sempit dari angka 8. Tanpa `tabular-nums`, timer berguncang. |
| Toast notifikasi autosave muncul mendadak | Muncul dari arah asal (slide-up 200ms `ease-out`) | Menjaga konsistensi spasial antarmuka. |
| Popover meluncur lambat dengan `ease-in` | `cubic-bezier(0.16, 1, 0.3, 1)` | `ease-in` terasa lamban dan tertunda; `ease-out` responsif seketika. |

---

## 5. SPESIFIKASI KOMPONEN UTAMA (COMPONENT SPECIFICATIONS)

### 5.1 Tombol (Button System)
- **Primary Button**: Background `--color-primary-800`, teks putih, shadow halus, `active:scale-[0.98]`.
- **Secondary / Outline Button**: Border `--color-border-strong`, teks `--color-text-main`, hover background `--color-bg-base`.
- **Destructive Button**: Background Rose-600, teks putih (untuk aksi hapus / reset sesi proktor).
- **Tombol Nomor Soal CBT**:
  - Ukuran: $42 \times 42\text{ px}$ (Mobile friendly touch-target $\ge 44\text{px}$ pada area tap).
  - Teks: SemiBold 14px centered.
  - Indikator: Lingkaran kecil sudut kanan jika ragu-ragu.

### 5.2 Kartu Jawaban CBT (Answer Option Card)
- Layout radio button lebar (*card option*) dengan padding $14\text{px} \times 16\text{px}$.
- Huruf Pilihan (A, B, C, D, E) berada di dalam lingkaran $28\text{px}$ dengan font bold.
- **State Terpilih**: Border biru 2px (`border-secondary-600`), background biru lembut (`bg-secondary-50`), huruf opsi berubah warna biru kontras.

### 5.3 Formulir Input & Validasi Modern
- Focus state tegas: `outline-none ring-2 ring-primary-700 ring-offset-2`.
- Validasi instan: Menggunakan pseudo-class `:user-valid` dan `:user-invalid` modern agar pesan error tidak muncul sebelum pengguna selesai mengetik.
- Pesan error jelas: Teks merah 12px dengan ikon peringatan di bawah kolom.

### 5.4 Tabel Data & Buku Leger Nilai (High-Density Grid)
- **Zebra Striping Ringan**: Baris genap menggunakan background putih, baris ganjil `#F8FAFC`.
- **Sticky Table Header**: Header tabel mapel tetap terpancang di atas saat guru menggulir daftar 36 siswa.
- **Sticky Kolom Nama Siswa**: Kolom No, NISN, dan Nama Siswa terkunci di sebelah kiri saat tabel leger digulir mendatar ke kanan.
- Padding sel data: $10\text{px} \times 12\text{px}$ (optimal untuk pemindaian mata yang efisien).

---

## 6. SPESIFIKASI CETAK RESMI (PRINT CSS FOR E-RAPOR & KARTU UJIAN)

Cetak dokumen resmi ke format kertas A4 atau ekspor ke PDF memiliki aturan cetak khusus `@media print`:

```css
@media print {
  /* 1. Pengaturan Baku Kertas */
  @page {
    size: A4 portrait;
    margin: 15mm 15mm 15mm 15mm;
  }

  /* 2. Sembunyikan Elemen Antarmuka Komputer */
  .no-print,
  nav,
  aside,
  header,
  footer,
  button,
  .sidebar,
  .toast-container {
    display: none !important;
  }

  /* 3. Pencegahan Baris Terpotong (Anti-Orphan & Anti-Split) */
  table,
  tr,
  td,
  th,
  .report-table-row,
  .signature-block,
  .attendance-summary-box {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* 4. Penegakan Kontras Cetak & KOP */
  body {
    background: #FFFFFF !important;
    color: #000000 !important;
    font-size: 11pt !important;
    line-height: 1.35 !important;
  }

  .school-kop-divider {
    border-bottom: 3px double #000000 !important;
    margin-bottom: 12px !important;
  }
}
```

---

## 7. CHECKLIST QUALITY ASSURANCE (UI/UX PRE-FLIGHT CHECKLIST)

Sebelum komponen atau halaman dirilis ke tahap produksi, wajib memenuhi seluruh parameter berikut:

- [ ] **Accessibility Contrast**: Seluruh teks memenuhi rasio kontras minimal 4.5:1 terhadap background.
- [ ] **Tabular Numerics**: Seluruh timer CBT dan kolom angka nilai menggunakan `tabular-nums`.
- [ ] **Active Press State**: Seluruh tombol memiliki feedback sentuhan `active:scale-[0.98]`.
- [ ] **Touch Target Size**: Seluruh tombol dan opsi di layar mobile memiliki area sentuh minimal $44 \times 44\text{ px}$.
- [ ] **No All-Transitions**: Tidak ada pemakaian `transition: all` serampangan di dalam kode CSS.
- [ ] **Focus Visible**: Pengguna keyboard (Tab) dapat melihat ring fokus dengan jelas di seluruh elemen interaktif.
- [ ] **Print Verification**: Tampilan cetak E-Raport pada dialog `Ctrl + P` pas di kertas A4 tanpa baris tabel terbelah dua.
- [ ] **Dark Mode Invariant**: Halaman ujian CBT siswa menggunakan palet terang/netral yang dirancang ramah mata (*eye-strain relief*) untuk durasi 90 menit.

---

*Dokumen DESIGN_SYSTEM.md ini disahkan sebagai panduan estetika dan standar rekayasa antarmuka visual seluruh modul sistem.*
