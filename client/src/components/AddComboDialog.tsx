import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type TravelCombo } from "@shared/schema";

interface ManageComboDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (combo: any) => void;
    initialData?: TravelCombo | null;
}

export default function ManageComboDialog({
    open,
    onOpenChange,
    onConfirm,
    initialData
}: ManageComboDialogProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        basePrice: "",
        inclusions: ""
    });

    useEffect(() => {
        if (open && initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description,
                category: initialData.category,
                basePrice: initialData.basePrice,
                inclusions: initialData.inclusions
            });
        } else if (open && !initialData) {
            setFormData({
                title: "",
                description: "",
                category: "",
                basePrice: "",
                inclusions: ""
            });
        }
    }, [open, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        onConfirm(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl text-blue-800">
                        {initialData ? "Edit Travel Combo" : "Add Travel Combo"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="font-semibold text-gray-700">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Enter combo title"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description" className="font-semibold text-gray-700">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe this travel combo"
                            className="min-h-[80px]"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category" className="font-semibold text-gray-700">Category</Label>
                        <Input
                            id="category"
                            name="category"
                            placeholder="e.g., Adventure, Family, Luxury"
                            value={formData.category}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="basePrice" className="font-semibold text-gray-700">Base Price (₹)</Label>
                        <Input
                            id="basePrice"
                            name="basePrice"
                            placeholder="Enter base price"
                            value={formData.basePrice}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="inclusions" className="font-semibold text-gray-700">Inclusions</Label>
                        <Input
                            id="inclusions"
                            name="inclusions"
                            placeholder="e.g., Flights, Hotel, Meals"
                            value={formData.inclusions}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
