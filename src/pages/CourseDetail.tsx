import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Loader2, Tag } from "lucide-react";
import { OrderBump } from "@/components/checkout/OrderBump";
import { EnrollModal } from "@/components/checkout/EnrollModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  PlayCircle,
  Lock,
  CheckCircle,
  CheckCircle2,
  ArrowLeft,
  Users,
} from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail_url: string | null;
};

type Module = {
  id: string;
  title: string;
  order_index: number;
  course_id: string;
};

type Lesson = {
  id: string;
  title: string;
  duration: string | null;
  is_free_preview: boolean;
  order_index: number;
  module_id: string;
  youtube_video_id: string;
};

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [activePreviewLessonId, setActivePreviewLessonId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [clickedLessonTitle, setClickedLessonTitle] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
    };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Check if user has purchased this course
  const { data: hasPurchased } = useQuery({
    queryKey: ["coursePurchase", courseId, userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", userId!)
        .eq("course_id", courseId!)
        .maybeSingle();
      return !!data;
    },
    enabled: !!userId && !!courseId,
  });

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .maybeSingle();
      if (error) throw error;
      return data as Course | null;
    },
    enabled: !!courseId,
  });

  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ["courseModules", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!courseId,
  });

  const { data: lessons } = useQuery({
    queryKey: ["courseLessons", courseId],
    queryFn: async () => {
      if (!modules || modules.length === 0) return [];
      const moduleIds = modules.map((m) => m.id);
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!modules && modules.length > 0,
  });

  // Fetch lesson progress for enrolled users
  const { data: lessonProgress } = useQuery({
    queryKey: ["lessonProgress", courseId, userId],
    queryFn: async () => {
      if (!lessons || lessons.length === 0) return [];
      const lessonIds = lessons.map((l) => l.id);
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", userId!)
        .in("lesson_id", lessonIds);
      return data || [];
    },
    enabled: !!userId && !!hasPurchased && !!lessons && lessons.length > 0,
  });

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress?.some((p) => p.lesson_id === lessonId && p.completed) ?? false;
  };

  const completedCount = lessonProgress?.filter((p) => p.completed).length ?? 0;

  const getLessonsForModule = (moduleId: string) => {
    return lessons?.filter((l) => l.module_id === moduleId) || [];
  };

  const totalLessons = lessons?.length || 0;
  const totalDuration = lessons?.reduce((acc, lesson) => {
    if (lesson.duration) {
      const parts = lesson.duration.split(":");
      if (parts.length === 2) {
        return acc + parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    }
    return acc;
  }, 0) || 0;

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("code, discount_percent, is_active, max_uses, current_uses, expires_at")
        .eq("code", couponCode.toUpperCase().trim())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setCouponError("Invalid coupon code.");
        setAppliedCoupon(null);
        return;
      }
      if (!data.is_active) {
        setCouponError("This coupon is no longer active.");
        setAppliedCoupon(null);
        return;
      }
      if (data.max_uses && data.current_uses >= data.max_uses) {
        setCouponError("This coupon has reached its usage limit.");
        setAppliedCoupon(null);
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setCouponError("This coupon has expired.");
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({ code: data.code, discount_percent: data.discount_percent });
      setCouponError("");
      toast.success(`Coupon applied! ${data.discount_percent}% off`);
    } catch {
      setCouponError("Failed to validate coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const discountedPrice = appliedCoupon && course
    ? course.price * (1 - appliedCoupon.discount_percent / 100)
    : null;

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [bumpTotal, setBumpTotal] = useState(0);

  const handleToggleBump = (offerId: string, price: number) => {
    setSelectedBumps(prev => {
      if (prev.includes(offerId)) {
        setBumpTotal(bt => bt - price);
        return prev.filter(id => id !== offerId);
      } else {
        setBumpTotal(bt => bt + price);
        return [...prev, offerId];
      }
    });
  };

  const finalPrice = (discountedPrice ?? course?.price ?? 0) + bumpTotal;

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to purchase this course.");
        navigate("/auth");
        return;
      }

      // Call the create-paypal-order edge function
      const { data, error } = await supabase.functions.invoke("create-paypal-order", {
        body: {
          courseId,
          couponCode: appliedCoupon?.code || null,
          bumpOfferIds: selectedBumps.length > 0 ? selectedBumps : [],
          returnUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/course/${courseId}`,
        },
      });

      if (error) throw error;

      if (data?.approvalUrl) {
        // Redirect to PayPal checkout
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("No approval URL received");
      }
    } catch (err: any) {
      console.error("Enrollment error:", err);
      toast.error(err.message || "Failed to start checkout. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (courseLoading || modulesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div>
              <Skeleton className="h-80 w-full rounded-lg" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Course Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {course.description || "Master this course and advance your skills."}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{modules?.length || 0} modules</span>
                </div>
                <div className="flex items-center gap-1">
                  <PlayCircle className="h-4 w-4" />
                  <span>{totalLessons} lessons</span>
                </div>
                {totalDuration > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTotalDuration(totalDuration)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>All levels</span>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:row-start-1">
              <Card className="sticky top-4 overflow-hidden">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary/50" />
                  </div>
                )}
                <CardContent className="p-6">
                  {hasPurchased ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span className="text-lg font-semibold text-foreground">Enrolled</span>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                          <span>Progress</span>
                          <span className="font-medium text-foreground">{completedCount}/{totalLessons}</span>
                        </div>
                        <Progress value={totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0} className="h-2" />
                      </div>
                      <Button onClick={() => navigate("/dashboard")} className="w-full mb-4" size="lg">
                        Continue Learning
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mb-2">
                        {appliedCoupon ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">
                              ${discountedPrice?.toFixed(2)}
                            </span>
                            <span className="text-lg text-muted-foreground line-through">
                              ${course.price}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              -{appliedCoupon.discount_percent}%
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-3xl font-bold text-foreground">
                            ${course.price}
                          </div>
                        )}
                      </div>

                      {/* Coupon Input */}
                      <div className="mb-4 space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Coupon code"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value);
                                setCouponError("");
                              }}
                              className="pl-9"
                              disabled={!!appliedCoupon}
                            />
                          </div>
                          {appliedCoupon ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAppliedCoupon(null);
                                setCouponCode("");
                              }}
                            >
                              Remove
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleApplyCoupon}
                              disabled={couponLoading || !couponCode.trim()}
                            >
                              {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                            </Button>
                          )}
                        </div>
                        {couponError && (
                          <p className="text-xs text-destructive">{couponError}</p>
                        )}
                      </div>

                      {/* Order Bump */}
                      <OrderBump
                        selectedOfferIds={selectedBumps}
                        onToggle={handleToggleBump}
                      />

                      {/* Total */}
                      {bumpTotal > 0 && (
                        <div className="text-center text-sm text-muted-foreground border-t border-border pt-3">
                          Total: <span className="text-foreground font-bold">${finalPrice.toFixed(2)}</span>
                        </div>
                      )}

                      <Button onClick={handleEnroll} className="w-full mb-4" size="lg" disabled={isEnrolling}>
                        {isEnrolling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Enroll Now — $${finalPrice.toFixed(2)}`
                        )}
                      </Button>
                    </>
                  )}
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Full lifetime access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Access on mobile and desktop
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Certificate of completion
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Course Content
        </h2>

        {modules && modules.length > 0 ? (
          <Accordion type="multiple" className="space-y-4">
            {modules.map((module, index) => {
              const moduleLessons = getLessonsForModule(module.id);
              return (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {module.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {hasPurchased
                            ? `${moduleLessons.filter((l) => isLessonCompleted(l.id)).length}/${moduleLessons.length} completed`
                            : `${moduleLessons.length} lesson${moduleLessons.length !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <ul className="space-y-2 ml-12">
                      {moduleLessons.map((lesson) => (
                        <li key={lesson.id} className="space-y-2">
                          <div
                            className={`flex items-center justify-between py-2 px-3 rounded-md transition-colors ${
                              lesson.is_free_preview || hasPurchased
                                ? "cursor-pointer hover:bg-primary/10"
                                : "cursor-pointer hover:bg-muted/50"
                            }`}
                            onClick={() => {
                              if (lesson.is_free_preview) {
                                setActivePreviewLessonId(
                                  activePreviewLessonId === lesson.id ? null : lesson.id
                                );
                              } else if (!hasPurchased) {
                                setClickedLessonTitle(lesson.title);
                                setEnrollModalOpen(true);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {hasPurchased && isLessonCompleted(lesson.id) ? (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              ) : (
                                <PlayCircle className={`h-4 w-4 ${lesson.is_free_preview ? "text-primary" : "text-muted-foreground"}`} />
                              )}
                              <span className="text-foreground">{lesson.title}</span>
                              {lesson.is_free_preview && (
                                <Badge variant="secondary" className="text-xs cursor-pointer">
                                  Free Preview
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              {lesson.duration && <span>{lesson.duration}</span>}
                              {!lesson.is_free_preview && (
                                <Lock className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                          {lesson.is_free_preview && activePreviewLessonId === lesson.id && (
                            <div className="ml-0 mb-2">
                              <VideoPlayer
                                youtubeVideoId={lesson.youtube_video_id}
                                title={lesson.title}
                              />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Course content is being prepared. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <Footer />

      {/* Enroll Modal for locked lessons */}
      {course && (
        <EnrollModal
          open={enrollModalOpen}
          onOpenChange={setEnrollModalOpen}
          course={course}
          lessonTitle={clickedLessonTitle}
        />
      )}
    </div>
  );
}
