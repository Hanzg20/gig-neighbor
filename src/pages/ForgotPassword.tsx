import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) throw resetError;

            setSuccess(true);
            toast.success("重置链接已发送");

            // Start countdown for resend button
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err: any) {
            const msg = err.message.includes('rate_limit')
                ? '操作太频繁，请稍后再试'
                : err.message.includes('not found')
                    ? '该邮箱尚未注册'
                    : "发送失败，请检查邮箱地址";
            setError(msg);
            toast.error(msg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        await handleResetPassword(new Event('submit') as any);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
                <div className="bg-card w-full max-w-md rounded-3xl shadow-xl p-8 space-y-6">
                    {/* Success Icon Animation */}
                    <div className="relative">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <div className="absolute inset-0 w-20 h-20 bg-green-100 rounded-full mx-auto animate-ping" />
                    </div>

                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-bold">邮件已发送</h2>
                        <p className="text-muted-foreground">
                            我们已向 <span className="font-semibold text-foreground break-all">{email}</span> 发送了密码重置链接
                        </p>
                        <p className="text-sm text-muted-foreground">
                            请检查您的收件箱并点击链接重置密码
                        </p>
                    </div>

                    {/* Tips */}
                    <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="text-sm text-muted-foreground">
                                <p>没有收到邮件？请检查垃圾邮件文件夹</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full py-6 font-bold text-lg rounded-xl"
                            onClick={handleResend}
                            disabled={countdown > 0}
                        >
                            {countdown > 0 ? (
                                <>重新发送 ({countdown}秒)</>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 w-5 h-5" />
                                    重新发送
                                </>
                            )}
                        </Button>

                        <Button
                            className="w-full py-6 font-bold text-lg rounded-xl btn-action"
                            onClick={() => navigate('/login')}
                        >
                            返回登录
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-3xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-hero p-8 text-center text-white">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-glow">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">忘记密码</h1>
                    <p className="opacity-80 text-sm text-white">我们将发送重置链接到您的邮箱</p>
                </div>

                {/* Form */}
                <form onSubmit={handleResetPassword} className="p-8 space-y-6 bg-background">
                    <div className="space-y-4">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                输入您的注册邮箱
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border bg-muted/30 focus:border-primary focus:bg-background transition-all outline-none"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Info Message */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm text-blue-700">
                                💡 发送重置链接后，请在 <strong>1小时内</strong> 完成密码重置
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 animate-in fade-in duration-200">
                                ⚠️ {error}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            type="submit"
                            className="w-full py-6 font-bold text-lg rounded-xl btn-action"
                            disabled={loading || !email}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    发送中...
                                </div>
                            ) : (
                                '发送重置链接'
                            )}
                        </Button>

                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="font-medium">返回登录</span>
                        </Link>
                    </div>

                    {/* Footer Links */}
                    <div className="pt-4 border-t text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            还没有账号？
                            <Link to="/register" className="text-primary font-bold hover:underline ml-1">
                                立即注册
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;