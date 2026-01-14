import { useState } from "react";
import { DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/types/orders";
import { repositoryFactory } from "@/services/repositories/factory";

interface InstantPayFlowProps {
    order: Order;
    onStatusChange?: (newStatus: OrderStatus) => void;
}

/**
 * Instant Pay Flow (JinBean Pattern 1)
 * Use Case: Quick tasks in Lees pilot (e.g., "help move furniture", "代取快递")
 * Flow: Buyer pays → ACCEPTED → Provider completes → Auto-complete after 24h
 */
export const InstantPayFlow = ({ order, onStatusChange }: InstantPayFlowProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayNow = async () => {
        setLoading(true);
        setError(null);

        try {
            const orderRepo = repositoryFactory.createOrderRepository();

            // In production: Direct status update to ACCEPTED (for instant pay)
            // This will trigger the SQL function 'process_bean_transaction' for escrow
            await orderRepo.updateStatus(order.id, 'ACCEPTED');

            onStatusChange?.('ACCEPTED');
        } catch (err) {
            setError('支付失败，请确认余额充足');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async () => {
        setLoading(true);
        setError(null);

        try {
            const orderRepo = repositoryFactory.createOrderRepository();
            await orderRepo.updateStatus(order.id, 'COMPLETED');

            onStatusChange?.('COMPLETED');
        } catch (err) {
            setError('操作失败');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Buyer view: Pending payment
    if (order.status === 'PENDING_PAYMENT') {
        return (
            <div className="card-warm p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">快速支付</h3>
                        <p className="text-sm text-muted-foreground">邻里互助，即时完成</p>
                    </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">服务费用</span>
                        <span className="font-semibold">{order.pricing.baseAmount.formatted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">平台服务费</span>
                        <span className="font-semibold">{order.pricing.platformFee?.formatted || '¥0.00'}</span>
                    </div>
                    <div className="h-px bg-border my-2"></div>
                    <div className="flex justify-between">
                        <span className="font-bold">总计</span>
                        <span className="text-xl font-extrabold text-primary">
                            {order.pricing.total.formatted}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </div>
                )}

                <Button
                    onClick={handlePayNow}
                    disabled={loading}
                    className="w-full btn-action"
                    size="lg"
                >
                    {loading ? '处理中...' : `立即支付 ${order.pricing.total.formatted}`}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                    支付后邻居将收到通知，完成服务后自动结算
                </p>
            </div>
        );
    }

    // Provider view: Service accepted, waiting for completion
    if (order.status === 'ACCEPTED' || order.status === 'IN_PROGRESS') {
        const isProvider = true; // TODO: Check if current user is provider

        if (isProvider) {
            return (
                <div className="card-warm p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">等待完成</h3>
                            <p className="text-sm text-muted-foreground">
                                完成后点击下方按钮确认
                            </p>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm text-amber-900">
                            ⏰ 如果24小时内未操作，系统将自动完成订单并结算款项
                        </p>
                    </div>

                    <Button
                        onClick={handleMarkComplete}
                        disabled={loading}
                        className="w-full btn-action"
                        size="lg"
                    >
                        {loading ? '处理中...' : '确认完成服务'}
                    </Button>
                </div>
            );
        }
    }

    // Completed
    if (order.status === 'COMPLETED') {
        return (
            <div className="card-warm p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-green-700">服务已完成</h3>
                        <p className="text-sm text-muted-foreground">感谢您的信任</p>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-900">
                        🎉 恭喜！您获得了 <span className="font-bold">20 豆豆</span> 奖励
                    </p>
                </div>

                <Button
                    onClick={() => window.location.href = `/review/${order.id}`}
                    variant="outline"
                    className="w-full"
                >
                    写评价再得 20 豆豆 →
                </Button>
            </div>
        );
    }

    return null;
};

export default InstantPayFlow;
