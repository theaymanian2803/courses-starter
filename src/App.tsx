import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import CoursesPage from "./pages/CoursesPage";
import AboutPage from "./pages/AboutPage";
import PoliciesPage from "./pages/PoliciesPage";
import FaqPage from "./pages/FaqPage";
import ContactPage from "./pages/ContactPage";
import FeaturesPage from "./pages/FeaturesPage";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminModules from "./pages/admin/AdminModules";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminBundles from "./pages/admin/AdminBundles";
import AdminUpsells from "./pages/admin/AdminUpsells";
import AdminTiers from "./pages/admin/AdminTiers";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminInstructors from "./pages/admin/AdminInstructors";
import AdminSocialLinks from "./pages/admin/AdminSocialLinks";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="modules" element={<AdminModules />} />
              <Route path="lessons" element={<AdminLessons />} />
              <Route path="bundles" element={<AdminBundles />} />
              <Route path="upsells" element={<AdminUpsells />} />
              <Route path="tiers" element={<AdminTiers />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="instructors" element={<AdminInstructors />} />
              <Route path="social-links" element={<AdminSocialLinks />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
