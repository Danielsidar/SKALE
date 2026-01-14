'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export const LandingNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="https://misi.site/wp-content/uploads/2026/01/Logo.png" 
            alt="Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-slate-600 hover:text-primary transition-colors font-medium">
            תכונות
          </Link>
          <Link href="#pricing" className="text-slate-600 hover:text-primary transition-colors font-medium">
            מחירים
          </Link>
          <Link href="#faq" className="text-slate-600 hover:text-primary transition-colors font-medium">
            שאלות נפוצות
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="hidden sm:inline-flex rounded-full">
            <Link href="/login">כניסה</Link>
          </Button>
          <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
            <Link href="/signup">הרשמה חינם</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

