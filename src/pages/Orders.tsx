import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useOrderStore } from "@/stores/orderStore";
import { useAuthStore } from "@/stores/authStore";
import { OrderStatus } from "@/types/orders";
import { Button } from "@/components/ui/button";

const Orders = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const { orders, updateOrderStatus, loadUserOrders } = useOrderStore();
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
    const [viewMode, setViewMode] = useState<'buyer' | 'seller'>('buyer');

    useEffect(() => {
        if (currentUser?.id) {
            loadUserOrders(currentUser.id);
        }
    }, [currentUser?.id, loadUserOrders]);

    const userOrders = orders.filter(o =>
        viewMode === 'buyer' ? o.buyerId === currentUser?.id : o.providerId === currentUser?.id
    );

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    const filteredOrders = userOrders.filter(order => {
        if (activeTab === 'pending') return ['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'IN_PROGRESS'].includes(order.status);
        if (activeTab === 'completed') return ['COMPLETED', 'CANCELLED'].includes(order.status);
        return true;
    });

    const getStatusConfig = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING_PAYMENT':
                return { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', label: '待支付' };
            case 'PENDING_CONFIRMATION':
                return { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50', label: '待确认' };
            case 'IN_PROGRESS':
                return { icon: Package, color: 'text-purple-500', bg: 'bg-purple-50', label: '进行中' };
            case 'COMPLETED':
                return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: '已完成' };
            case 'CANCELLED':
                return { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-50', label: '已取消' };
            default:
                return { icon: Package, color: 'text-gray-500', bg: 'bg-gray-50', label: status };
        }
    };

    const handlePayOrder = (orderId: string) => {
        updateOrderStatus(orderId, 'PENDING_CONFIRMATION');
    };

    // Seller actions
    const acceptOrder = async (orderId: string) => {
        await updateOrderStatus(orderId, 'IN_PROGRESS');
    };

    const submitQuote = async (orderId: string) => {
        const priceStr = prompt('Enter quote price (CAD cents):');
        if (!priceStr) return;
        const price = parseInt(priceStr, 10);
        if (isNaN(price)) return;
        await updateOrderStatus(orderId, 'WAITING_FOR_PRICE_APPROVAL', { quoteAmount: price });
    };

    const completeOrder = async (orderId: string) => {
        await updateOrderStatus(orderId, 'COMPLETED');
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container max-w-4xl py-8 px-4">
                <h1 className="text-3xl font-extrabold mb-6">My Orders</h1>

                {/* View Mode Toggle */}
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => setViewMode('buyer')}
                        className={`pb-2 px-4 font-semibold ${viewMode === 'buyer' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                    >
                        I'm Buying
                    </button>
                    <button
                        onClick={() => setViewMode('seller')}
                        className={`pb-2 px-4 font-semibold ${viewMode === 'seller' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                    >
                        I'm Selling
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-border">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-3 px-4 font-semibold transition-colors ${activeTab === 'all'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        全部 ({userOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-3 px-4 font-semibold transition-colors ${activeTab === 'pending'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        进行中
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`pb-3 px-4 font-semibold transition-colors ${activeTab === 'completed'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        已完成
                    </button>
                </div>

                {/* Order List */}
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">暂无订单</p>
                        <Button
                            onClick={() => navigate('/')}
                            className="mt-4 btn-action"
                        >
                            去逛逛
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={order.id}
                                    className="card-warm p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-full ${statusConfig.bg}`}>
                                                <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                                            </div>
                                            <span className={`font-semibold ${statusConfig.color}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </div>

                                    {/* Order Content */}
                                    <div className="flex gap-4">
                                        <img
                                            src={order.snapshot.masterImages[0]}
                                            alt={order.snapshot.masterTitle}
                                            className="w-24 h-24 rounded-xl object-cover"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">
                                                {order.snapshot.masterTitle}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {order.snapshot.itemName}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">
                                                    下单时间: {new Date(order.createdAt).toLocaleDateString('zh-CN')}
                                                </p>
                                                <p className="text-xl font-bold text-primary">
                                                    {order.pricing.total.formatted}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buyer Actions */}
                                    {viewMode === 'buyer' && order.status === 'PENDING_PAYMENT' && (
                                        <div className="mt-4 pt-4 border-t border-border flex gap-2 justify-end">
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'CANCELLED'); }}>Cancel</Button>
                                            <Button size="sm" className="btn-action" onClick={(e) => { e.stopPropagation(); handlePayOrder(order.id); }}>Pay Now</Button>
                                        </div>
                                    )}
                                    {viewMode === 'buyer' && order.status === 'IN_PROGRESS' && (
                                        <div className="mt-4 pt-4 border-t border-border flex gap-2 justify-end">
                                            <Button size="sm" className="btn-action" onClick={(e) => { e.stopPropagation(); completeOrder(order.id); }}>Confirm Complete</Button>
                                        </div>
                                    )}

                                    {/* Seller Actions */}
                                    {viewMode === 'seller' && order.status === 'PENDING_CONFIRMATION' && (
                                        <div className="mt-4 pt-4 border-t border-border flex gap-2 justify-end">
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'CANCELLED'); }}>Reject</Button>
                                            <Button size="sm" className="btn-action" onClick={(e) => { e.stopPropagation(); acceptOrder(order.id); }}>Accept Order</Button>
                                        </div>
                                    )}
                                    {viewMode === 'seller' && order.status === 'PENDING_QUOTE' && (
                                        <div className="mt-4 pt-4 border-t border-border flex gap-2 justify-end">
                                            <Button size="sm" className="btn-action" onClick={(e) => { e.stopPropagation(); submitQuote(order.id); }}>Submit Quote</Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Orders;
