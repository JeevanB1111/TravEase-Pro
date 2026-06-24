import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation } from "lucide-react";

interface LocationPromptProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    destinationName: string;
    onConfirm: (location: string, useCurrentLocation: boolean) => void;
}

export default function LocationPrompt({
    open,
    onOpenChange,
    destinationName,
    onConfirm
}: LocationPromptProps) {
    const [startLocation, setStartLocation] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCurrentLocation = () => {
        setLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    setLoading(false);
                    onConfirm("", true); // Empty string for name, true for useCurrentLocation
                    onOpenChange(false);
                },
                (error) => {
                    setLoading(false);
                    console.error("Error getting location:", error);
                    alert("Could not get your location. Please enter it manually.");
                }
            );
        } else {
            setLoading(false);
            alert("Geolocation is not supported by your browser");
        }
    };

    const handleManualSubmit = () => {
        if (startLocation.trim()) {
            onConfirm(startLocation, false);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Plan Route to {destinationName}</DialogTitle>
                    <DialogDescription>
                        Where are you starting your journey from?
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-12"
                        onClick={handleCurrentLocation}
                        disabled={loading}
                    >
                        <Navigation className={`w-4 h-4 ${loading ? 'animate-spin' : 'text-blue-500'}`} />
                        {loading ? "Detecting location..." : "Use My Current Location"}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g., London, Central Station..."
                            value={startLocation}
                            onChange={(e) => setStartLocation(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                        />
                        <Button onClick={handleManualSubmit} disabled={!startLocation.trim()}>
                            <MapPin className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
