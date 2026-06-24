import * as React from "react";
import { Star, MapPin, Clock, Calendar, User, ThumbsUp } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Review {
    id: number;
    user: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
    likes: number;
}

interface DestinationDetailsProps {
    destination: string;
    className?: string;
    customImages?: string[];
}

const MOCK_REVIEWS: Review[] = [
    {
        id: 1,
        user: "Sarah Jenkins",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        rating: 5,
        date: "2 weeks ago",
        comment: "Absolutely breathtaking! The views were unreal and the local food was to die for. Highly recommend visiting the old town district.",
        likes: 24
    },
    {
        id: 2,
        user: "Michael Chen",
        avatar: "https://i.pravatar.cc/150?u=michael",
        rating: 4,
        date: "1 month ago",
        comment: "Great experience overall. The guided tour was very informative. Only downside was the traffic getting to the city center.",
        likes: 12
    },
    {
        id: 3,
        user: "Emma Wilson",
        avatar: "https://i.pravatar.cc/150?u=emma",
        rating: 5,
        date: "2 months ago",
        comment: "A lifetime memory. We went during the spring festival and the colors were amazing. Perfect for photographers!",
        likes: 45
    },
    {
        id: 4,
        user: "David Miller",
        avatar: "https://i.pravatar.cc/150?u=david",
        rating: 5,
        date: "3 months ago",
        comment: "Incredible hospitality. I felt so welcomed by everyone. Can't wait to go back with my family next year.",
        likes: 8
    }
];

const MOCK_IMAGES = [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000", // Paris
    "https://images.unsplash.com/photo-1499856871940-a09627c6d7db?auto=format&fit=crop&q=80&w=1000", // Eiffel
    "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?auto=format&fit=crop&q=80&w=1000", // Louvre
    "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&q=80&w=1000", // Food
];

export default function DestinationDetails({ destination, className, customImages }: DestinationDetailsProps) {
    // Mock data mapping based on destination match (simplified)
    const isParis = destination.toLowerCase().includes("paris") || destination.toLowerCase().includes("france");
    const isJapan = destination.toLowerCase().includes("japan") || destination.toLowerCase().includes("kyoto") || destination.toLowerCase().includes("tokyo");
    const isBali = destination.toLowerCase().includes("bali") || destination.toLowerCase().includes("indonesia");

    let images = MOCK_IMAGES;
    let flightTime = "8h 15m";
    let bestTime = "Apr - Jun";
    let description = "Experience the city of lights, love, and incredible gastronomy. From the Eiffel Tower to the charming streets of Montmartre, Paris offers an unforgettable journey.";

    if (customImages && customImages.length > 0) {
        console.log("DestinationDetails received custom images:", customImages.length);
        images = [...customImages, ...images];
    } else if (isJapan) {
        images = [
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1528360983277-13d9b152c6d4?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=1000"
        ];
        flightTime = "14h 30m";
        bestTime = "Mar - May";
        description = "Discover the perfect blend of ancient tradition and modern innovation. Visit breathtaking temples, bustling futuristic cities, and serene bamboo forests.";
    } else if (isBali) {
        images = [
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&q=80&w=1000"
        ];
        flightTime = "18h 45m";
        bestTime = "May - Sep";
        description = "Escape to a tropical paradise known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs. A spiritual and relaxing retreat.";
    }

    return (
        <div className={`h-full flex flex-col bg-background ${className}`}>
            {/* Hero Carousel */}
            <div className="relative w-full h-[40%] min-h-[300px] bg-muted">
                <Carousel className="w-full h-full">
                    <CarouselContent>
                        {images.map((img, index) => (
                            <CarouselItem key={index} className="h-full">
                                <div className="w-full h-full relative group">
                                    <img
                                        src={img}
                                        alt={`${destination} view ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Navigation Buttons inside absolute container to float them */}
                    <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                        <CarouselPrevious className="static translate-y-0 bg-white/20 hover:bg-white text-white hover:text-black border-none backdrop-blur-md" />
                        <CarouselNext className="static translate-y-0 bg-white/20 hover:bg-white text-white hover:text-black border-none backdrop-blur-md" />
                    </div>
                </Carousel>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 p-6 z-10 text-white w-full">
                    <div className="flex justify-between items-end">
                        <div>
                            <Badge variant="secondary" className="mb-3 bg-primary text-primary-foreground hover:bg-primary/90 border-none px-3 py-1 font-semibold tracking-wide uppercase text-[10px]">
                                Top Destination
                            </Badge>
                            <h1 className="text-4xl font-bold font-display shadow-black drop-shadow-lg tracking-tight">{destination}</h1>
                            <div className="flex items-center gap-2 mt-2 text-white/90">
                                <MapPin className="w-4 h-4 fill-current" />
                                <span className="text-sm font-medium">{flightTime} from your location</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xl font-bold">4.9</span>
                                <span className="text-xs opacity-80">(2.4k)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-secondary/20 border-border/50 shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Avg. Duration</p>
                                    <p className="font-semibold text-foreground">5-7 Days</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-secondary/20 border-border/50 shadow-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase">Best Time</p>
                                    <p className="font-semibold text-foreground">{bestTime}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            About this place
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-base">
                            {description}
                        </p>
                    </div>

                    <Separator className="bg-border/60" />

                    {/* Reviews */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                Traveler Reviews
                                <Badge variant="outline" className="ml-2">{MOCK_REVIEWS.length}</Badge>
                            </h2>
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">View All</Button>
                        </div>

                        <div className="space-y-4">
                            {MOCK_REVIEWS.map((review) => (
                                <Card key={review.id} className="shadow-none border border-border/60">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-9 h-9 border">
                                                    <AvatarImage src={review.avatar} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{review.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold">{review.user}</p>
                                                    <p className="text-xs text-muted-foreground">{review.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded text-xs">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{review.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground/80 leading-snug">"{review.comment}"</p>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                            <button className="flex items-center gap-1 hover:text-foreground transition-colors group">
                                                <ThumbsUp className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                Helpful ({review.likes})
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
