import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface OrderWithCourse {
  id: string;
  purchased_at: string;
  course_id: string;
  courses: {
    id: string;
    title: string;
    price: number;
    thumbnail_url: string | null;
  };
}

export function MyOrders({ userId }: { userId: string }) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["userOrders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("id, purchased_at, course_id, courses(id, title, price, thumbnail_url)")
        .eq("user_id", userId)
        .order("purchased_at", { ascending: false });
      if (error) throw error;
      return data as unknown as OrderWithCourse[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
        <p className="text-muted-foreground mb-6">Browse our courses and start learning today.</p>
        <Button asChild>
          <Link to="/courses">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="border-border bg-card hover:border-primary/30 transition-colors">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
              {order.courses?.thumbnail_url ? (
                <img
                  src={order.courses.thumbnail_url}
                  alt={order.courses.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{order.courses?.title || "Course"}</h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(order.purchased_at), "MMM d, yyyy")}
                </span>
                <Badge variant="secondary" className="text-xs">
                  ${order.courses?.price?.toFixed(2) || "0.00"}
                </Badge>
              </div>
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
            <Button asChild variant="ghost" size="icon">
              <Link to="/dashboard">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
