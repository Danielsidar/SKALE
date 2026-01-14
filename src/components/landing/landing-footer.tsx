import Link from "next/link";
import { GraduationCap, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export const LandingFooter = () => {
  return (
    <footer className="bg-slate-900 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img 
                src="https://misi.site/wp-content/uploads/2026/01/Logo.png" 
                alt="Logo" 
                className="h-10 w-auto object-contain brightness-0 invert" 
              />
            </div>
            <p className="text-slate-400 leading-relaxed mb-6">
              הפלטפורמה המתקדמת ביותר לניהול קורסים דיגיטליים ובניית אקדמיות אונליין.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">מוצר</h4>
            <ul className="space-y-4 text-slate-400">
              <li><Link href="#features" className="hover:text-primary transition-colors">תכונות</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">מחירים</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">עדכונים</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">אפליקציה</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">חברה</h4>
            <ul className="space-y-4 text-slate-400">
              <li><Link href="#" className="hover:text-primary transition-colors">עלינו</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">בלוג</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">קריירה</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">צרו קשר</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">משפטי</h4>
            <ul className="space-y-4 text-slate-400">
              <li><Link href="#" className="hover:text-primary transition-colors">תנאי שימוש</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">מדיניות פרטיות</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">עוגיות</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">נגישות</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:row items-center justify-between gap-4 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} COURSES. כל הזכויות שמורות.</p>
          <div className="flex items-center gap-6">
            <span>נבנה באהבה בישראל 🇮🇱</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


