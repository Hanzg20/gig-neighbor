import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Calculator } from "lucide-react";

interface QuoteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number) => Promise<void>;
    isLoading?: boolean;
}

export function QuoteDialog({ isOpen, onClose, onSubmit, isLoading }: QuoteDialogProps) {
    const [amount, setAmount] = useState<string>("");
    const [breakdown, setBreakdown] = useState({
        base: 0,
        platformFee: 0,
        tax: 0,
        total: 0
    });

    useEffect(() => {
        const val = parseFloat(amount);
        if (isNaN(val) || val < 0) {
            setBreakdown({ base: 0, platformFee: 0, tax: 0, total: 0 });
            return;
        }

        const base = val;
        // Platform Fee: 5% (rounded to cents)
        const platformFee = Math.round(base * 0.05 * 100) / 100;
        // Tax: 13% on (Base + Fee)
        const taxBase = base + platformFee;
        const tax = Math.round(taxBase * 0.13 * 100) / 100;
        const total = base + platformFee + tax;

        setBreakdown({
            base,
            platformFee,
            tax,
            total
        });
    }, [amount]);

    const handleSubmit = () => {
        const val = parseFloat(amount);
        if (!isNaN(val) && val > 0) {
            onSubmit(val);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Submit Quote</DialogTitle>
                    <DialogDescription>
                        Enter the base price for your service. We'll automatically calculate fees and taxes.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-right">
                            Base Service Amount (CAD)
                        </Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                className="pl-9 text-lg font-semibold"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Breakdown Card */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Service Fee (You get)</span>
                            <span>${breakdown.base.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Platform Fee (5%)</span>
                            <span>${breakdown.platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Tax (13% HST)</span>
                            <span>${breakdown.tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-base">
                            <span>Buyer Pays Total</span>
                            <span className="text-primary">${breakdown.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || breakdown.total <= 0}>
                        {isLoading ? "Submitting..." : "Send Quote"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
