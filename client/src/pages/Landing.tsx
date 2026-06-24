import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Map, Bot, Compass, Briefcase } from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { motion } from "framer-motion";

export default function Landing() {
  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI Trip Planning",
      description: "Our intelligent agents analyze thousands of data points to craft the perfect itinerary tailored to your preferences."
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Live Route Maps",
      description: "Visualize your journey in real-time with interactive maps that update as you modify your plans."
    },
    {
      icon: <Compass className="w-6 h-6" />,
      title: "Smart Recommendations",
      description: "Discover hidden gems and local favorites that match your unique travel style and interests."
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Agency Package Builder",
      description: "Powerful tools for travel agencies to build, manage, and optimize custom travel packages for clients."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent opacity-50"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              The Future of Travel Planning
            </span>
            <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight mb-6">
              Plan smarter. Travel better. <br />
              <span className="text-gradient">Powered by Agentic AI.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              TravEase AI is a multi-agent travel platform connecting independent travelers and professional agencies with intelligent automation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/traveler/login">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                  Explore as Traveler
                </Button>
              </Link>
              <Link href="/agency/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-white hover:bg-secondary/50 border-2">
                  Explore as Agency
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose TravEase AI?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Whether you're planning a weekend getaway or managing complex agency operations, our AI agents handle the heavy lifting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 aspect-video lg:aspect-[21/9]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 flex items-end p-8 md:p-12">
              <div className="text-white max-w-xl">
                <h3 className="text-3xl font-bold mb-2">Experience the world differently</h3>
                <p className="text-white/80">From hidden beaches to bustling city centers, let AI guide your next adventure.</p>
              </div>
            </div>
            {/* Unsplash image: Scenic travel landscape, mountains or beach */}
            <img
              src="/travel-adventure.png"
              alt="Travel Adventure"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
