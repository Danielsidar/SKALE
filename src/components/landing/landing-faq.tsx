import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "האם יש תקופת ניסיון חינם?",
    answer: "כן! ניתן להתחיל עם התוכנית החינמית שלנו ללא הגבלת זמן, או לנסות את התוכנית המקצועית למשך 14 יום ללא עלות."
  },
  {
    question: "האם אני צריך ידע טכני כדי לבנות קורס?",
    answer: "ממש לא. המערכת עוצבה כך שכל אחד יכול להשתמש בה. ממשק הגרירה והשחרור שלנו הופך את בניית הקורס לפשוטה ומהנה."
  },
  {
    question: "איפה מאוחסנים הסרטונים שלי?",
    answer: "הסרטונים מאוחסנים על השרתים המאובטחים שלנו עם הגנה מתקדמת מפני העתקות והורדות לא מורשות."
  },
  {
    question: "האם ניתן להשתמש בדומיין משלי?",
    answer: "בוודאי. בתוכנית המקצועית והארגונית ניתן לחבר דומיין מותאם אישית (לדוגמה: academy.yourdomain.com)."
  },
  {
    question: "איך מתבצע התשלום מהתלמידים?",
    answer: "המערכת מתחברת בקלות לספקי סליקה מובילים כמו Stripe ו-Meshulam, כך שתוכלו לקבל תשלומים ישירות לחשבון שלכם."
  }
];

export const LandingFaq = () => {
  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-6">
            שאלות <span className="text-primary">נפוצות</span>
          </h2>
          <p className="text-lg text-slate-600">
            יש לכם שאלות? יש לנו תשובות. אם לא מצאתם מה שחיפשתם, אתם מוזמנים ליצור איתנו קשר.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white border border-slate-200 rounded-3xl px-6"
              >
                <AccordionTrigger className="text-right font-bold text-lg py-6 hover:no-underline text-slate-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-base pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};



