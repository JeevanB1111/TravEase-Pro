import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { User, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function RoleSelection() {
  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-secondary/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose your journey</h1>
          <p className="text-xl text-muted-foreground">Select how you want to use TravEase AI today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traveler Card */}
          <Link href="/traveler/login">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="cursor-pointer h-full"
            >
              <Card className="h-full p-8 md:p-10 border-2 border-transparent hover:border-primary/20 transition-all shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/5 group relative overflow-hidden bg-white/60 backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>

                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Traveler Dashboard</h2>
                <p className="text-muted-foreground mb-6">
                  Personalized AI trip planning, itinerary management, and discovery for your next adventure.
                </p>

                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Smart chat trip planner</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Interactive route maps</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Budget optimization</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </Link>

          {/* Agency Card */}
          <Link href="/agency/login">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="cursor-pointer h-full"
            >
              <Card className="h-full p-8 md:p-10 border-2 border-transparent hover:border-purple-500/20 transition-all shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-purple-500/5 group relative overflow-hidden bg-white/60 backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-purple-600" />
                </div>

                <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors">Agency Dashboard</h2>
                <p className="text-muted-foreground mb-6">
                  Professional tools for creating packages, managing clients, and analyzing travel trends.
                </p>

                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    <span>Package builder suite</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    <span>Client management CRM</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    <span>Analytics & Reporting</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
