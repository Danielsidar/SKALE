import type { Metadata } from "next";
import { Inter, Assistant } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const assistant = Assistant({ subsets: ["hebrew", "latin"], variable: "--font-assistant" });

export const metadata: Metadata = {
  title: "מערכת לניהול קורסים",
  description: "פלטפורמת LMS רב-ארגונית",
  icons: {
    icon: "https://misi.site/wp-content/uploads/2026/01/ICON.png",
    apple: "https://misi.site/wp-content/uploads/2026/01/ICON.png",
  }
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={cn(
        "min-h-screen bg-background font-assistant antialiased",
        assistant.variable,
        inter.variable
      )}>
        {children}
        <Toaster position="top-center" dir="rtl" />
      </body>
    </html>
  );
}

