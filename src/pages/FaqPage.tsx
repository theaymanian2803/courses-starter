import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I get started?",
    answer:
      "Simply create a free account, browse our course catalog, and enroll in any course that interests you. You can start learning immediately after purchase.",
  },
  {
    question: "Are the courses self-paced?",
    answer:
      "Yes! All courses are fully self-paced. You can learn on your own schedule and revisit lessons as many times as you need.",
  },
  {
    question: "Do I get lifetime access to courses?",
    answer:
      "Yes, once you purchase a course, you have lifetime access to all the course materials, including any future updates the instructor adds.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept major credit cards, debit cards, and PayPal. All payments are processed securely through our payment partners.",
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer:
      "Absolutely. We offer a 30-day money-back guarantee on all courses, provided you haven't completed more than 30% of the content. Check our Policies page for full details.",
  },
  {
    question: "Do I receive a certificate upon completion?",
    answer:
      "Yes, upon completing all lessons in a course, you will receive a certificate of completion that you can share on your profile or resume.",
  },
  {
    question: "Are there any prerequisites?",
    answer:
      "Each course lists its own prerequisites on the course detail page. Many of our beginner courses require no prior experience at all.",
  },
  {
    question: "How can I contact support?",
    answer:
      "You can reach us through our Contact page, or email us directly. We aim to respond to all inquiries within 24 hours.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="glass-strong rounded-2xl p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
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
      </div>
      <Footer />
    </div>
  );
}
