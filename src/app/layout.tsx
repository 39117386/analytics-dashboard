import type { Metadata, Viewport } from "next";
import { AppNav } from "@/components/AppNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sales Dashboard Portfolio",
  description: "Historical sales dashboard and forecasting views with Next.js and Recharts",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100">
        <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_38%),linear-gradient(180deg,_rgba(15,23,42,0.98)_0%,_rgba(2,6,23,1)_100%)]">
          <AppNav />
          {children}
        </div>
      </body>
    </html>
  );
}
