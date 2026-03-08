import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Layers, PlayCircle, Users, DollarSign } from "lucide-react";
import HeroControls from "@/components/admin/HeroControls";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [courses, modules, lessons, purchases] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact" }),
        supabase.from("modules").select("id", { count: "exact" }),
        supabase.from("lessons").select("id", { count: "exact" }),
        supabase.from("purchases").select("id", { count: "exact" }),
      ]);

      return {
        coursesCount: courses.count || 0,
        modulesCount: modules.count || 0,
        lessonsCount: lessons.count || 0,
        purchasesCount: purchases.count || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Total Courses",
      value: stats?.coursesCount || 0,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Modules",
      value: stats?.modulesCount || 0,
      icon: Layers,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Lessons",
      value: stats?.lessonsCount || 0,
      icon: PlayCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Purchases",
      value: stats?.purchasesCount || 0,
      icon: DollarSign,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the admin panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <HeroControls />
    </div>
  );
}
