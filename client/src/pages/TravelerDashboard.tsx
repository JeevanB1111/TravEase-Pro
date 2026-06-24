import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageSquare,
  Map as MapIcon,
  User,
  Settings,
  Send,
  Plus,
  Compass,
  Package,
  Calendar,
  CreditCard,
  LogOut,
  Bell,
  Plane,
  Hotel,
  Clock,
  Download,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Map from "@/components/Map";
import LocationPrompt from "@/components/LocationPrompt";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { type TravelCombo } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DestinationDetails from "@/components/DestinationDetails";

export default function TravelerDashboard() {
  const { toast } = useToast();
  type Message = { role: "ai" | "user"; content: string; relatedComboId?: number, id?: string, isThinking?: boolean, thoughts?: string[] };
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I'm your AI travel assistant. Where would you like to go next?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [activeView, setActiveView] = useState<'chat' | 'combos' | 'trips' | 'profile' | 'details'>('chat');
  const [combos, setCombos] = useState<TravelCombo[]>([]);

  // Modal States
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [manageView, setManageView] = useState<'menu' | 'dates' | 'guests' | 'cancel'>('menu');

  // Booking Wizard State
  const [isPackageDetailsOpen, setIsPackageDetailsOpen] = useState(false);
  const [isBookingWizardOpen, setIsBookingWizardOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<TravelCombo | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'emi' | 'advance'>('full');

  // Detailed Booking State
  const [travelers, setTravelers] = useState(2);
  const [transportMode, setTransportMode] = useState<'flight' | 'train' | 'bus'>('flight');
  const [hasInsurance, setHasInsurance] = useState(false);
  const [hasGuide, setHasGuide] = useState(true);

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

  // Helper to calculate total price
  const calculateTotal = () => {
    if (!selectedCombo) return 0;
    // Remove "$" and "," from base price string like "$1,200"
    const basePrice = parseInt(selectedCombo.basePrice.replace(/[^0-9]/g, '')) || 0;

    let total = basePrice * travelers;

    // Transport adjustments (Mock logic)
    if (transportMode === 'train') total -= 50 * travelers;
    if (transportMode === 'bus') total -= 100 * travelers;

    // Add-ons
    if (hasInsurance) total += 50 * travelers;
    if (hasGuide) total += 30 * 3; // Assuming 3 days for now as typical combo length

    return total;
  };

  // Voice Chat State
  const [isListening, setIsListening] = useState(false);

  // Destination State (Replacing Map State)
  const [selectedDestination, setSelectedDestination] = useState<string>("Paris");
  const [selectedComboImages, setSelectedComboImages] = useState<string[] | undefined>(undefined);

  // Mock function to detect destination from chat (Simple keyword matching for demo)
  const detectDestination = (text: string) => {
    const places = ["paris", "france", "tokyo", "kyoto", "japan", "bali", "indonesia"];
    const found = places.find(p => text.toLowerCase().includes(p));
    if (found) {
      // Capitalize for display
      setSelectedDestination(found.charAt(0).toUpperCase() + found.slice(1));
    }
  };



  useEffect(() => {
    // Ensure we fetch combos for the chat lookup even if not in combos view
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const res = await fetch("/api/combos");
      if (res.ok) {
        const data = await res.json();
        setCombos(data);
      }
    } catch (err) {
      console.error("Failed to fetch combos");
    }
  };

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
        setInputValue(transcript);
        handleSend(transcript); // Auto-send
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Voice recognition is not supported in this browser.");
    }
  };



  const handleSend = async (manualInput?: string) => {
    const userInput = manualInput || inputValue;
    if (!userInput.trim()) return;

    // 1. Add User Message immediately
    setMessages(prev => [...prev, { role: "user", content: userInput }]);
    setInputValue("");

    // 2. Add Thinking Placeholder
    setMessages(prev => [...prev, { role: "ai", content: "AI is processing...", isThinking: true }]);

    try {
      // Simulate "Thinking" time for realism (1.5s)
      await new Promise(r => setTimeout(r, 1500));

      // 3. Call Agent API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput, userId: "current-user-id" })
      });
      const data = await res.json();

      // 4. Remove Thinking Bubble & Add Agent Response
      setMessages(prev => {
        const history = prev.filter(m => !m.isThinking);
        return [...history, {
          role: "ai",
          content: data.message,
          relatedComboId: data.action?.type === 'SHOW_COMBO' ? data.action.data.id : undefined,
          thoughts: data.thoughts
        }];
      });

      // 5. Handle Agent Actions
      if (data.action) {
        if (data.action.type === 'SHOW_COMBO') {
          const combo = data.action.data;
          setSelectedCombo(combo);
          // Set combo in state but let the user manually click 'View Package Details' in the chat to open details modal.
        }
        else if (data.action.type === 'UPDATE_DESTINATION') {
          setSelectedDestination(data.action.data);
        }
        else if (data.action.type === 'TRIGGER_BOOKING') {
          // If we have a selected combo, open booking. 
          // In a real app we'd need to ensure a combo is contextually selected.
          if (selectedCombo) {
            setIsPackageDetailsOpen(false);
            setIsBookingWizardOpen(true);
          } else {
            toast({ title: "Clarification Needed", description: "Please select a package first before booking." });
          }
        }
      }

    } catch (err) {
      setMessages(prev => {
        const history = prev.filter(m => !m.isThinking);
        return [...history, { role: "ai", content: "I apologize, but I seem to be having trouble reaching my cognitive services." }];
      });
    }
  };

  const handleDownloadReceipt = () => {
    toast({ title: "Downloading...", description: "Receipt_NYC_2024.pdf" });
    // Simulate download
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = "data:text/plain;charset=utf-8,TravEase%20Receipt%20-%20New%20York%20City%20Weekend%20-%20$1200%20PAID";
      link.download = "Receipt_NYC_2024.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 000-0000",
    avatar: "https://github.com/shadcn.png",
    emailNotifs: true,
    smsNotifs: false
  });

  const handleProfileUpdate = (field: string, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile(prev => ({ ...prev, avatar: reader.result as string }));
        toast({ title: "Photo Updated", description: "Looking good! Don't forget to save." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    toast({ title: "Profile Saved", description: "Your changes have been successfully updated." });
  };

  const handleSignOut = () => {
    toast({ title: "Signing Out", description: "See you next time!", variant: "destructive" });
    // Simulate redirect
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const NavButton = ({ view, icon: Icon, label }: { view: 'chat' | 'combos' | 'trips' | 'profile', icon: any, label: string }) => (
    <Button
      variant={activeView === view ? "secondary" : "ghost"}
      className={`w-full justify-start gap-3 font-medium ${activeView === view ? "text-primary bg-primary/5" : "text-muted-foreground"}`}
      onClick={() => setActiveView(view)}
    >
      <Icon className="w-4 h-4" /> {label}
    </Button>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Itinerary Modal */}
      <Dialog open={isItineraryOpen} onOpenChange={setIsItineraryOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Kyoto Spring Tour - Itinerary</DialogTitle>
            <DialogDescription>Your trip details for Apr 10 - Apr 17, 2025.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-4 p-3 bg-secondary/20 rounded-lg">
              <Plane className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-sm">Outbound Flight</h4>
                <p className="text-xs text-muted-foreground">JAL 005 - Departs 10:00 AM</p>
                <p className="text-xs font-mono mt-1">SFO {"->"} KIX</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-secondary/20 rounded-lg">
              <Hotel className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-sm">Accommodation</h4>
                <p className="text-xs text-muted-foreground">Kyoto Royal Hotel & Spa</p>
                <p className="text-xs mt-1">Check-in: Apr 10, 3:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 bg-secondary/20 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-sm">Day 1 Activity</h4>
                <p className="text-xs text-muted-foreground">Fushimi Inari Shrine Tour</p>
                <p className="text-xs mt-1">Meeting Point: Lobby at 9:00 AM</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsItineraryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Booking Modal */}
      <Dialog open={isManageOpen} onOpenChange={(open) => {
        setIsManageOpen(open);
        if (!open) setManageView('menu'); // Reset view on close
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {manageView === 'menu' && "Manage Booking"}
              {manageView === 'dates' && "Change Dates"}
              {manageView === 'guests' && "Update Guest Info"}
              {manageView === 'cancel' && "Cancel Reservation"}
            </DialogTitle>
            <DialogDescription>
              {manageView === 'menu' && "Modify or cancel your reservation."}
              {manageView === 'dates' && "Select new travel dates."}
              {manageView === 'guests' && "Edit contact details."}
              {manageView === 'cancel' && "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          {/* Menu View */}
          {manageView === 'menu' && (
            <div className="space-y-4 py-4">
              <Button variant="outline" className="w-full justify-start text-left" onClick={() => setManageView('dates')}>
                <Calendar className="w-4 h-4 mr-2" /> Change Dates
              </Button>
              <Button variant="outline" className="w-full justify-start text-left" onClick={() => setManageView('guests')}>
                <User className="w-4 h-4 mr-2" /> Update Guest Info
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full justify-start text-left bg-red-50 text-red-600 hover:bg-red-100 border-none" onClick={() => setManageView('cancel')}>
                <LogOut className="w-4 h-4 mr-2" /> Cancel Reservation
              </Button>
            </div>
          )}

          {/* Change Dates View */}
          {manageView === 'dates' && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Input type="date" defaultValue="2025-04-10" />
                </div>
                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Input type="date" defaultValue="2025-04-17" />
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                toast({ title: "Request Sent", description: "Agent will review your new dates." });
                setIsManageOpen(false);
              }}>Request Change</Button>
            </div>
          )}

          {/* Update Guests View */}
          {manageView === 'guests' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Primary Guest</Label>
                <Input defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Special Requests</Label>
                <Input placeholder="Dietary restrictions, etc." />
              </div>
              <Button className="w-full" onClick={() => {
                toast({ title: "Info Updated", description: "Guest details saved successfully." });
                setManageView('menu');
              }}>Save Changes</Button>
            </div>
          )}

          {/* Cancel View */}
          {manageView === 'cancel' && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 rounded-lg text-red-800 text-sm">
                Are you sure you want to cancel your trip to Kyoto? Cancellation fees may apply according to the policy.
              </div>
              <Button variant="destructive" className="w-full" onClick={() => {
                toast({ title: "Booking Cancelled", description: "Refund processing started." });
                setIsManageOpen(false);
              }}>Yes, Cancel Booking</Button>
            </div>
          )}

          <DialogFooter>
            {manageView === 'menu' ? (
              <Button variant="secondary" onClick={() => setIsManageOpen(false)}>Close</Button>
            ) : (
              <Button variant="ghost" onClick={() => setManageView('menu')}>Back</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Package Details Modal */}
      <Dialog open={isPackageDetailsOpen} onOpenChange={setIsPackageDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCombo?.title}</DialogTitle>
            <DialogDescription className="text-lg font-medium text-primary">{selectedCombo?.basePrice}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6">
              {/* Hero Image (Mock) */}
              <div className="bg-secondary/20 h-48 rounded-xl flex items-center justify-center text-muted-foreground">
                <Package className="w-12 h-12 opacity-50" />
                <span className="ml-2">Hero Image Gallery</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Agency Details</h4>
                  <p className="text-sm text-blue-800">Global Travels Inc.</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                    <span className="text-yellow-500">★★★★☆</span>
                    <span>(4.8/5) • 120 Reviews</span>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Inclusions</h4>
                  <p className="text-sm text-green-800">{selectedCombo?.inclusions}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedCombo?.description} Experience the ultimate getaway with curated local tours, premium accommodation, and hassle-free transfers.
                </p>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => toast({ title: "Contacting Agency...", description: "They will reply in the chat." })}>
              Contact Agency
            </Button>
            <Button className="flex-1" onClick={() => {
              setIsPackageDetailsOpen(false);
              setBookingStep(1);
              setIsBookingWizardOpen(true);
            }}>
              Book Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Wizard Modal */}
      <Dialog open={isBookingWizardOpen} onOpenChange={setIsBookingWizardOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {bookingStep === 1 && "Customize Your Trip"}
              {bookingStep === 2 && "Payment Details"}
              {bookingStep === 3 && "Booking Confirmed!"}
            </DialogTitle>
            <DialogDescription>
              Step {bookingStep} of 3
            </DialogDescription>
          </DialogHeader>

          {bookingStep === 1 && (
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>Travelers</Label>
                <div className="flex items-center justify-between border p-3 rounded-lg">
                  <span>Adults</span>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" onClick={() => setTravelers(Math.max(1, travelers - 1))}>-</Button>
                    <span>{travelers}</span>
                    <Button size="sm" variant="outline" onClick={() => setTravelers(travelers + 1)}>+</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Transport Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className={`border rounded-lg p-3 text-center cursor-pointer hover:bg-secondary/50 ${transportMode === 'flight' ? 'border-primary bg-primary/10' : ''}`}
                    onClick={() => setTransportMode('flight')}
                  >
                    <Plane className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Flight</span>
                  </div>
                  <div
                    className={`border rounded-lg p-3 text-center cursor-pointer hover:bg-secondary/50 ${transportMode === 'train' ? 'border-primary bg-primary/10' : ''}`}
                    onClick={() => setTransportMode('train')}
                  >
                    <span className="text-xl block mb-1">🚆</span>
                    <span className="text-xs">Train</span>
                  </div>
                  <div
                    className={`border rounded-lg p-3 text-center cursor-pointer hover:bg-secondary/50 ${transportMode === 'bus' ? 'border-primary bg-primary/10' : ''}`}
                    onClick={() => setTransportMode('bus')}
                  >
                    <span className="text-xl block mb-1">🚌</span>
                    <span className="text-xs">Bus</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Add-ons</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={hasInsurance}
                      onChange={(e) => setHasInsurance(e.target.checked)}
                    />
                    <span className="text-sm">Travel Insurance (+$50/person)</span>
                  </label>
                  <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={hasGuide}
                      onChange={(e) => setHasGuide(e.target.checked)}
                    />
                    <span className="text-sm">Local Guide (+$30/day)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {bookingStep === 2 && (
            <div className="space-y-6 py-4">
              <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Package ({travelers} travelers)</span>
                  <span>${(parseInt(selectedCombo?.basePrice.replace(/[^0-9]/g, '') || '0') * travelers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Add-ons & Adjustments</span>
                  <span>${(calculateTotal() - (parseInt(selectedCombo?.basePrice.replace(/[^0-9]/g, '') || '0') * travelers) - 150).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes & Fees</span>
                  <span>$150</span>
                </div>
                <Separator className="bg-gray-300" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Payment Options</Label>
                <div className="flex flex-col gap-2">
                  <div
                    className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center ${paymentMethod === 'full' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setPaymentMethod('full')}
                  >
                    <span className="text-sm font-medium">Full Payment</span>
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div
                    className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center ${paymentMethod === 'emi' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setPaymentMethod('emi')}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">EMI</span>
                      <span className="text-xs text-muted-foreground">${Math.round(calculateTotal() / 10)}/mo for 10 months</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Low Interest</span>
                  </div>
                  <div
                    className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center ${paymentMethod === 'advance' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setPaymentMethod('advance')}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Advance</span>
                      <span className="text-xs text-muted-foreground">Pay $500 now to block</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {bookingStep === 3 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Booking Confirmed!</h3>
                <p className="text-muted-foreground mt-2">Your trip to {selectedCombo?.title} is all set.</p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg text-sm text-left mx-auto max-w-xs space-y-1">
                <p><strong>Ref:</strong> #TRV-88392</p>
                <p><strong>Travelers:</strong> {travelers} ({transportMode})</p>
                <p><strong>Payment:</strong> {paymentMethod === 'full' ? 'Paid in Full' : 'Advance Paid'} (${calculateTotal().toLocaleString()})</p>
              </div>
            </div>
          )}

          <DialogFooter>
            {bookingStep === 1 && (
              <Button onClick={() => setBookingStep(2)} className="w-full">Continue to Payment</Button>
            )}
            {bookingStep === 2 && (
              <div className="flex w-full gap-2">
                <Button variant="ghost" onClick={() => setBookingStep(1)}>Back</Button>
                <Button onClick={() => setBookingStep(3)} className="flex-1">Confirm & Pay</Button>
              </div>
            )}
            {bookingStep === 3 && (
              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={() => {
                  // Watermarked Download
                  toast({ title: "Downloading...", description: "TravEase_Invoice_Watermarked.pdf" });
                  setTimeout(() => {
                    const link = document.createElement("a");
                    // We simulate a watermarked file with a text note for now
                    link.href = "data:text/plain;charset=utf-8,%5BWATERMARK%3A%20TravEase%20Official%5D%0A%0AInvoice%20%23TRV-88392%0APackage%3A%20Paris%20Getaway%0AAmount%3A%20$2000%0AStatus%3A%20Confirmed%0A%0AThank%20you%20for%20choosing%20TravEase!";
                    link.download = "TravEase_Booking_Watermarked.txt";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }, 1000);
                }}>
                  <Download className="w-4 h-4 mr-2" /> Download Receipt
                </Button>
                <Button onClick={() => {
                  setIsBookingWizardOpen(false);
                  setActiveView('trips');
                }} className="flex-1">
                  Go to My Trips
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-white/50 backdrop-blur-sm hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg">TravEase AI</span>
          </Link>

          <Button
            className="w-full justify-start gap-2 mb-6"
            size="lg"
            onClick={() => {
              // Reset to initial state
              setMessages([
                { role: "ai", content: "Hello! I'm your AI travel assistant. Where would you like to go next?" }
              ]);
              setActiveView('chat');
              setInputValue("");
              setSelectedCombo(null);
              setBookingStep(1);
              setIsBookingWizardOpen(false);
              setIsPackageDetailsOpen(false);
              // Reset map to default if needed, or keep last search
              toast({
                title: "New Trip Started",
                description: "Chat history has been cleared. Ready for a new adventure!",
              });
            }}
          >
            <Plus className="w-4 h-4" /> New Trip
          </Button>

          <nav className="space-y-1">
            <NavButton view="chat" icon={MessageSquare} label="Chat Planner" />
            <NavButton view="trips" icon={MapIcon} label="My Trips" />
            <NavButton view="combos" icon={Package} label="Travel Combos" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-border/50">
          <Button variant="ghost" className="w-full justify-start gap-3 pl-0 hover:bg-transparent text-left" onClick={() => setActiveView('profile')}>
            <Avatar className="w-9 h-9 border border-border">
              <AvatarImage src={userProfile.avatar} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start overflow-hidden">
              <span className="text-sm font-medium truncate w-full">{userProfile.name}</span>
              <span className="text-xs text-muted-foreground truncate w-full">Traveler Plan</span>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">

        {/* Dynamic Left Content (Chat/Combos/Trips/Profile) */}
        <div className="flex-1 flex flex-col h-full border-r border-border/50 bg-white min-w-0">
          <div className="p-4 border-b border-border/50 flex items-center justify-between md:hidden">
            <span className="font-display font-bold">TravEase AI</span>
            <Button variant="ghost" size="sm">Menu</Button>
          </div>

          {activeView === 'chat' && (
            <>
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
                        {msg.isThinking ? (
                          <div className="flex space-x-1 h-5 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                          </div>
                        ) : (
                          msg.content
                        )}

                        {msg.thoughts && msg.thoughts.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200/20 text-xs font-mono text-muted-foreground opacity-80">
                            <details className="cursor-pointer group">
                              <summary className="list-none flex items-center gap-1 hover:text-primary transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                <span>Agent Thought Process ({msg.thoughts.length} steps)</span>
                              </summary>
                              <div className="mt-2 pl-3 border-l-2 border-blue-200/30 space-y-1">
                                {msg.thoughts.map((thought, tIdx) => (
                                  <div key={tIdx} className="flex gap-2">
                                    <span className="text-blue-400">→</span>
                                    <span>{thought}</span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}

                        {msg.relatedComboId && !msg.isThinking && (
                          <div className="mt-3 bg-white/50 p-2 rounded-lg">
                            <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {
                              const combo = combos.find(c => c.id === msg.relatedComboId);
                              if (combo) {
                                setSelectedCombo(combo);
                                setIsPackageDetailsOpen(true);
                              }
                            }}>
                              View Package Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/50 bg-white/80 backdrop-blur">
                <div className="max-w-2xl mx-auto relative flex gap-2">
                  <Button
                    variant={isListening ? "destructive" : "secondary"}
                    size="icon"
                    className={`rounded-full shadow-sm h-12 w-12 flex-shrink-0 ${isListening ? "animate-pulse" : ""}`}
                    onClick={startListening}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                  </Button>
                  <div className="relative flex-1">
                    <Input
                      placeholder="Ask to plan a trip to Paris..."
                      className="pr-12 py-6 rounded-full border-border/50 bg-secondary/20 focus-visible:ring-primary/20 w-full"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button
                      size="icon"
                      className="absolute right-1 top-1.5 rounded-full h-9 w-9 shadow-sm"
                      onClick={() => handleSend()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  AI can make mistakes. Please verify important travel details.
                </p>
              </div>
            </>
          )}

          {activeView === 'combos' && (
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Curated Travel Combos</h2>
                {combos.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No active travel combos available right now. Check back later!
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {combos.map((combo) => (
                      <Card
                        key={combo.id}
                        className="hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => {
                          setSelectedDestination(combo.title);
                          setSelectedComboImages(combo.images || undefined);

                          // Switch to details view on smaller screens or if we want a dedicated view
                          if (window.innerWidth < 1024) {
                            setActiveView('details');
                          }
                        }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                              {combo.category}
                            </span>
                            <span className="font-bold text-primary">{formatPrice(combo.basePrice)}</span>
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">{combo.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{combo.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <strong>Includes:</strong> {combo.inclusions}
                          </div>
                          <Button className="w-full mt-4" variant="secondary" onClick={(e) => {
                            e.stopPropagation(); // Don't trigger card click
                            setActiveView('chat');
                            handleSend(`I'm interested in the ${combo.title} package.`);
                          }}>
                            Book This Combo
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {activeView === 'trips' && (
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">My Trips</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</h3>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-lg">Kyoto Spring Tour</CardTitle>
                          <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Confirmed</span>
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Apr 10 - Apr 17, 2025
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                          7 days exploring temples, bamboo forests, and tea ceremonies.
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setIsItineraryOpen(true)}
                          >
                            View Itinerary
                          </Button>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => setIsManageOpen(true)}
                          >
                            Manage Booking
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Past</h3>
                    <Card className="opacity-75">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-lg">New York City Weekend</CardTitle>
                          <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Completed</span>
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Dec 05 - Dec 08, 2024
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                          3 days, Broadway show and Central Park walking tour.
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={handleDownloadReceipt}
                        >
                          <Download className="w-4 h-4 mr-2" /> Download Receipt
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          {activeView === 'details' && (
            <div className="flex-1 overflow-hidden bg-background">
              <div className="p-4 border-b md:hidden flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveView('combos')}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <span className="font-bold">{selectedDestination}</span>
              </div>
              <DestinationDetails destination={selectedDestination} customImages={selectedComboImages} className="w-full h-full" />
            </div>
          )}

          {activeView === 'profile' && (
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg cursor-pointer">
                      <AvatarImage src={userProfile.avatar} />
                      <AvatarFallback className="text-2xl">JD</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <label className="cursor-pointer">
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        <Settings className="w-6 h-6 text-white" />
                      </label>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                    <p className="text-muted-foreground">Traveler Plan • Member since 2024</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><User className="w-5 h-5" /> Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input value={userProfile.name} onChange={(e) => handleProfileUpdate('name', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input value={userProfile.email} onChange={(e) => handleProfileUpdate('email', e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input value={userProfile.phone} onChange={(e) => handleProfileUpdate('phone', e.target.value)} />
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><Settings className="w-5 h-5" /> Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Dropdowns</Label>
                          <p className="text-sm text-muted-foreground">Receive updates about new travel combos.</p>
                        </div>
                        <Switch checked={userProfile.emailNotifs} onCheckedChange={(c) => handleProfileUpdate('emailNotifs', c)} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Sms Notifications</Label>
                          <p className="text-sm text-muted-foreground">Get trip reminders via SMS.</p>
                        </div>
                        <Switch checked={userProfile.smsNotifs} onCheckedChange={(c) => handleProfileUpdate('smsNotifs', c)} />
                      </div>
                    </CardContent>
                  </Card>

                  <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}

        </div>

        {/* Right Half on Desktop (replaced Map) */}
        <div className="hidden lg:flex flex-1 bg-background relative border-l border-border/50">
          <DestinationDetails destination={selectedDestination} customImages={selectedComboImages} className="w-full" />
        </div>

      </main >
    </div >
  );
}
