import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SMA Negeri Unggulan Bangsa | Portal Akademik, CBT & E-Raport",
  description:
    "Sistem Informasi Manajemen Sekolah Terpadu: PPDB Online, Administrasi Dapodik, Penilaian Kurikulum Merdeka (TP-Based), E-Raport, dan Mesin Ujian CBT Anti-Curang.",
  icons: {
    icon: "/images/logo.svg",
    apple: "/images/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/images/logo.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased selection:bg-gold-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
