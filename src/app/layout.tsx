import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AnalysisProvider } from "../lib/context/AnalysisContext";
import Navbar from "../components/Navbar";
import { AuthProvider } from '../context/AuthContext';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Advocare",
  description: "Advocare web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AnalysisProvider><Navbar />
            <main>
              {children}
            </main></AnalysisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
