import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const faqs = [
  {
    question: "Helps to detox and stay true to your health throughout the year.",
    answer: "Our therapies focus on natural detoxification, helping your body eliminate toxins regularly and keeping you energized and healthy year-round."
  },
  {
    question: "Natural sourcing of products leaves a lasting effect on the body.",
    answer: "We use only naturally sourced remedies and ingredients that work in harmony with your body, leaving a deeper and longer-lasting impact on your overall well-being."
  },
  {
    question: "Bringing calmness to the body and mind, resets the natural healing process.",
    answer: "Through yoga, meditation, and relaxation therapies, we bring balance to the mind and body, allowing your natural healing ability to reset and function at its best."
  },
  {
    question: "Unique Yogic practices that can heal the chakras.",
    answer: "Our experts guide you through specialized yogic practices that align and heal your chakras, promoting emotional balance, mental clarity, and inner peace."
  },
  {
    question: "Guided “Ahaar” practices that are easy to follow.",
    answer: "We provide simple, practical dietary guidance (‘Ahaar’) tailored to your lifestyle, making it easy to sustain healthy eating habits without stress."
  },
  {
    question: "Result oriented Naturopathy practices along with luxury wellness.",
    answer: "We combine proven naturopathy treatments with premium wellness experiences, ensuring you get effective healing with a touch of luxury and comfort."
  }
];


export const FAQ = () => {
  return (
    <section id="faq" className=" bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Get answers to common questions about our naturopathy treatments and services
          </p>
        </div>
        
        <div className="bg-gradient-card rounded-2xl p-8 shadow-card-default">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/50 rounded-lg px-6 py-2 bg-card hover:shadow-natural transition-all duration-300"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
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