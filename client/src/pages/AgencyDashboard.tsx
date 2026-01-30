import { 
  LayoutDashboard, 
  Package, 
  Users, 
  BarChart3, 
  Plus, 
  Search,
  MoreHorizontal,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', bookings: 40 },
  { name: 'Feb', bookings: 30 },
  { name: 'Mar', bookings: 20 },
  { name: 'Apr', bookings: 27 },
  { name: 'May', bookings: 18 },
  { name: 'Jun', bookings: 23 },
  { name: 'Jul', bookings: 34 },
];

export default function AgencyDashboard() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
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
            <Button variant="ghost" className="w-full justify-start gap-3 text-purple-600 bg-purple-50 font-medium">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
              <Package className="w-4 h-4" /> Packages
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
              <Users className="w-4 h-4" /> Clients
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
              <BarChart3 className="w-4 h-4" /> Analytics
            </Button>
          </nav>
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
          <h1 className="font-display font-bold text-xl">Overview</h1>
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="col-span-1 lg:col-span-2 border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Booking Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="bookings" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1 border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Packages</CardTitle>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { name: "Kyoto Spring", price: "$2,400", status: "Active" },
                      { name: "Bali Retreat", price: "$1,850", status: "Draft" },
                      { name: "Swiss Alps", price: "$3,200", status: "Active" },
                    ].map((pkg, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{pkg.name}</p>
                            <p className="text-xs text-muted-foreground">{pkg.price}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6">View All Packages</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
