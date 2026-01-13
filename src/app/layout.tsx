import "./globals.css";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata = {
  title: "Dasar Seni Musik - Platform Belajar Interaktif - bySunan",
  description: "Belajar unsur musik, alat musik, dan teori musik dasar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      {/* PENTING: 
        1. 'min-h-screen' di body menjaga background tetap penuh.
        2. HAPUS 'h-screen' atau 'overflow-hidden' di sini agar defaultnya BISA scroll.
      */}
      <body
        className={`${montserrat.className} bg-blue-50 text-slate-800 min-h-screen m-0 p-0`}
      >
        <main className="w-full">{children}</main>
      </body>
    </html>
  );
}
