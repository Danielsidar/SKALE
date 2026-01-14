import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle } from "lucide-react";

export const LandingHero = () => {
  return (
    <section className="pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            הדרך הקלה ביותר לבנות קורס דיגיטלי
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8">
            תבנו קורסים מדהימים <br />
            <span className="text-primary">בלי להתאמץ בכלל</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
            הפלטפורמה המתקדמת ביותר לניהול קורסים דיגיטליים, בניית אקדמיות ומכירת ידע. 
            הכל במקום אחד, בעיצוב מודרני ונוח לשימוש.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <Button size="lg" asChild className="rounded-full px-8 h-14 text-lg font-bold shadow-xl shadow-primary/20">
              <Link href="/signup">
                התחילו עכשיו בחינם
                <ArrowLeft className="ms-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg font-bold border-2">
              <PlayCircle className="me-2 w-5 h-5" />
              צפו בדמו
            </Button>
          </div>

          <div className="relative w-full max-w-5xl mx-auto px-4">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 h-40 bottom-0 top-auto" />
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-slate-100 bg-slate-200 aspect-[16/9]">
              {/* Mockup content or image would go here */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
                  alt="Dashboard Preview"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" />
                <div className="z-20 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-white">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
                        <PlayCircle className="w-10 h-10" />
                    </div>
                    <span className="font-bold text-slate-900">תצוגה מקדימה של המערכת</span>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

