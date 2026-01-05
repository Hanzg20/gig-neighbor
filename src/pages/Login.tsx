import { useState, useEffect } from "react";
import { User as UserIcon, Lock, ArrowRight, Mail, Eye, EyeOff, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { UserRoleType } from "@/types/domain";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loginMode, setLoginMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
    const [otpStep, setOtpStep] = useState<'SEND' | 'VERIFY'>('SEND');
    const [timer, setTimer] = useState(0);
    const { currentUser } = useAuthStore();

    // Auto-navigate when user is loaded
    useEffect(() => {
        if (currentUser) {
            navigate("/");
        }
    }, [currentUser, navigate]);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) throw loginError;

            toast.success("正在进入社区...");
            // Direct call to speed up, but useEffect will handle the actual navigation
            useAuthStore.getState().initializeAuth(data.session);
        } catch (err: any) {
            const msg = err.message === 'Invalid login credentials' ? '邮箱或密码错误' :
                err.message === 'Email not confirmed' ? '邮箱未验证，请检查收件箱' :
                    "登录失败，请稍后重试";
            setError(msg);
            toast.error(msg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: window.location.origin }
            });

            if (otpError) throw otpError;
            setOtpStep('VERIFY');
            setTimer(60);
            toast.success("验证码已发送");
        } catch (err: any) {
            setError(err.message || "发送失败");
            toast.error("验证码发送失败");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: otpCode,
                type: 'magiclink'
            });
            if (verifyError) throw verifyError;
            toast.success("验证成功，正在登录...");
            await useAuthStore.getState().initializeAuth();
            navigate("/");
        } catch (err: any) {
            setError("验证码错误");
            toast.error("验证码无效");
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = (role: 'BUYER' | 'SELLER') => {
        setLoading(true);
        const domainRole: UserRoleType = role === 'SELLER' ? 'PROVIDER' : 'BUYER';
        setTimeout(() => {
            login({
                id: role === 'BUYER' ? 'u1' : 'p1',
                email: 'demo@hanghand.com',
                name: role === 'BUYER' ? '张三 (Demo)' : '李阿姨 (Demo Provider)',
                avatar: role === 'BUYER'
                    ? 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
                    : 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100&h=100&fit=crop',
                roles: [domainRole],
                permissions: domainRole === 'BUYER' ? ["VIEW_LISTINGS", "POST_REVIEW"] : ["MANAGE_LISTINGS", "VIEW_ORDERS"],
                joinedDate: '2025-01-01',
                beansBalance: 150,
                providerProfileId: domainRole === 'PROVIDER' ? 'pp1' : undefined
            });
            setLoading(false);
            navigate(domainRole === 'PROVIDER' ? '/profile' : '/');
        }, 500);
    };

    return (
        <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-3xl shadow-xl overflow-hidden flex flex-col">
                <div className="bg-gradient-hero p-8 text-center text-white">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-glow">
                        <span className="text-3xl font-bold">H</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">欢迎回来</h1>
                    <p className="opacity-80 text-sm text-white">登录 HangHand 社区</p>
                </div>

                <div className="flex border-b bg-muted/20">
                    <button
                        onClick={() => { setLoginMode('PASSWORD'); setError(null); }}
                        className={`flex-1 py-4 text-sm font-bold transition-all ${loginMode === 'PASSWORD' ? 'text-primary border-b-2 border-primary bg-background' : 'text-muted-foreground'}`}
                    >
                        密码登录
                    </button>
                    <button
                        onClick={() => { setLoginMode('OTP'); setError(null); }}
                        className={`flex-1 py-4 text-sm font-bold transition-all ${loginMode === 'OTP' ? 'text-primary border-b-2 border-primary bg-background' : 'text-muted-foreground'}`}
                    >
                        验证码登录
                    </button>
                </div>

                <div className="p-8 space-y-6 flex-1 bg-background">
                    {loginMode === 'PASSWORD' ? (
                        <form onSubmit={handlePasswordLogin} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="电子邮箱"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border bg-muted/30 focus:border-primary focus:bg-background transition-all outline-none"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="请输入密码"
                                    className="w-full pl-12 pr-12 py-4 rounded-xl border bg-muted/30 focus:border-primary focus:bg-background transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {error && <p className="text-xs text-red-600 px-1">⚠️ {error}</p>}

                            <Button type="submit" className="w-full py-6 font-bold text-lg rounded-xl btn-action" disabled={loading}>
                                {loading ? '登录中...' : '立即登录'}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            {otpStep === 'SEND' ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="电子邮箱"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border bg-muted/30 focus:border-primary focus:bg-background transition-all outline-none"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full py-6 font-bold text-lg rounded-xl btn-action" disabled={loading}>
                                        {loading ? '发送中...' : '发送验证码'}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                            placeholder="6位验证码"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border bg-muted/30 focus:border-primary focus:bg-background tracking-[0.5em] font-mono text-center text-xl outline-none"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full py-6 font-bold text-lg rounded-xl btn-action" disabled={loading || otpCode.length !== 6}>
                                        {loading ? '验证中...' : '确认登录'}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setOtpStep('SEND')}
                                        className="w-full text-center text-sm text-muted-foreground hover:text-primary"
                                    >
                                        返回修改邮箱
                                    </button>
                                </form>
                            )}
                            {error && <p className="text-xs text-red-600 px-1">⚠️ {error}</p>}
                        </div>
                    )}

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground italic">或者使用演示账号</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleDemoLogin('BUYER')} className="p-4 rounded-xl bg-orange-50/50 border border-orange-100 hover:border-orange-200 transition-all text-center group">
                            <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">🙋</span>
                            <p className="font-bold text-xs text-orange-700">我是买家</p>
                        </button>
                        <button onClick={() => handleDemoLogin('SELLER')} className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 hover:border-blue-200 transition-all text-center group">
                            <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">🛠️</span>
                            <p className="font-bold text-xs text-blue-700">我是卖家</p>
                        </button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        还没有账号？
                        <Link to="/register" className="text-primary font-bold hover:underline ml-1">立即注册</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
