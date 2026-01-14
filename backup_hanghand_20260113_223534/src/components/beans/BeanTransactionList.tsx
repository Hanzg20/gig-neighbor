import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Gift, Star, Users, ShoppingBag, Coffee } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { BeanTransaction } from "@/types/domain";

export const BeanTransactionList = () => {
    const { transactions, isLoading, error } = useTransactions();

    const getIcon = (tx: BeanTransaction) => {
        const type = tx.type;
        const reason = (tx.descriptionZh || '').toLowerCase();

        if (reason.includes('review') || type === 'STORY_BONUS') return <Star className="w-4 h-4" />;
        if (type === 'GIFT') return <Gift className="w-4 h-4" />;
        if (type === 'NEIGHBOR_VOUCH') return <Users className="w-4 h-4" />;
        if (type === 'DAILY_LOGIN') return <Coffee className="w-4 h-4" />;
        return <ShoppingBag className="w-4 h-4" />;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return '刚刚';
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffHours < 168) return `${Math.floor(diffHours / 24)}天前`;
        return date.toLocaleDateString('zh-CN');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500">
                <p>加载记录失败</p>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <Gift className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">还没有豆豆记录</p>
                <p className="text-sm text-muted-foreground mt-1">完成订单或每日签到即可获得奖励</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((tx) => {
                const isEarned = tx.amount > 0;
                return (
                    <div
                        key={tx.id}
                        className="card-warm p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEarned
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                                    : 'bg-red-100 dark:bg-red-900/20 text-red-600'
                                    }`}>
                                    {getIcon(tx)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold mb-1">{tx.descriptionZh || tx.type}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(tx.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                                {isEarned ? (
                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`text-lg font-bold ${isEarned
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}>
                                    {isEarned ? '+' : ''}{tx.amount}
                                </span>
                            </div>
                        </div>

                        {(tx as any).relatedOrderId && (
                            <div className="mt-3 pt-3 border-t border-border">
                                <a
                                    href={`/orders/${(tx as any).relatedOrderId}`}
                                    className="text-xs text-primary hover:underline"
                                >
                                    查看订单详情 →
                                </a>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BeanTransactionList;
