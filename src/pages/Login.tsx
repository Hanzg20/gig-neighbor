import { useState, useEffect } from "react";
import { User as UserIcon, Lock, ArrowRight, Mail, Eye, EyeOff, ShieldCheck, RefreshCw, KeyRound, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { UserRoleType } from "@/types/domain";
import { supabase } from "@/lib/supabase";
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
    const [rememberMe, setRememberMe] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const { currentUser } = useAuthStore();

    // Auto-navigate when user is loaded
    useEffect(() => {
        if (currentUser) {
            navigate("/");
        }
    }, [currentUser, navigate]);

    // Email validation
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError("请输入邮箱地址");
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError("请输入有效的邮箱地址");
            return false;
        }
        setEmailError(null);
        return true;
    };

    // Timer countdown for OTP resend
    useEffect(() => {
        if (timer > 0) {
            const countdown = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(countdown);
        }
    }, [timer]);

    // Load remembered email on mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('remembered_email');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setPasswordError(null);

        // Validate inputs
        if (!validateEmail(email)) {
            return;
        }

        if (!password) {
            setPasswordError("请输入密码");
            return;
        }

        setLoading(true);

        try {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (loginError) throw loginError;

            // Save email for next time if remember me is checked
            if (rememberMe) {
                localStorage.setItem('remembered_email', email);
            } else {
                localStorage.removeItem('remembered_email');
            }

            toast.success("正在进入社区...");
            // Direct call to speed up, but useEffect will handle the actual navigation
            useAuthStore.getState().initializeAuth(data.session);
        } catch (err: any) {
            const msg = err.message === 'Invalid login credentials' ? '邮箱或密码错误' :
                err.message === 'Email not confirmed' ? '邮箱未验证，请检查收件箱' :
                    err.message.includes('rate_limit') ? '登录尝试次数过多，请稍后再试' :
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
        setError(null);

        // Validate email
        if (!validateEmail(email)) {
            return;
        }

        setLoading(true);

        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: { emailRedirectTo: window.location.origin }
            });

            if (otpError) throw otpError;
            setOtpStep('VERIFY');
            setTimer(60);
            toast.success("验证码已发送到您的邮箱");
        } catch (err: any) {
            const msg = err.message.includes('rate_limit') ? '发送太频繁，请稍后再试' :
                "发送失败，请检查邮箱地址";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (otpCode.length !== 6) {
            setError("请输入6位验证码");
            return;
        }

        setLoading(true);
        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email: email.trim(),
                token: otpCode,
                type: 'magiclink'
            });
            if (verifyError) throw verifyError;
            toast.success("验证成功，正在登录...");
            await useAuthStore.getState().initializeAuth();
            navigate("/");
        } catch (err: any) {
            const msg = err.message.includes('expired') ? '验证码已过期，请重新获取' :
                "验证码无效，请重新输入";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = (role: 'BUYER' | 'SELLER') => {
        setLoading(true);
        const domainRole: UserRoleType = role === 'SELLER' ? 'PROVIDER' : 'BUYER';
        setTimeout(() => {
            login({
                // Use VALID UUIDs to avoid 400 Bad Request from Supabase
                id: role === 'BUYER'
                    ? '99999999-9999-9999-9999-999999999999' // Valid UUID format for Demo Buyer
                    : 'e1507f9e-7343-4474-a1da-301a213943ec', // Actual ID from Seed Script
                email: 'demo@justwedo.com',
                name: role === 'BUYER' ? '张三 (Demo)' : 'Eagleson Owner (Demo)',
                avatar: role === 'BUYER'
                    ? 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
                    : 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=100&h=100&fit=crop', // Car wash logo
                roles: [domainRole],
                permissions: domainRole === 'BUYER' ? ["VIEW_LISTINGS", "POST_REVIEW"] : ["MANAGE_LISTINGS", "VIEW_ORDERS"],
                joinedDate: '2025-01-01',
                beansBalance: 150,
                // Match the ID in SEED_EAGLESON_WASH.sql
                providerProfileId: domainRole === 'PROVIDER' ? '0588656d-2305-4f40-9669-026815ec5521' : undefined
            });
            setLoading(false);
            navigate(domainRole === 'PROVIDER'
                ? '/provider/0588656d-2305-4f40-9669-026815ec5521?tab=inventory' // Direct to Inventory for convenience
                : '/'
            );
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
                    <p className="opacity-80 text-sm text-white">登录 JUSTWEDO 社区</p>
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
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError(null);
                                    }}
                                    onBlur={() => validateEmail(email)}
                                    placeholder="电子邮箱"
                                    className={`w-full pl-12 pr-4 py-4 rounded-xl border bg-muted/30 focus:border-primary focus:bg-background transition-all outline-none ${emailError ? 'border-red-500' : ''
                                        }`}
                                />
                                {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError(null);
                                    }}
                                    placeholder="请输入密码"
                                    className={`w-full pl-12 pr-12 py-4 rounded-xl border bg-muted/30 focus:border-primary focus:bg-background transition-all outline-none ${passwordError ? 'border-red-500' : ''
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
                            </div>

                            {/* Remember Me and Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-muted-foreground">记住我</span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary hover:underline font-medium"
                                >
                                    忘记密码？
                                </Link>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-start gap-2 animate-in fade-in duration-200">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button type="submit" className="w-full py-6 font-bold text-lg rounded-xl btn-action" disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        登录中...
                                    </div>
                                ) : '立即登录'}
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
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setEmailError(null);
                                            }}
                                            onBlur={() => validateEmail(email)}
                                            placeholder="电子邮箱"
                                            className={`w-full pl-12 pr-4 py-4 rounded-xl border bg-muted/30 focus:border-primary focus:bg-background transition-all outline-none ${emailError ? 'border-red-500' : ''
                                                }`}
                                        />
                                        {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
                                    </div>
                                    <Button type="submit" className="w-full py-6 font-bold text-lg rounded-xl btn-action" disabled={loading || timer > 0}>
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                发送中...
                                            </div>
                                        ) : timer > 0 ? (
                                            `重新发送 (${timer}秒)`
                                        ) : (
                                            '发送验证码'
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <p className="text-sm text-blue-700">
                                            📧 验证码已发送至 <strong>{email}</strong>
                                        </p>
                                    </div>
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
                                            autoFocus
                                        />
                                    </div>
                                    <Button type="submit" className="w-full py-6 font-bold text-lg rounded-xl btn-action" disabled={loading || otpCode.length !== 6}>
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                验证中...
                                            </div>
                                        ) : '确认登录'}
                                    </Button>
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOtpStep('SEND');
                                                setOtpCode('');
                                                setError(null);
                                            }}
                                            className="text-sm text-muted-foreground hover:text-primary"
                                        >
                                            ← 返回修改邮箱
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (timer === 0) {
                                                    handleSendOtp(new Event('submit') as any);
                                                }
                                            }}
                                            disabled={timer > 0}
                                            className={`text-sm font-medium ${timer > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:underline'}`}
                                        >
                                            {timer > 0 ? `重新发送(${timer}s)` : '重新发送'}
                                        </button>
                                    </div>
                                </form>
                            )}
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-start gap-2 animate-in fade-in duration-200">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
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
