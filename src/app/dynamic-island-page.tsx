"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, User, Wrench, MessageSquare, Code2, Palette, 
  Layers, ArrowRight, Sparkles, Zap, Globe, Cpu 
} from "lucide-react"
import DynamicIslandLayout from "./dynamic-island-layout"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function DynamicIslandPage() {
  return (
    <DynamicIslandLayout>
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 space-y-24">
          {/* Hero Section */}
          <motion.section 
            id="home"
            className="min-h-screen flex items-center justify-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="space-y-8 max-w-4xl">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
              >
                <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-full" />
                <h1 className="relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Chris Loidolt
                </h1>
              </motion.div>
              
              <motion.p 
                {...fadeInUp}
                className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto"
              >
                Design Engineer crafting exceptional digital experiences with cutting-edge technology
              </motion.p>
              
              <motion.div 
                {...fadeInUp}
                className="flex flex-wrap gap-4 justify-center pt-8"
              >
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 group">
                  View Projects
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                  <MessageSquare className="mr-2 w-4 h-4" />
                  Contact Me
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="flex justify-center gap-8 pt-12"
              >
                {[
                  { icon: Zap, label: "Fast" },
                  { icon: Sparkles, label: "Modern" },
                  { icon: Globe, label: "Global" },
                  { icon: Cpu, label: "Smart" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <item.icon className="w-6 h-6 text-gray-500" />
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Projects Section */}
          <motion.section 
            id="projects"
            className="space-y-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Featured Projects</h2>
              <p className="text-gray-400 text-lg">Innovative solutions that push boundaries</p>
            </motion.div>

            <motion.div 
              variants={staggerChildren}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                {
                  title: "3D Model Viewer",
                  description: "Interactive WebGL experience with Three.js",
                  tech: ["Three.js", "React", "WebGL"],
                  status: "Completed",
                  gradient: "from-blue-600 to-cyan-600"
                },
                {
                  title: "E-commerce Platform",
                  description: "Modern shopping experience with real-time updates",
                  tech: ["Next.js", "Stripe", "Prisma"],
                  status: "Completed",
                  gradient: "from-purple-600 to-pink-600"
                },
                {
                  title: "Design System",
                  description: "Comprehensive component library and guidelines",
                  tech: ["TypeScript", "Storybook", "CSS"],
                  status: "In Progress",
                  gradient: "from-orange-600 to-red-600"
                },
              ].map((project, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all hover:shadow-2xl hover:shadow-black/50 group cursor-pointer">
                    <div className={`h-2 bg-gradient-to-r ${project.gradient} rounded-t-lg opacity-75 group-hover:opacity-100 transition-opacity`} />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <Badge variant={project.status === "Completed" ? "default" : "secondary"} className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-400">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech) => (
                          <Badge key={tech} variant="outline" className="border-gray-700 text-gray-300">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* About Section */}
          <motion.section 
            id="about"
            className="py-24"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp} className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">About Me</h2>
              <div className="space-y-6 text-lg text-gray-300">
                <p>
                  A passionate design engineer who bridges the gap between aesthetic vision and technical implementation. 
                  With over a decade of experience, I specialize in creating digital experiences that are not just 
                  beautiful, but also performant and accessible.
                </p>
                <p>
                  I believe in the power of thoughtful design combined with robust engineering to solve complex problems 
                  and create meaningful user experiences.
                </p>
              </div>
            </motion.div>
          </motion.section>

          {/* Skills Section */}
          <motion.section 
            id="skills"
            className="space-y-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp} className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Skills & Expertise</h2>
              <p className="text-gray-400 text-lg">Technologies I work with daily</p>
            </motion.div>

            <motion.div 
              variants={staggerChildren}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                {
                  icon: Code2,
                  title: "Frontend",
                  skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
                  color: "text-blue-400"
                },
                {
                  icon: Cpu,
                  title: "Backend",
                  skills: ["Node.js", "Python", "PostgreSQL", "Redis"],
                  color: "text-green-400"
                },
                {
                  icon: Palette,
                  title: "Design",
                  skills: ["Figma", "Framer", "Adobe Suite", "3D Modeling"],
                  color: "text-purple-400"
                },
                {
                  icon: Layers,
                  title: "Tools",
                  skills: ["Git", "Docker", "AWS", "Vercel"],
                  color: "text-orange-400"
                },
              ].map((category, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="bg-gray-900/50 border-gray-800 h-full">
                    <CardHeader className="text-center">
                      <category.icon className={`w-12 h-12 mx-auto mb-4 ${category.color}`} />
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {category.skills.map((skill) => (
                          <div key={skill} className="text-sm text-gray-400 text-center">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Contact Section */}
          <motion.section 
            id="contact"
            className="py-24 text-center space-y-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Let's Build Something Amazing</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Ready to turn your vision into reality? I'm always excited to work on new projects and challenges.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="flex gap-4 justify-center">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                Get In Touch
                <MessageSquare className="ml-2 w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                Download Resume
              </Button>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="flex justify-center pt-12"
            >
              <Card className="inline-flex items-center gap-6 px-8 py-4 bg-gray-900/50 border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-300">Currently available for freelance work</span>
                </div>
              </Card>
            </motion.div>
          </motion.section>
        </div>
      </main>
    </DynamicIslandLayout>
  )
}