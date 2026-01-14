import React from "react"
import Link from "next/link"
import { BookOpen } from "lucide-react"

// Prevent static generation - env vars not available at build time
export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex dir-rtl" dir="rtl">
      {/* Right side: Form (Login/Signup) */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="flex items-center gap-3 mb-12 group">
            <img 
              src="https://misi.site/wp-content/uploads/2026/01/Logo.png" 
              alt="Logo" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          {children}
        </div>
      </div>

      {/* Left side: Visual/Marketing (Stripe style) */}
      <div className="hidden lg:flex flex-1 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-slate-900 to-slate-900" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col justify-center p-24 text-white space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-black leading-tight">
              הפלטפורמה המתקדמת ביותר<br />
              <span className="text-primary">לניהול אקדמיה דיגיטלית.</span>
            </h2>
            <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
              הצטרפו למאות מרצים ומוסדות לימוד שכבר מנהלים את הקורסים שלהם בדרך המודרנית והחכמה ביותר.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-12 border-t border-white/10">
            <div>
              <p className="text-3xl font-black text-white">1,200+</p>
              <p className="text-slate-400 font-bold">קורסים פעילים</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">45,000+</p>
              <p className="text-slate-400 font-bold">סטודנטים לומדים</p>
            </div>
          </div>

          <div className="pt-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[2.5rem] space-y-4">
              <div className="flex gap-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-lg font-medium text-white/90 italic leading-relaxed">
                "המערכת הזו שינתה לחלוטין את הדרך שבה אנחנו מתקשרים עם הסטודנטים שלנו. חווית המשתמש פשוט מדהימה."
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-12 bg-slate-700 rounded-xl" />
                <div>
                  <p className="font-black text-white">ד"ר אלון ישראלי</p>
                  <p className="text-sm text-slate-400 font-bold tracking-tight uppercase">מנכ"ל אקדמיית TechNext</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Abstract shapes for visual flair */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      </div>
    </div>
  )
}

