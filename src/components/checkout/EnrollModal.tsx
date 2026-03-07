import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Tag,
  X,
  BookOpen,
  CreditCard,
  CheckCircle,
  Lock,
} from "lucide-react";

interface EnrollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    thumbnail_url: string | null;
  };
  lessonTitle?: string;
}

export function EnrollModal({
  open,
  onOpenChange,
  course,
  lessonTitle,
}: EnrollModalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_percent: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const discountedPrice = appliedCoupon
    ? Math.round(course.price * (1 - appliedCoupon.discount_percent / 100) * 100) / 100
    : course.price;

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
        return;
      }
      if (!data.is_active) {
        setCouponError("This coupon is no longer active.");
        return;
      }
      if (data.max_uses && data.current_uses >= data.max_uses) {
        setCouponError("This coupon has reached its usage limit.");
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setCouponError("This coupon has expired.");
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

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to purchase this course.");
        onOpenChange(false);
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "create-paypal-order",
        {
          body: {
            courseId: course.id,
            couponCode: appliedCoupon?.code || null,
            bumpOfferIds: [],
            returnUrl: `${window.location.origin}/payment-success`,
            cancelUrl: `${window.location.origin}/course/${course.id}`,
          },
        }
      );

      if (error) throw error;

      if (data?.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("No approval URL received");
      }
    } catch (err: any) {
      console.error("Enrollment error:", err);
      toast.error(err.message || "Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Course header */}
        <div className="relative">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <DialogTitle className="text-lg font-bold text-foreground">
              {course.title}
            </DialogTitle>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-4">
          <DialogDescription className="sr-only">
            Enroll in {course.title}
          </DialogDescription>

          {/* Locked lesson hint */}
          {lessonTitle && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <Lock className="h-4 w-4 shrink-0" />
              <span>
                Unlock <span className="font-medium text-foreground">{lessonTitle}</span> and all course content
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            {appliedCoupon ? (
              <>
                <span className="text-3xl font-bold text-foreground">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  ${course.price}
                </span>
                <Badge variant="secondary" className="text-xs">
                  -{appliedCoupon.discount_percent}%
                </Badge>
              </>
            ) : (
              <span className="text-3xl font-bold text-foreground">
                ${course.price}
              </span>
            )}
          </div>

          {/* Coupon */}
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {appliedCoupon.code} — {appliedCoupon.discount_percent}% off
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={removeCoupon}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
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
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                >
                  {couponLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
              {couponError && (
                <p className="text-xs text-destructive">{couponError}</p>
              )}
            </div>
          )}

          {/* Benefits */}
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              Full lifetime access
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              Access on mobile and desktop
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              Certificate of completion
            </li>
          </ul>

          {/* Enroll button */}
          <Button
            onClick={handleEnroll}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Enroll Now — ${discountedPrice.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
