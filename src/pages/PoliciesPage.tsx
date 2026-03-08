import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
            Policies
          </h1>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Please review our terms and policies below.
          </p>

          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-8">
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="refund">Refund Policy</TabsTrigger>
            </TabsList>

            <TabsContent value="terms" className="glass-strong rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Terms of Service</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  By accessing and using Unc Code Academy, you agree to be bound by these Terms
                  of Service. Please read them carefully before using our platform.
                </p>
                <h3 className="text-lg font-semibold text-foreground pt-2">Account Registration</h3>
                <p>
                  You must provide accurate information when creating an account. You are
                  responsible for maintaining the security of your account credentials and for
                  all activities that occur under your account.
                </p>
                <h3 className="text-lg font-semibold text-foreground pt-2">Course Access</h3>
                <p>
                  Upon purchasing a course, you receive a personal, non-transferable license to
                  access the course content. Sharing, redistributing, or reselling course
                  materials is strictly prohibited.
                </p>
                <h3 className="text-lg font-semibold text-foreground pt-2">Intellectual Property</h3>
                <p>
                  All course content, including videos, text, code examples, and supplementary
                  materials, is the intellectual property of Unc Code Academy and its
                  instructors.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="glass-strong rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Privacy Policy</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Your privacy is important to us. This policy outlines how we collect, use,
                  and protect your personal information.
                </p>
                <h3 className="text-lg font-semibold text-foreground pt-2">Information We Collect</h3>
                <p>
                  We collect information you provide directly, such as your name, email address,
                  and payment information when you create an account or purchase a course. We
                  also collect usage data to improve our services.
                </p>
                <h3 className="text-lg font-semibold text-foreground pt-2">How We Use Your Information</h3>
                <p>
                  We use your information to provide and improve our services, process payments,
                  communicate with you about courses and updates, and ensure the security of our
                  platform.
                </p>
                <h3 className="text-lg font-semibold text-foreground pt-2">Data Protection</h3>
                <p>
                  We implement industry-standard security measures to protect your data. Your
                  information is never sold to third parties.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="refund" className="glass-strong rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Refund Policy</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We want you to be completely satisfied with your purchase. If a course doesn't
                  meet your expectations, we offer the following refund policy.
                </p>
                <h3 className="text-lg font-semibold text-foreground pt-2">30-Day Money-Back Guarantee</h3>
                <p>
                  If you are unsatisfied with a course, you may request a full refund within 30
                  days of purchase, provided you have not completed more than 30% of the course
                  content.
                </p>
                <h3 className="text-lg font-semibold text-foreground pt-2">How to Request a Refund</h3>
                <p>
                  To request a refund, please contact our support team through the Contact page
                  with your order details. Refunds are typically processed within 5–10 business
                  days.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}
