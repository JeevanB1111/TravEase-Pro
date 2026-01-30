import { useState } from "react";
import { 
  MessageSquare, 
  Map as MapIcon, 
  User, 
  Settings, 
  Send, 
  Plus,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";

export default function TravelerDashboard() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! I'm your AI travel assistant. Where would you like to go next?" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: inputValue }]);
    const userInput = inputValue;
    setInputValue("");
    
    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "That sounds amazing! I can help you plan that.";
      if (userInput.toLowerCase().includes("paris")) {
        aiResponse = "Paris is wonderful this time of year. I recommend visiting the Marais district for a local vibe. Shall I draft a 3-day itinerary?";
      } else if (userInput.toLowerCase().includes("tokyo")) {
        aiResponse = "Tokyo is fantastic! From Shibuya Crossing to quiet temples in Asakusa. Are you interested in food, culture, or shopping?";
      }
      setMessages(prev => [...prev, { role: "ai", content: aiResponse }]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-white/50 backdrop-blur-sm hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg">TravEase AI</span>
          </Link>
          
          <Button className="w-full justify-start gap-2 mb-6" size="lg">
            <Plus className="w-4 h-4" /> New Trip
          </Button>

          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3 text-primary bg-primary/5 font-medium">
              <MessageSquare className="w-4 h-4" /> Chat Planner
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
              <MapIcon className="w-4 h-4" /> My Trips
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
              <Compass className="w-4 h-4" /> Explore
            </Button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 border border-border">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">John Doe</span>
              <span className="text-xs text-muted-foreground">Traveler Plan</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* Chat Interface (Left Half on Desktop) */}
        <div className="flex-1 flex flex-col h-full border-r border-border/50 bg-white">
          <div className="p-4 border-b border-border/50 flex items-center justify-between md:hidden">
            <span className="font-display font-bold">TravEase AI</span>
            <Button variant="ghost" size="sm">Menu</Button>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6 max-w-2xl mx-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-sm' 
                      : 'bg-secondary/50 text-foreground border border-border/50 rounded-bl-sm'}
                  `}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border/50 bg-white/80 backdrop-blur">
            <div className="max-w-2xl mx-auto relative">
              <Input 
                placeholder="Ask to plan a trip to Paris..." 
                className="pr-12 py-6 rounded-full border-border/50 bg-secondary/20 focus-visible:ring-primary/20"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button 
                size="icon" 
                className="absolute right-1 top-1 rounded-full h-10 w-10 shadow-sm"
                onClick={handleSend}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-3">
              AI can make mistakes. Please verify important travel details.
            </p>
          </div>
        </div>

        {/* Map / Visualization (Right Half on Desktop) */}
        <div className="hidden lg:flex flex-1 bg-secondary/10 relative items-center justify-center p-8">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
          
          <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-xl text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <MapIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Interactive Map</h3>
            <p className="text-muted-foreground mb-6">
              Start chatting with the AI planner to see your route visualize here in real-time.
            </p>
            <Button variant="outline" className="w-full">
              Open Full Map
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
