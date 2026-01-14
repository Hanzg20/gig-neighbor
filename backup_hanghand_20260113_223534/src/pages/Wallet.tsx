import { useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, History, PlusCircle, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { repositoryFactory } from "@/services/repositories/factory";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const Wallet = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const { language } = useConfigStore();
    const beanRepository = repositoryFactory.getBeanRepository();

    const { data: transactions, isLoading: isLoadingTx } = useQuery({
        queryKey: ['wallet-transactions', currentUser?.id],
        queryFn: () => currentUser ? beanRepository.getTransactions(currentUser.id) : Promise.resolve([]),
        enabled: !!currentUser,
    });

    const { data: balance, isLoading: isLoadingBalance } = useQuery({
        queryKey: ['wallet-balance', currentUser?.id],
        queryFn: () => currentUser ? beanRepository.getBalance(currentUser.id) : Promise.resolve(0),
        enabled: !!currentUser,
    });

    const t = {
        title: language === 'zh' ? '金豆钱包' : 'JinBean Wallet',
        balance: language === 'zh' ? '当前余额' : 'Current Balance',
        topUp: language === 'zh' ? '立即充值' : 'Top Up Now',
        history: language === 'zh' ? '收支明细' : 'Transaction History',
        noHistory: language === 'zh' ? '暂无交易记录' : 'No recent transactions',
        beanUnit: language === 'zh' ? '个' : 'Beans',
        loading: language === 'zh' ? '加载中...' : 'Loading...',
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container max-w-2xl py-8 px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/profile')}
                        className="rounded-full"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-black">{t.title}</h1>
                </div>

                {/* Balance Card */}
                <div className="relative overflow-hidden p-8 rounded-[40px] bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white shadow-2xl shadow-orange-500/20 mb-10">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 opacity-80">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">{t.balance}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            {isLoadingBalance ? (
                                <Loader2 className="w-10 h-10 animate-spin opacity-50" />
                            ) : (
                                <>
                                    <span className="text-6xl font-black tabular-nums">{balance ?? currentUser?.beansBalance}</span>
                                    <span className="text-xl font-bold opacity-80">🫘</span>
                                </>
                            )}
                        </div>

                        <div className="mt-10 flex gap-4">
                            <Button className="flex-1 h-14 bg-white text-orange-600 hover:bg-white/90 rounded-2xl font-black shadow-lg shadow-black/5 transition-all active:scale-95 flex items-center gap-2">
                                <PlusCircle className="w-5 h-5" />
                                {t.topUp}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-14 h-14 border-white/30 bg-white/10 text-white hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all active:scale-95"
                            >
                                <History className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                        <History className="w-4 h-4" />
                        {t.history}
                    </h3>

                    <div className="space-y-3">
                        {isLoadingTx ? (
                            <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">{t.loading}</p>
                            </div>
                        ) : transactions && transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-5 rounded-3xl bg-card border border-muted-foreground/5 hover:border-primary/20 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {tx.amount > 0 ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm leading-tight mb-1">{language === 'zh' ? tx.descriptionZh : (tx.descriptionEn || tx.descriptionZh)}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold tracking-widest">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className={`text-lg font-black tabular-nums ${tx.amount > 0 ? 'text-green-600' : 'text-foreground'
                                        }`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-muted/20 rounded-[40px] border border-dashed border-muted-foreground/20">
                                <p className="text-sm text-muted-foreground font-medium">{t.noHistory}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Wallet;
