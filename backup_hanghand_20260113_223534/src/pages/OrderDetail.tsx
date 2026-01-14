import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Calendar, MapPin, MessageCircle, DollarSign, Clock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/stores/orderStore";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { OrderStatus, Order } from "@/types/orders";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const { orders, updateOrderStatus, updateOrder } = useOrderStore();
    const { createConversation } = useMessageStore();
    const [isLoading, setIsLoading] = useState(false);

    // Find order in store (assuming loaded)
    const order = orders.find(o => o.id === id);

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="container py-20 text-center">
                    <p className="text-muted-foreground">Order not found.</p>
                    <Button onClick={() => navigate('/orders')} className="mt-4" variant="outline">
                        Back to Orders
                    </Button>
                </div>
            </div>
        );
    }

    const isBuyer = order.buyerId === currentUser.id;
    const isProvider = order.providerId === currentUser.id;

    const handleSubmitQuote = async () => {
        const amountStr = prompt("Enter the total service amount in CAD (excluding fees/tax):");
        if (!amountStr) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount < 0) {
            toast.error("Invalid amount");
            return;
        }

        setIsLoading(true);
        const cents = Math.round(amount * 100);
        const platformFee = Math.round(cents * 0.05);
        const tax = Math.round((cents + platformFee) * 0.13);
        const total = cents + platformFee + tax;

        const formatCAD = (val: number) => `$${(val / 100).toFixed(2)}`;

        try {
            await updateOrder(order.id, {
                status: 'WAITING_FOR_PRICE_APPROVAL',
                pricing: {
                    baseAmount: { amount: cents, currency: 'CAD', formatted: formatCAD(cents) },
                    platformFee: { amount: platformFee, currency: 'CAD', formatted: formatCAD(platformFee) },
                    taxAmount: { amount: tax, currency: 'CAD', formatted: formatCAD(tax) },
                    total: { amount: total, currency: 'CAD', formatted: formatCAD(total) }
                }
            });
            toast.success("Quote submitted successfully");
        } catch (error) {
            toast.error("Failed to submit quote");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveQuote = async () => {
        setIsLoading(true);
        try {
            await updateOrder(order.id, {
                status: 'PENDING_PAYMENT'
            });
            toast.success("Quote approved. Please proceed to payment.");
        } catch (error) {
            toast.error("Failed to approve quote");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePay = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    orderType: 'WEB_ORDER',
                    orderId: order.id,
                    listingItemId: order.itemId,
                    masterId: order.masterId,
                    buyerId: currentUser.id,
                    productName: order.snapshot.itemName,
                    price: order.pricing.total.amount,
                    metadata: {
                        rentalStart: order.rentalStartDate,
                        rentalEnd: order.rentalEndDate,
                        depositAmount: order.depositAmount,
                        serviceCallFee: order.serviceCallFee
                    }
                }
            });

            if (error || !data?.url) throw error || new Error("Failed to create session");
            window.location.href = data.url;
        } catch (error) {
            console.error('Payment failed:', error);
            toast.error('Failed to initiate payment');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMessage = async () => {
        setIsLoading(true);
        try {
            // Determine initial partnerId (try user_id from join first, else fallback)
            let partnerId = isBuyer ? order.providerUserId : order.buyerId;

            // FALLBACK: If we are the buyer, and the ID looks suspicious (same as profile ID) or is missing
            // We fetch the real User ID directly from the DB.
            if (isBuyer && (!partnerId || partnerId === order.providerId)) {
                console.log("⚠️ Provider User ID missing/mismatched in order. Fetching manually...");
                const { data: profile, error } = await supabase
                    .from('provider_profiles')
                    .select('user_id')
                    .eq('id', order.providerId)
                    .single();

                if (error || !profile) {
                    throw new Error("Could not find Provider User ID linked to this order.");
                }
                partnerId = profile.user_id;
                console.log("✅ Resolved Provider User ID:", partnerId);
            }

            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!partnerId || !uuidRegex.test(partnerId)) {
                alert(`Cannot start chat: Invalid Partner ID (${partnerId}). Data integrity issue.`);
                console.error("Invalid Partner ID:", partnerId);
                setIsLoading(false);
                return;
            }

            const conversation = await createConversation(currentUser.id, partnerId, order.id);
            navigate('/chat');
        } catch (error: any) {
            console.error("Chat creation failed:", error);
            alert(`Failed to start chat: ${error.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: OrderStatus }) => {
        const config = {
            'PENDING_PAYMENT': { color: 'text-orange-500', bg: 'bg-orange-50', label: 'Waiting for Payment' },
            'PENDING_CONFIRMATION': { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Pending Confirmation' },
            'IN_PROGRESS': { color: 'text-purple-500', bg: 'bg-purple-50', label: 'In Progress' },
            'COMPLETED': { color: 'text-green-500', bg: 'bg-green-50', label: 'Completed' },
            'CANCELLED': { color: 'text-gray-500', bg: 'bg-gray-50', label: 'Cancelled' },
            'PENDING_DEPOSIT': { color: 'text-orange-500', bg: 'bg-orange-50', label: 'Waiting for Deposit' },
            'PENDING_QUOTE': { color: 'text-amber-500', bg: 'bg-amber-50', label: 'Awaiting Quote' },
            'WAITING_FOR_PRICE_APPROVAL': { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Reviewing Quote' },
        }[status] || { color: 'text-gray-500', bg: 'bg-gray-50', label: status };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${config.color} ${config.bg}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container max-w-3xl py-8 px-4">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center text-muted-foreground hover:text-foreground mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
                </button>

                {/* Main Card */}
                <div className="card-warm overflow-hidden mb-6">
                    {/* Header bg */}
                    <div className="bg-muted/30 p-6 border-b border-border">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Order #{order.id.slice(0, 8)}</p>
                                <h1 className="text-2xl font-black">{order.snapshot.masterTitle}</h1>
                            </div>
                            <StatusBadge status={order.status} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Item Details */}
                        <div className="flex gap-4 items-start">
                            <img
                                src={order.snapshot.masterImages[0]}
                                alt={order.snapshot.masterTitle}
                                className="w-20 h-20 rounded-lg object-cover bg-muted"
                            />
                            <div>
                                <h3 className="font-bold text-lg">{order.snapshot.itemName}</h3>
                                <p className="text-muted-foreground">{order.snapshot.itemDescription}</p>
                                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                    {order.snapshot.itemPricing.unit && (
                                        <span className="flex items-center">
                                            <Package className="w-4 h-4 mr-1" />
                                            {order.snapshot.itemPricing.unit}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-muted/20 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Base Price</span>
                                <span>{order.pricing.baseAmount.formatted}</span>
                            </div>
                            {order.pricing.taxAmount?.amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>{order.pricing.taxAmount.formatted}</span>
                                </div>
                            )}
                            {order.pricing.platformFee.amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Platform Fee</span>
                                    <span>{order.pricing.platformFee.formatted}</span>
                                </div>
                            )}
                            {order.depositAmount && order.depositAmount > 0 && (
                                <div className="flex justify-between text-sm text-orange-600 font-bold">
                                    <span className="text-muted-foreground font-normal italic">Security Deposit (Refundable)</span>
                                    <span>${(order.depositAmount / 100).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                                <span>Total Paid</span>
                                <span className="text-primary">{order.pricing.total.formatted}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleMessage}
                                disabled={isLoading}
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact {isBuyer ? 'Provider' : 'Buyer'}
                            </Button>

                            {/* Buyer Actions */}
                            {isBuyer && order.status === 'PENDING_PAYMENT' && (
                                <Button className="flex-1 btn-action" onClick={handlePay} disabled={isLoading}>
                                    Pay Now
                                </Button>
                            )}
                            {isBuyer && order.status === 'PENDING_DEPOSIT' && (
                                <Button className="flex-1 btn-action bg-orange-600 hover:bg-orange-700 text-white" onClick={handlePay} disabled={isLoading}>
                                    Pay Deposit
                                </Button>
                            )}
                            {isBuyer && order.status === 'WAITING_FOR_PRICE_APPROVAL' && (
                                <Button className="flex-1 btn-action" onClick={handleApproveQuote} disabled={isLoading}>
                                    Approve Price
                                </Button>
                            )}
                            {isBuyer && order.status === 'IN_PROGRESS' && (
                                <Button className="flex-1 btn-action" onClick={() => updateOrderStatus(order.id, 'COMPLETED')}>
                                    Confirm Complete
                                </Button>
                            )}

                            {isBuyer && order.status === 'COMPLETED' && (
                                <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-black uppercase tracking-widest rounded-xl" onClick={() => navigate(`/review/${order.id}`)}>
                                    Write Review
                                </Button>
                            )}

                            {/* Seller Actions */}
                            {isProvider && order.status === 'PENDING_CONFIRMATION' && (
                                <Button className="flex-1 btn-action" onClick={() => updateOrderStatus(order.id, 'IN_PROGRESS')}>
                                    Accept Order
                                </Button>
                            )}
                            {isProvider && order.status === 'PENDING_QUOTE' && (
                                <Button className="flex-1 btn-action" onClick={handleSubmitQuote} disabled={isLoading}>
                                    Submit Quote
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Timeline? (Future) */}
            </div>

            <Footer />
        </div>
    );
};

export default OrderDetail;
