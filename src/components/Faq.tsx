import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How is naturopathy different from modern medicine?",
    answer: "Modern medicine primarily focuses on treating symptoms, offering short-term relief for acute conditions and managing chronic diseases with medication, often without addressing the root cause. In contrast, Naturopathy targets the underlying imbalances in the body. Through natural therapies like herbal remedies, proper nutrition, and lifestyle adjustments, it enhances the body's innate ability to heal, providing long-term solutions and promoting overall wellness, all without the side effects associated with conventional treatments."
  },
  {
    question: "How do I book a consultation?",
    answer: "Booking is simple. You can call us, send a WhatsApp message, or book online through our website. Our team will guide you to the right program based on your health needs."
  },
  {
    question: "What should I expect in the first session?",
    answer: "In your first session, our experts will do a detailed health assessment, understand your lifestyle, diet, and concerns, and then suggest a customized treatment plan. You'll also get an introduction to the therapies and how they align with your health needs."
  },
  {
    question: "Are treatments safe and side-effect free?",
    answer: "Yes ✅ All our treatments are 100% natural, non-invasive, and safe. We use therapies like hydrotherapy, mud therapy, yoga, diet, and meditation etc. which have no harmful side effects."
  },
  {
    question: "Do you provide diet/lifestyle guidance?",
    answer: "Absolutely 🌱 Diet and lifestyle are a very important part of healing. Our naturopaths will guide you with personalized meal plans, seasonal diet tips, and lifestyle practices that keep you stay healthy even after your therapy ends."
  },
  {
    question: "How long does a treatment program last?",
    answer: "It depends on your health goals and condition. Some people feel benefits after just a few sessions, while others may need a program lasting a few weeks. Our team will design the duration that best supports your healing journey."
  },
  {
    question: "Which health problems can be treated at your center?",
    answer: "We provide assistance with any lifestyle related disorders, obesity, diabetes, hypertension, arthritis, skin problems, digestive issues, stress, pains, long term chronic problems and general wellness."
  },
  {
    question: "Do you provide only consultations or therapies also?",
    answer: "Both. We provide doctor consultations as well as therapies like mud therapy, hydrotherapy, panchkarma therapies, chromotherapy, acupuncture, acupressure, various healing massages, yoga guidance, colon cleanse, korean head spa and diet planning."
  },
  {
    question: "Do you give medicines?",
    answer: "No allopathic medicines. We only use natural therapies, diet, and lifestyle corrections."
  },
  {
    question: "What should I expect on my first visit?",
    answer: "Our doctor will check your health history, understand your concerns, and then suggest suitable therapies."
  },
  {
    question: "Do I need to get admitted for treatment?",
    answer: "No, our center is OPD-based. You can visit, take consultation, and return home the same day."
  },
  {
    question: "How long does each therapy session take?",
    answer: "Most therapies take 30–60 minutes depending on the treatment."
  },
  {
    question: "How many sessions will I need?",
    answer: "It depends on your health condition. Some people benefit in a few sessions, while chronic cases may need regular follow-ups."
  }
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-20 bg-background">
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