import type { Metadata } from "next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
  style: ["italic"],
});

export const metadata: Metadata = {
  title: {
    default: "SIPINTER",
    template: "%s | SIPINTER",
  },
  description:
    "Sistem Informasi Peminjaman Inventaris Kantor Terintegrasi Pemerintah Kota Makassar",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${publicSans.variable} ${sourceSerif.variable}`}>{children}</body>
    </html>
  );
}
