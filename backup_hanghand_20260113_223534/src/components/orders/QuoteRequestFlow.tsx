import { useState } from "react";
import { FileText, Send, CheckCircle2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/orders";

interface QuoteRequestFlowProps {
    order: Order;
    onQuoteSubmit?: (quoteAmount: number, notes: string) => void;
    onQuoteAccept?: () => void;
}

/**
 * Quote & Call Flow (JinBean Pattern 2)
 * Use Case: Professional services in Kanata pilot (e.g., electrician, plumber)
 * Flow: Provider sends quote → Buyer reviews → Accept/Reject → Authorize hold → Complete & Invoice
 */
export const QuoteRequestFlow = ({ order, onQuoteSubmit, onQuoteAccept }: QuoteRequestFlowProps) => {
    const [quoteAmount, setQuoteAmount] = useState<string>("");
    const [quoteNotes, setQuoteNotes] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const isProvider = true; // TODO: Check from auth store
    const hasQuote = (order.metadata as any)?.customQuote; // Check if quote exists

    const handleSubmitQuote = async () => {
        if (!quoteAmount || parseFloat(quoteAmount) <= 0) {
            alert("请输入有效的报价金额");
            return;
        }

        setLoading(true);
        try {
            const amount = parseFloat(quoteAmount) * 100; // Convert to cents
            onQuoteSubmit?.(amount, quoteNotes);

            // In production: Update order with quote via API
            alert("报价已发送给客户");
        } catch (error) {
            console.error(error);
            alert("发送失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptQuote = async () => {
        setLoading(true);
        try {
            onQuoteAccept?.();

            // In production: Authorize payment hold via Stripe
            alert("已接受报价，款项已预授权");
        } catch (error) {
            console.error(error);
            alert("操作失败，请重试");
        } finally {
            setLoading(false);
        }
    };

    // Provider View: Send Quote
    if (isProvider && !hasQuote && order.status === 'PENDING_CONFIRMATION') {
        return (
            <div className="card-warm p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">发送报价</h3>
                        <p className="text-sm text-muted-foreground">根据需求提供详细报价</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-2">服务费用 (CAD)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <input
                                type="number"
                                value={quoteAmount}
                                onChange={(e) => setQuoteAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-3 rounded-xl border bg-muted/30 focus:border-primary focus:bg-background transition-all outline-none"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">说明（可选）</label>
                        <textarea
                            value={quoteNotes}
                            onChange={(e) => setQuoteNotes(e.target.value)}
                            placeholder="例如：包含材料费、预计2小时完成"
                            className="w-full px-4 py-3 rounded-xl border bg-muted/30 focus:border-primary focus:bg-background transition-all outline-none min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-900">
                        💡 <strong>提示：</strong>清晰的报价有助于建立信任。可以包含：
                    </p>
                    <ul className="text-xs text-blue-800 mt-2 ml-4 list-disc space-y-1">
                        <li>具体的服务内容</li>
                        <li>预计完成时间</li>
                        <li>是否包含材料费</li>
                        <li>额外费用说明（如有）</li>
                    </ul>
                </div>

                <Button
                    onClick={handleSubmitQuote}
                    disabled={loading || !quoteAmount}
                    className="w-full btn-action gap-2"
                    size="lg"
                >
                    <Send className="w-5 h-5" />
                    {loading ? '发送中...' : '发送报价给客户'}
                </Button>
            </div>
        );
    }

    // Buyer View: Review Quote
    if (!isProvider && hasQuote && order.status === 'PENDING_CONFIRMATION') {
        const quoteAmountDisplay = ((order.metadata as any)?.customQuote / 100).toFixed(2);

        return (
            <div className="card-warm p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">专业人士已报价</h3>
                        <p className="text-sm text-muted-foreground">请仔细审阅并决定是否接受</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 space-y-3">
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground">服务费用</span>
                        <span className="text-3xl font-extrabold text-amber-900">${quoteAmountDisplay}</span>
                    </div>

                    {quoteNotes && (
                        <div className="pt-3 border-t border-amber-200">
                            <p className="text-sm font-medium text-amber-900 mb-1">服务说明：</p>
                            <p className="text-sm text-amber-800">{quoteNotes}</p>
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-900">
                        ✅ <strong>安全保障：</strong>接受报价后，款项将被{" "}
                        <span className="font-bold">预授权</span>（不会立即扣款）。服务完成并确认后才会支付给服务商。
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        onClick={() => alert('已拒绝报价')}
                        disabled={loading}
                    >
                        拒绝报价
                    </Button>
                    <Button
                        onClick={handleAcceptQuote}
                        disabled={loading}
                        className="btn-action gap-2"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        {loading ? '处理中...' : '接受报价'}
                    </Button>
                </div>
            </div>
        );
    }

    // Accepted Quote - Waiting for Service
    if (order.status === 'IN_PROGRESS') {
        return (
            <div className="card-warm p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-green-700">报价已接受</h3>
                        <p className="text-sm text-muted-foreground">
                            {isProvider ? '请按约定时间完成服务' : '等待服务商完成'}
                        </p>
                    </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">预授权金额</span>
                        <span className="font-bold">${(order.pricing?.total?.amount || 0 / 100).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        {isProvider
                            ? "完成服务后，请提交完工证明（如照片），客户确认后即可收款"
                            : "服务完成后，您将收到通知进行确认"}
                    </p>
                </div>
            </div>
        );
    }

    return null;
};

export default QuoteRequestFlow;
