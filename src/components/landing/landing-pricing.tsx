import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "בסיסי",
    price: "0",
    description: "מושלם למתחילים שרוצים לנסות את המערכת",
    features: [
        "עד 3 קורסים",
        "עד 50 תלמידים",
        "אחסון עד 5GB",
        "תמיכה במייל",
        "מיתוג בסיסי"
    ],
    buttonText: "התחלו בחינם",
    popular: false
  },
  {
    name: "מקצועי",
    price: "199",
    description: "הפתרון המושלם לעסקים בצמיחה",
    features: [
        "קורסים ללא הגבלה",
        "עד 1,000 תלמידים",
        "אחסון עד 50GB",
        "תמיכה מהירה בצ'אט",
        "מיתוג מלא (Whitelabel)",
        "אנליטיקה מתקדמת",
        "דומיין מותאם אישית"
    ],
    buttonText: "נסו בחינם ל-14 יום",
    popular: true
  },
  {
    name: "ארגוני",
    price: "499",
    description: "לארגונים גדולים עם צרכים מיוחדים",
    features: [
        "כל מה שיש במקצועי",
        "תלמידים ללא הגבלה",
        "אחסון ללא הגבלה",
        "מנהל לקוח אישי",
        "אינטגרציות API",
        "SLA מובטח",
        "תמיכה טלפונית"
    ],
    buttonText: "צרו קשר",
    popular: false
  }
];

export const LandingPricing = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-6">
            תוכניות שמתאימות <br />
            <span className="text-primary">לכל שלב בעסק</span>
          </h2>
          <p className="text-lg text-slate-600">
            בחרו את התוכנית המתאימה לכם ביותר. ניתן לשדרג או לבטל בכל עת.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative flex flex-col p-8 rounded-[2.5rem] border ${
                plan.popular 
                ? "border-primary shadow-2xl shadow-primary/10 bg-white scale-105 z-10" 
                : "border-slate-200 bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                  הנבחרת ביותר
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">₪{plan.price}</span>
                <span className="text-slate-500 font-medium">/ לחודש</span>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                variant={plan.popular ? "default" : "outline"}
                className={`w-full rounded-full font-bold h-12 ${
                  plan.popular ? "shadow-lg shadow-primary/20" : "border-2"
                }`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};



