import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { BrainCircuit, Globe2, Share2 } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Header */}
        <section className="pt-32 pb-16 md:pt-48 md:pb-24 bg-secondary/30 relative overflow-hidden">
           {/* Abstract shapes */}
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
           <div className="absolute top-1/2 -left-24 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 sm:px-6 text-center">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
             >
                <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Redefining Travel with <br/><span className="text-gradient">Agentic AI</span></h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  We're building the first platform where intelligent agents collaborate to solve the complexity of modern travel planning.
                </p>
             </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="prose prose-lg md:prose-xl mx-auto text-muted-foreground">
              <p className="text-foreground font-medium text-2xl mb-8 leading-normal">
                Travel planning is broken. Dozens of tabs, disconnected bookings, and generic recommendations. TravEase AI changes that.
              </p>
              <p className="mb-6">
                Our platform uses a multi-agent architecture. Instead of a single chatbot, we deploy specialized agents—Pricing Experts, Itinerary Architects, and Local Guides—that work together to build your perfect trip.
              </p>
              <p>
                For agencies, this means automating 80% of routine tasks while retaining human control for the final touches. For travelers, it means personalized, complex itineraries generated in seconds, not hours.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white border-t border-border/40">
           <div className="container mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                       <BrainCircuit className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Intelligence First</h3>
                    <p className="text-muted-foreground">Our AI understands context, preference, and nuance better than simple filters.</p>
                 </div>
                 <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                       <Share2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Seamless Collaboration</h3>
                    <p className="text-muted-foreground">Bridging the gap between automated efficiency and human expertise.</p>
                 </div>
                 <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                       <Globe2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Global Scale</h3>
                    <p className="text-muted-foreground">Connecting data points from every corner of the globe in real-time.</p>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
