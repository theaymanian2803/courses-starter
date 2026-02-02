import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, Lock, Unlock } from "lucide-react";

const modules = [
  {
    id: "1",
    title: "Setup & Configuration",
    duration: "2h 30m",
    lessons: [
      { title: "Development Environment Setup", duration: "15:00", isFree: true },
      { title: "VS Code Extensions & Productivity", duration: "12:00", isFree: true },
      { title: "Git & Version Control Mastery", duration: "25:00", isFree: false },
      { title: "Project Structure Best Practices", duration: "20:00", isFree: false },
    ],
  },
  {
    id: "2",
    title: "React Fundamentals",
    duration: "5h 45m",
    lessons: [
      { title: "Modern React with Hooks", duration: "35:00", isFree: true },
      { title: "Component Architecture", duration: "28:00", isFree: false },
      { title: "State Management Patterns", duration: "42:00", isFree: false },
      { title: "Custom Hooks Deep Dive", duration: "38:00", isFree: false },
      { title: "Performance Optimization", duration: "45:00", isFree: false },
    ],
  },
  {
    id: "3",
    title: "Redux Toolkit State Management",
    duration: "4h 20m",
    lessons: [
      { title: "Redux Toolkit Setup", duration: "22:00", isFree: false },
      { title: "Slices & Reducers", duration: "35:00", isFree: false },
      { title: "Async Thunks & RTK Query", duration: "48:00", isFree: false },
      { title: "Advanced Patterns", duration: "40:00", isFree: false },
    ],
  },
  {
    id: "4",
    title: "Backend with Node & Express",
    duration: "6h 15m",
    lessons: [
      { title: "Node.js Fundamentals", duration: "30:00", isFree: false },
      { title: "Express Server Setup", duration: "25:00", isFree: false },
      { title: "RESTful API Design", duration: "45:00", isFree: false },
      { title: "Middleware & Error Handling", duration: "38:00", isFree: false },
      { title: "Route Organization", duration: "28:00", isFree: false },
    ],
  },
  {
    id: "5",
    title: "MongoDB & Mongoose",
    duration: "5h 00m",
    lessons: [
      { title: "MongoDB Setup & Atlas", duration: "20:00", isFree: false },
      { title: "Mongoose Schemas & Models", duration: "35:00", isFree: false },
      { title: "CRUD Operations", duration: "40:00", isFree: false },
      { title: "Advanced Queries & Aggregation", duration: "50:00", isFree: false },
    ],
  },
  {
    id: "6",
    title: "File Handling with Multer",
    duration: "3h 30m",
    lessons: [
      { title: "File Upload Setup", duration: "25:00", isFree: false },
      { title: "Image Processing & Validation", duration: "35:00", isFree: false },
      { title: "Cloud Storage Integration", duration: "45:00", isFree: false },
    ],
  },
  {
    id: "7",
    title: "Security with Bcrypt & Cookies",
    duration: "4h 45m",
    lessons: [
      { title: "Password Hashing with Bcrypt", duration: "28:00", isFree: false },
      { title: "JWT Authentication", duration: "45:00", isFree: false },
      { title: "Secure Cookie Sessions", duration: "38:00", isFree: false },
      { title: "Security Best Practices", duration: "50:00", isFree: false },
    ],
  },
  {
    id: "8",
    title: "Deployment & Production",
    duration: "3h 00m",
    lessons: [
      { title: "Environment Configuration", duration: "20:00", isFree: false },
      { title: "Docker Containerization", duration: "40:00", isFree: false },
      { title: "Cloud Deployment (AWS/Vercel)", duration: "45:00", isFree: false },
      { title: "CI/CD Pipeline Setup", duration: "35:00", isFree: false },
    ],
  },
];

export const Curriculum = () => {
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  
  return (
    <section id="curriculum" className="py-24 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            {totalLessons} Lessons
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Complete <span className="text-primary">Curriculum</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A structured learning path from zero to fullstack developer. 
            Each module builds upon the previous, ensuring deep understanding.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: moduleIndex * 0.1 }}
              >
                <AccordionItem
                  value={module.id}
                  className="glass-strong rounded-xl overflow-hidden border-0"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4 w-full">
                      <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {moduleIndex + 1}
                      </span>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-foreground">
                          {module.title}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {module.duration} · {module.lessons.length} lessons
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-2 pt-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lessonIndex}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                          <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="flex-1 text-sm text-foreground">
                            {lesson.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {lesson.duration}
                          </span>
                          {lesson.isFree ? (
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                              <Unlock className="h-3 w-3 mr-1" />
                              Free
                            </Badge>
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
