import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VideoPlayer } from "@/components/VideoPlayer";
import {
  Code2,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  CheckCircle2,
  Lock,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  youtube_video_id: string;
  duration: string | null;
  is_free_preview: boolean;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

// Demo data for when database is empty
const demoModules: Module[] = [
  {
    id: "1",
    title: "Setup & Configuration",
    order_index: 1,
    lessons: [
      { id: "1-1", title: "Development Environment Setup", youtube_video_id: "dQw4w9WgXcQ", duration: "15:00", is_free_preview: true, order_index: 1 },
      { id: "1-2", title: "VS Code Extensions & Productivity", youtube_video_id: "dQw4w9WgXcQ", duration: "12:00", is_free_preview: true, order_index: 2 },
      { id: "1-3", title: "Git & Version Control", youtube_video_id: "dQw4w9WgXcQ", duration: "25:00", is_free_preview: false, order_index: 3 },
    ],
  },
  {
    id: "2",
    title: "React Fundamentals",
    order_index: 2,
    lessons: [
      { id: "2-1", title: "Modern React with Hooks", youtube_video_id: "dQw4w9WgXcQ", duration: "35:00", is_free_preview: true, order_index: 1 },
      { id: "2-2", title: "Component Architecture", youtube_video_id: "dQw4w9WgXcQ", duration: "28:00", is_free_preview: false, order_index: 2 },
      { id: "2-3", title: "State Management Patterns", youtube_video_id: "dQw4w9WgXcQ", duration: "42:00", is_free_preview: false, order_index: 3 },
    ],
  },
  {
    id: "3",
    title: "Redux Toolkit State Management",
    order_index: 3,
    lessons: [
      { id: "3-1", title: "Redux Toolkit Setup", youtube_video_id: "dQw4w9WgXcQ", duration: "22:00", is_free_preview: false, order_index: 1 },
      { id: "3-2", title: "Slices & Reducers", youtube_video_id: "dQw4w9WgXcQ", duration: "35:00", is_free_preview: false, order_index: 2 },
    ],
  },
  {
    id: "4",
    title: "Backend with Node & Express",
    order_index: 4,
    lessons: [
      { id: "4-1", title: "Node.js Fundamentals", youtube_video_id: "dQw4w9WgXcQ", duration: "30:00", is_free_preview: false, order_index: 1 },
      { id: "4-2", title: "Express Server Setup", youtube_video_id: "dQw4w9WgXcQ", duration: "25:00", is_free_preview: false, order_index: 2 },
    ],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [hasPurchased, setHasPurchased] = useState(false);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth and fetch data
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check purchase status
      const { data: purchases } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", session.user.id);

      setHasPurchased((purchases && purchases.length > 0) || false);

      // Fetch modules and lessons
      const { data: modulesData } = await supabase
        .from("modules")
        .select(`
          id,
          title,
          order_index,
          lessons (
            id,
            title,
            youtube_video_id,
            duration,
            is_free_preview,
            order_index
          )
        `)
        .order("order_index");

      if (modulesData && modulesData.length > 0) {
        const formattedModules = modulesData.map((m: any) => ({
          ...m,
          lessons: m.lessons?.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index) || [],
        }));
        setModules(formattedModules);
        
        // Select first lesson
        if (formattedModules[0]?.lessons[0]) {
          setSelectedLesson(formattedModules[0].lessons[0]);
          setExpandedModules(new Set([formattedModules[0].id]));
        }
      } else {
        // Use demo data
        setModules(demoModules);
        setSelectedLesson(demoModules[0].lessons[0]);
        setExpandedModules(new Set([demoModules[0].id]));
      }

      // Fetch progress
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", session.user.id);

      if (progressData) {
        setProgress(progressData);
      }

      setIsLoading(false);
    };

    init();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.some((p) => p.lesson_id === lessonId && p.completed);
  };

  const canAccessLesson = (lesson: Lesson) => {
    return hasPurchased || lesson.is_free_preview;
  };

  const markAsComplete = async (lessonId: string) => {
    if (!user) return;

    const { error } = await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    if (!error) {
      setProgress((prev) => [...prev.filter((p) => p.lesson_id !== lessonId), { lesson_id: lessonId, completed: true }]);
      toast.success("Lesson marked as complete!");
    }
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = progress.filter((p) => p.completed).length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-40 h-screen transition-all duration-300 flex flex-col",
          "bg-sidebar border-r border-sidebar-border",
          isSidebarOpen ? "w-80" : "w-0 md:w-16",
          "overflow-hidden"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 transition-opacity",
              !isSidebarOpen && "md:opacity-0"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Code2 className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-sidebar-foreground whitespace-nowrap">
              Unc Code
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            {isSidebarOpen ? (
              <X className="h-4 w-4 text-sidebar-foreground" />
            ) : (
              <Menu className="h-4 w-4 text-sidebar-foreground" />
            )}
          </button>
        </div>

        {/* Progress */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-sidebar-foreground">Progress</span>
              <span className="text-sm font-medium text-primary">
                {completedLessons}/{totalLessons}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Modules List */}
        <nav className="flex-1 overflow-y-auto p-2">
          {modules.map((module) => (
            <div key={module.id} className="mb-2">
              <button
                onClick={() => toggleModule(module.id)}
                className={cn(
                  "w-full flex items-center gap-2 p-3 rounded-lg transition-colors",
                  "hover:bg-sidebar-accent text-sidebar-foreground"
                )}
              >
                {expandedModules.has(module.id) ? (
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                )}
                {isSidebarOpen && (
                  <span className="text-sm font-medium text-left truncate">
                    {module.title}
                  </span>
                )}
              </button>

              {/* Lessons */}
              {isSidebarOpen && expandedModules.has(module.id) && (
                <div className="ml-4 mt-1 space-y-1">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => canAccessLesson(lesson) && setSelectedLesson(lesson)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                        selectedLesson?.id === lesson.id
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "hover:bg-sidebar-accent text-sidebar-foreground",
                        !canAccessLesson(lesson) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isLessonCompleted(lesson.id) ? (
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                      ) : canAccessLesson(lesson) ? (
                        <PlayCircle className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <Lock className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span className="text-sm truncate">{lesson.title}</span>
                      {lesson.is_free_preview && !hasPurchased && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Free
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium">
                  {user?.email?.[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasPurchased ? "Full Access" : "Free Preview"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to="/">
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile sidebar toggle */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-4 left-4 z-50 md:hidden p-3 bg-primary text-primary-foreground rounded-full shadow-lg box-glow"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          {selectedLesson ? (
            <motion.div
              key={selectedLesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Video Player */}
              <VideoPlayer
                youtubeVideoId={selectedLesson.youtube_video_id}
                title={selectedLesson.title}
                isLocked={!canAccessLesson(selectedLesson)}
              />

              {/* Lesson Info */}
              <div className="mt-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      {selectedLesson.title}
                    </h1>
                    {selectedLesson.duration && (
                      <p className="text-muted-foreground">
                        Duration: {selectedLesson.duration}
                      </p>
                    )}
                  </div>

                  {canAccessLesson(selectedLesson) && (
                    <Button
                      onClick={() => markAsComplete(selectedLesson.id)}
                      variant={isLessonCompleted(selectedLesson.id) ? "secondary" : "default"}
                      className={isLessonCompleted(selectedLesson.id) ? "" : "box-glow"}
                    >
                      {isLessonCompleted(selectedLesson.id) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {!hasPurchased && !selectedLesson.is_free_preview && (
                  <div className="mt-6 p-6 rounded-xl glass-strong border border-primary/20">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Unlock Full Course Access
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Get lifetime access to all lessons, source code, and future updates.
                    </p>
                    <Button asChild className="box-glow">
                      <Link to="/#pricing">View Pricing</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">Select a lesson to begin</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
