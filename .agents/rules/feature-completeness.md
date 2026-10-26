# Aturan Kelengkapan Fitur (Three-Tier Delivery Invariant)

1. **Definisi Selesai (Definition of Done)**:
   Sebuah fitur atau modul operasional dari PRD/permintaan pengguna HANYA boleh dianggap selesai jika ketiga lapisan berikut telah terimplementasi dan terhubung:
   - **Lapisan 1 (Data Layer)**: Tabel relasional, migrasi, dan seed data Prisma/SQL.
   - **Lapisan 2 (API/Action Layer)**: Handler server untuk membaca, memvalidasi, dan menyimpan data (GET/POST/PUT/DELETE).
   - **Lapisan 3 (Presentation Layer)**: Antarmuka UI interaktif (komponen, halaman, tombol, form input, dan link navigasi yang terlihat dan dapat dioperasikan oleh pengguna di browser).

2. **Dilarang Menunda Lapisan Antarmuka (No Phantom Features)**:
   Jangan pernah melaporkan bahwa suatu modul fungsional (seperti presensi, administrasi, manajemen pengguna) telah selesai jika pengguna tidak memiliki halaman atau tombol UI untuk menjalankannya. Jika fitur baru selesai di tingkat skema database, jelaskan secara transparan kepada pengguna bahwa lapisan UI masih perlu diimplementasikan.
