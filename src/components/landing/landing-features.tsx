import { 
  Zap, 
  Shield, 
  Palette, 
  BarChart3, 
  Users, 
  Smartphone 
} from "lucide-react";

const features = [
  {
    title: "בניית קורסים מהירה",
    description: "ממשק גרירה ושחרור אינטואיטיבי שמאפשר לכם לבנות קורס שלם בדקות, לא בימים.",
    icon: Zap,
    color: "bg-amber-100 text-amber-600"
  },
  {
    title: "עיצוב מותאם אישית",
    description: "שליטה מלאה על המיתוג שלכם. לוגו, צבעים וגופנים - הכל בהתאמה אישית למותג שלכם.",
    icon: Palette,
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "אנליטיקה מתקדמת",
    description: "עקבו אחרי התקדמות התלמידים שלכם בזמן אמת וקבלו תובנות על איכות התוכן.",
    icon: BarChart3,
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "ניהול תלמידים",
    description: "מערכת ניהול הרשאות וגישה מתקדמת. שלטו בדיוק מי רואה מה ומתי.",
    icon: Users,
    color: "bg-green-100 text-green-600"
  },
  {
    title: "מותאם לכל מכשיר",
    description: "חוויית למידה מושלמת מהמחשב, מהטאבלט או מהנייד. התלמידים שלכם יכולים ללמוד מכל מקום.",
    icon: Smartphone,
    color: "bg-rose-100 text-rose-600"
  },
  {
    title: "אבטחה מקסימלית",
    description: "התוכן שלכם מוגן ובטוח. הצפנת וידאו וגיבויים יומיים שומרים על הידע שלכם.",
    icon: Shield,
    color: "bg-emerald-100 text-emerald-600"
  }
];

export const LandingFeatures = () => {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-6">
            כל מה שאתם צריכים <br />
            <span className="text-primary">במקום אחד</span>
          </h2>
          <p className="text-lg text-slate-600">
            בנינו את הכלים החזקים ביותר כדי שתוכלו להתמקד במה שחשוב באמת - העברת הידע שלכם הלאה.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:shadow-xl hover:shadow-primary/5 transition-all group"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};



