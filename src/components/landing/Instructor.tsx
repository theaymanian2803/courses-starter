import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Code2, Briefcase, GraduationCap, Star } from "lucide-react";

export const Instructor = () => {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Your Instructor
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Learn From an <span className="text-primary">Expert</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-strong rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center box-glow-sm">
                  <Code2 className="w-16 h-16 md:w-20 md:h-20 text-primary" />
                </div>
              </div>

              {/* Bio */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Unc Code
                </h3>
                <p className="text-primary font-medium mb-4">
                  Senior Fullstack Developer & Educator
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  With over 10 years of experience in web development and 5+ years of teaching, 
                  I've helped thousands of students transition into successful tech careers. 
                  I've worked with Fortune 500 companies and startups alike, bringing real-world 
                  experience directly to my courses. My teaching philosophy focuses on 
                  practical, project-based learning that prepares you for actual development work.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Briefcase, value: "10+", label: "Years Experience" },
                    { icon: GraduationCap, value: "5,000+", label: "Students Taught" },
                    { icon: Code2, value: "50+", label: "Projects Built" },
                    { icon: Star, value: "4.9", label: "Avg. Rating" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-muted/50 rounded-xl p-4 text-center"
                    >
                      <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
