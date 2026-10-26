const fs = require("fs");
const path = require("path");

const target = process.argv[2]?.toLowerCase() || "supabase";
const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

if (!fs.existsSync(schemaPath)) {
  console.error("❌ File schema.prisma tidak ditemukan.");
  process.exit(1);
}

let content = fs.readFileSync(schemaPath, "utf-8");

if (target === "supabase" || target === "postgres" || target === "postgresql") {
  content = content.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`
  );
  fs.writeFileSync(schemaPath, content, "utf-8");
  console.log("✅ Berhasil beralih ke mode: SUPABASE (PostgreSQL).");
  console.log("   - provider: postgresql");
  console.log("   - directUrl: diaktifkan");
  console.log("   - Pastikan DATABASE_URL & DIRECT_URL di .env sudah diisi kredensial Supabase.");
} else if (target === "sqlite" || target === "local") {
  content = content.replace(
    /datasource db \{[\s\S]*?\}/,
    `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`
  );
  fs.writeFileSync(schemaPath, content, "utf-8");
  console.log("✅ Berhasil beralih ke mode: SQLITE (Lokal).");
  console.log("   - provider: sqlite");
  console.log("   - directUrl: dinonaktifkan");
  console.log("   - DATABASE_URL: file:./school.db");
} else {
  console.log("Gunakan: node scripts/switch-db.js [supabase|sqlite]");
}
