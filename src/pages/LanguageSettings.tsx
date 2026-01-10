import { useNavigate } from "react-router-dom";
import { ChevronLeft, Languages, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useConfigStore } from "@/stores/configStore";
import { useAuthStore } from "@/stores/authStore";
import { repositoryFactory } from "@/services/repositories/factory";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

const LanguageSettings = () => {
    const navigate = useNavigate();
    const { language, setLanguage } = useConfigStore();
    const { currentUser, updateUser } = useAuthStore();
    const authRepository = repositoryFactory.getAuthRepository();

    const handleLanguageChange = async (newLang: 'en' | 'zh') => {
        setLanguage(newLang);

        if (currentUser) {
            try {
                // Keep existing settings and only update language
                const currentSettings = currentUser.settings || {
                    language: 'en',
                    notifications: { email: true, push: true }
                };

                const updatedUser = await authRepository.updateProfile(currentUser.id, {
                    settings: {
                        ...currentSettings,
                        language: newLang
                    }
                });
                updateUser(updatedUser);
            } catch (error) {
                console.error('Failed to sync language to backend:', error);
                // We don't toast error here to avoid interrupting the instant UI change
            }
        }
    };

    const t = {
        title: language === 'zh' ? '语言设置' : 'Language Settings',
        desc: language === 'zh' ? '选择您偏好的显示语言' : 'Choose your preferred display language',
    };

    const languages = [
        { code: 'zh', name: '简体中文', native: 'Chinese (Simplified)' },
        { code: 'en', name: 'English', native: 'English' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
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
                    <div>
                        <h1 className="text-2xl font-black">{t.title}</h1>
                        <p className="text-sm text-muted-foreground font-medium">{t.desc}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {languages.map((lang) => (
                        <motion.button
                            key={lang.code}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleLanguageChange(lang.code as 'en' | 'zh')}
                            className={`w-full p-6 flex items-center justify-between rounded-3xl border transition-all ${language === lang.code
                                ? 'bg-primary/5 border-primary shadow-sm'
                                : 'bg-card/50 border-muted-foreground/10 hover:border-primary/30'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${language === lang.code ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    <Languages className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-lg">{lang.name}</p>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{lang.native}</p>
                                </div>
                            </div>

                            {language === lang.code && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground"
                                >
                                    <Check className="w-5 h-5" />
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-muted/30 rounded-3xl border border-muted-foreground/5">
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                        {language === 'zh'
                            ? '提示：更改语言后，应用内的所有菜单和系统提示将立即切换。部分用户生成的内容（如动态、商品描述）将保持原始发布语言。'
                            : 'Note: After changing the language, all menus and system prompts will update immediately. User-generated content (posts, descriptions) will remain in their original language.'}
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default LanguageSettings;
