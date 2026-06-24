import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Plus,
  Search,
  Bell,
  Trash2,
  Mic,
  MicOff,
  MoreVertical,
  Mail,
  Phone,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import AddComboDialog from "@/components/AddComboDialog";
import { type TravelCombo } from "@shared/schema";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const bookingData = [
  { name: 'Jan', bookings: 40, revenue: 2400 },
  { name: 'Feb', bookings: 30, revenue: 1398 },
  { name: 'Mar', bookings: 20, revenue: 9800 },
  { name: 'Apr', bookings: 27, revenue: 3908 },
  { name: 'May', bookings: 18, revenue: 4800 },
  { name: 'Jun', bookings: 23, revenue: 3800 },
  { name: 'Jul', bookings: 34, revenue: 4300 },
];

const clientData = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "+1 555-0123", status: "Active", trips: 3 },
  { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "+1 555-0124", status: "Pending", trips: 1 },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", phone: "+1 555-0125", status: "Active", trips: 5 },
  { id: 4, name: "Diana Prince", email: "diana@example.com", phone: "+1 555-0126", status: "Inactive", trips: 0 },
];

export default function AgencyDashboard() {
  const [activeView, setActiveView] = useState<'dashboard' | 'packages' | 'clients' | 'analytics'>('dashboard');
  const [isAddComboOpen, setIsAddComboOpen] = useState(false);
  const [combos, setCombos] = useState<TravelCombo[]>([]);

  // Agent State
  const [agentInput, setAgentInput] = useState("");
  const [agentMessages, setAgentMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  // Currency State
  type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY';
  const [currency, setCurrency] = useState<Currency>('USD');

  const exchangeRates: Record<Currency, { rate: number, symbol: string, locale: string }> = {
    USD: { rate: 1, symbol: '$', locale: 'en-US' },
    EUR: { rate: 0.92, symbol: '€', locale: 'de-DE' },
    GBP: { rate: 0.79, symbol: '£', locale: 'en-GB' },
    INR: { rate: 83.5, symbol: '₹', locale: 'en-IN' },
    JPY: { rate: 150.5, symbol: '¥', locale: 'ja-JP' }
  };

  const formatPrice = (price: string | number) => {
    let numericPrice = typeof price === 'string'
      ? parseInt(price.replace(/[^0-9]/g, '') || '0')
      : price;

    // Convert
    const { rate, locale, symbol } = exchangeRates[currency];
    const converted = numericPrice * rate;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(converted);
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAgentInput(transcript);
        handleAgentSubmit(transcript); // Auto-submit
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        toast({ title: "Error", description: "Voice recognition failed. Please try again.", variant: "destructive" });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({ title: "Not Supported", description: "Voice recognition is not supported in this browser.", variant: "destructive" });
    }
  };

  const [editingCombo, setEditingCombo] = useState<TravelCombo | null>(null);

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const res = await fetch("/api/combos");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCombos(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load combos", variant: "destructive" });
    }
  };

  const handleCreateOrUpdateCombo = async (comboData: any) => {
    try {
      const url = editingCombo ? `/api/combos/${editingCombo.id}` : "/api/combos";
      const method = editingCombo ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comboData)
      });

      if (!res.ok) throw new Error("Failed to save combo");

      const savedCombo = await res.json();

      if (editingCombo) {
        setCombos(prev => prev.map(c => c.id === savedCombo.id ? savedCombo : c));
        toast({ title: "Success", description: "Combo updated successfully" });
      } else {
        setCombos(prev => [...prev, savedCombo]);
        toast({ title: "Success", description: "Combo created successfully" });
      }

      setEditingCombo(null);
      setIsAddComboOpen(false); // Close dialog after save
    } catch (error) {
      toast({ title: "Error", description: "Failed to save combo", variant: "destructive" });
    }
  };

  const openEditDialog = (combo: TravelCombo) => {
    setEditingCombo(combo);
    setIsAddComboOpen(true);
  };

  const handleDeleteCombo = async (id: number) => {
    if (!confirm("Are you sure you want to delete this combo?")) return;
    try {
      await fetch(`/api/combos/${id}`, { method: "DELETE" });
      toast({ title: "Success", description: "Combo deleted" });
      fetchCombos();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete combo", variant: "destructive" });
    }
  };

  const handleAgentSubmit = async (manualInput?: string) => {
    const userCmd = manualInput || agentInput;
    if (!userCmd.trim()) return;

    setAgentMessages(prev => [...prev, { role: 'user', content: userCmd }]);
    setAgentInput("");

    try {
      const res = await fetch("/api/agent/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: userCmd })
      });
      const data = await res.json();

      setAgentMessages(prev => [...prev, { role: 'ai', content: data.message }]);

      // Smart refresh based on server response
      if (data.actionPerformed === 'CREATE_COMBO' || data.actionPerformed === 'DELETE_COMBO' || data.actionPerformed === 'UPDATE_COMBO') {
        fetchCombos();
        toast({ title: "Update", description: "Dashboard updated based on agent action." });
      } else if (!data.actionPerformed && (userCmd.toLowerCase().includes("create") || userCmd.toLowerCase().includes("delete") || userCmd.toLowerCase().includes("update") || userCmd.toLowerCase().includes("edit") || userCmd.toLowerCase().includes("change") || userCmd.toLowerCase().includes("modify"))) {
        // Fallback refresh for older logic or if actionPerformed is missing
        fetchCombos();
      }
    } catch (err) {
      setAgentMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error accessing the server." }]);
    }
  };

  const handleAgentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show immediate feedback
    setAgentMessages(prev => [...prev, { role: 'user', content: `[Uploaded Image: ${file.name}]` }]);
    setAgentMessages(prev => [...prev, { role: 'ai', content: "Scanning document..." }]);

    // Convert to Base64 (simulated here since we just send a signal to backend for now, or send the actual base64 if needed)
    // For this prototype, we'll just trigger the backend "OCR" endpoint.

    try {
      const res = await fetch("/api/agent/upload-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }) // In a real app, send base64 or FormData
      });
      const data = await res.json();

      // Simulate delay for "Scanning" effect if backend didn't
      setTimeout(() => {
        setAgentMessages(prev => [...prev, { role: 'ai', content: data.message }]);
        if (data.success) {
          fetchCombos();
        }
      }, 1000);

    } catch (err) {
      setAgentMessages(prev => [...prev, { role: 'ai', content: "Error processing image." }]);
    }
  };

  const NavButton = ({ view, icon: Icon, label }: { view: 'dashboard' | 'packages' | 'clients' | 'analytics', icon: any, label: string }) => (
    <Button
      variant={activeView === view ? "secondary" : "ghost"}
      className={`w-full justify-start gap-3 font-medium ${activeView === view ? "text-purple-600 bg-purple-50" : "text-muted-foreground hover:text-foreground"}`}
      onClick={() => setActiveView(view)}
    >
      <Icon className="w-4 h-4" /> {label}
    </Button>
  );


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, comboId: number) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentCombo = combos.find(c => c.id === comboId);
    const specificImages = currentCombo?.images || [];

    if (specificImages.length + files.length > 10) {
      toast({ title: "Limit Exceeded", description: "You can only have up to 10 images per combo.", variant: "destructive" });
      return;
    }

    // Process all files
    const promises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        if (file.size > 50 * 1024 * 1024) {
          reject(new Error(`File ${file.name} is too large (>50MB)`));
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then(async (newImages) => {
        const updatedImages = [...specificImages, ...newImages];
        console.log(`[Upload] Uploading ${newImages.length} images for combo ${comboId}`);

        try {
          // Optimistic update
          setCombos(prev => prev.map(c => c.id === comboId ? { ...c, images: updatedImages } : c));

          // Persist
          const res = await fetch(`/api/combos/${comboId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: updatedImages })
          });

          if (!res.ok) throw new Error("Failed to save images");

          toast({ title: "Success", description: `${newImages.length} image(s) uploaded.` });
        } catch (error) {
          console.error("[Upload] Error:", error);
          toast({ title: "Error", description: "Failed to save images.", variant: "destructive" });
          // Revert optimistic update? (Complexity trade-off, skip for now)
        }
      })
      .catch(error => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AddComboDialog
        open={isAddComboOpen}
        onOpenChange={(open) => {
          setIsAddComboOpen(open);
          if (!open) setEditingCombo(null); // Clear edit state on close
        }}
        onConfirm={handleCreateOrUpdateCombo}
        initialData={editingCombo}
      />

      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-white hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="bg-purple-100 p-1.5 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-display font-bold text-lg text-purple-950">Agency Pro</span>
          </Link>

          <nav className="space-y-1">
            <NavButton view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavButton view="packages" icon={Package} label="Packages" />
            <NavButton view="clients" icon={Users} label="Clients" />
            <NavButton view="analytics" icon={BarChart3} label="Analytics" />
          </nav>

          <div className="mt-6 px-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Currency</label>
            <div className="grid grid-cols-5 gap-1">
              {(['USD', 'EUR', 'GBP', 'INR', 'JPY'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setCurrency(cur)}
                  className={`text-lg p-1 rounded hover:bg-secondary/50 transition-colors ${currency === cur ? 'bg-purple-100 ring-1 ring-purple-600' : 'opacity-50 hover:opacity-100'}`}
                  title={cur}
                >
                  {cur === 'USD' && '🇺🇸'}
                  {cur === 'EUR' && '🇪🇺'}
                  {cur === 'GBP' && '🇬🇧'}
                  {cur === 'INR' && '🇮🇳'}
                  {cur === 'JPY' && '🇯🇵'}
                </button>
              ))}
            </div>
            <div className="text-xs text-center mt-1 font-medium text-purple-700">
              {currency} - {exchangeRates[currency].symbol}
            </div>
          </div>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <h4 className="font-semibold text-purple-900 text-sm mb-1">AI Insights</h4>
            <p className="text-xs text-purple-700 mb-3">Client demand for Japan is up 40% this week.</p>
            <Button size="sm" variant="outline" className="w-full bg-white text-xs h-8 border-purple-200 text-purple-700 hover:bg-purple-100">
              View Report
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-secondary/10">
        {/* Header */}
        <header className="h-16 border-b border-border/50 bg-white px-6 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl capitalize">{activeView}</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Avatar className="w-8 h-8 border border-border">
              <AvatarFallback className="bg-purple-100 text-purple-700 font-medium">AG</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">

            {activeView === 'dashboard' && (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                      <Package className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,248</div>
                      <p className="text-xs text-green-500 mt-1 flex items-center">+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
                      <Users className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">384</div>
                      <p className="text-xs text-green-500 mt-1">+4% from last month</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                      <BarChart3 className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$42,300</div>
                      <p className="text-xs text-muted-foreground mt-1">This month so far</p>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Agent Chat Interface */}
                <div className="grid grid-cols-1 gap-6">
                  <Card className="border-border/50 shadow-sm bg-purple-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-purple-600 text-white p-1 rounded-md text-xs">AI AGENT</span>
                        Operations Assistant
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-white border rounded-lg p-4 h-48 overflow-y-auto space-y-3">
                          <div className="flex justify-start">
                            <div className="bg-purple-100 text-purple-900 rounded-lg p-2 text-sm max-w-[80%]">
                              Hello! I'm your AI Operations Assistant. You can speak naturally to me. Try:
                              <ul className="list-disc list-inside mt-1 text-xs">
                                <li>"Add a new beach trip to Bali for around $800"</li>
                                <li>"Remove package #5"</li>
                                <li>"Show me the recent activity logs"</li>
                              </ul>
                            </div>
                          </div>
                          {agentMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`rounded-lg p-2 text-sm max-w-[80%] whitespace-pre-line ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={handleAgentImageUpload}
                              title="Upload form"
                            />
                            <Button
                              variant="secondary"
                              size="icon"
                              className="bg-purple-100 text-purple-700 hover:bg-purple-200"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant={isListening ? "destructive" : "secondary"}
                            size="icon"
                            onClick={startListening}
                            title="Speak command"
                            className={isListening ? "animate-pulse" : ""}
                          >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </Button>
                          <input
                            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder={isListening ? "Listening..." : "Type a command..."}
                            value={agentInput}
                            onChange={(e) => setAgentInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAgentSubmit()}
                          />
                          <Button onClick={() => handleAgentSubmit()} className="bg-purple-600 hover:bg-purple-700">Send</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Travel Combos Preview (Top 3) */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg">Recent Combos</h3>
                    <Button variant="ghost" onClick={() => setActiveView('packages')}>View All</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {combos.slice(0, 3).map((combo) => (
                      <Card key={combo.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-full">{combo.category}</span>
                            <span className="font-bold text-primary">{formatPrice(combo.basePrice)}</span>
                          </div>
                          <h4 className="font-bold mb-1 line-clamp-1">{combo.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{combo.description}</p>
                          {combo.images && combo.images.length > 0 && (
                            <img src={combo.images[0]} alt={combo.title} className="w-full h-32 object-cover rounded-md mt-2" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Packages View */}
            {activeView === 'packages' && (
              <div className="grid grid-cols-1 gap-6">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle>Travel Combos Management</CardTitle>
                      <p className="text-sm text-muted-foreground">Manage your curated travel packages.</p>
                    </div>
                    <Link href="/agency/print-form" target="_blank">
                      <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                        Download Form
                      </Button>
                    </Link>
                    <Button onClick={() => setIsAddComboOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" /> Add Combo
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {combos.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        No combos created yet. Click "Add Combo" to start.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {combos.map((combo) => (
                          <div key={combo.id} className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                                {combo.category}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                                onClick={() => handleDeleteCombo(combo.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{combo.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 md:h-10">{combo.description}</p>
                            {combo.images && combo.images.length > 0 && (
                              <div className="mb-4 rounded-md overflow-hidden bg-muted aspect-video relative group">
                                <img
                                  src={combo.images[0]}
                                  alt={combo.title}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                />
                                {combo.images.length > 1 && (
                                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
                                    +{combo.images.length - 1} more
                                  </div>
                                )}
                                {/* Mini Hover Gallery - Simple Cycle on Hover could be implemented here or just keep it simple with indicator for now due to complexity constraints */}
                              </div>
                            )}
                            <div className="space-y-1 text-xs text-muted-foreground mb-4">
                              <p><strong>Includes:</strong> {combo.inclusions}</p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="font-bold text-lg text-primary">{formatPrice(combo.basePrice)}</span>
                              <div className="flex gap-2">
                                <input
                                  type="file"
                                  id={`upload-${combo.id}`}
                                  className="hidden"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleImageUpload(e, combo.id)}
                                />
                                <label htmlFor={`upload-${combo.id}`} className="cursor-pointer">
                                  <div className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                                    <ImageIcon className="w-3 h-3 mr-2" /> Img
                                  </div>
                                </label>
                                <Button variant="outline" size="sm" className="h-8" onClick={() => openEditDialog(combo)}>Edit</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Clients View */}
            {activeView === 'clients' && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Client Directory</CardTitle>
                  <CardDescription>Manage your current and past clients.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trips</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientData.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              {client.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>
                              <span className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" /> {client.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${client.status === 'Active' ? 'bg-green-100 text-green-700' :
                              client.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                              {client.status}
                            </span>
                          </TableCell>
                          <TableCell>{client.trips}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Analytics View */}
            {activeView === 'analytics' && (
              <div className="space-y-6">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Monthly revenue vs bookings.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={bookingData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Bookings by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main >
    </div >
  );
}
