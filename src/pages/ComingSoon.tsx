import { useNavigate } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useConfigStore } from "@/stores/configStore";

const ComingSoon = () => {
    const navigate = useNavigate();
    const { language } = useConfigStore();

    const t = {
        title: language === 'zh' ? '功能开发中' : 'Coming Soon',
        desc: language === 'zh' ? '该功能正在全力开发中，敬请期待！' : 'This feature is currently under development. Stay tuned!',
        back: language === 'zh' ? '返回上一页' : 'Go Back',
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                    <Construction className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black mb-4">{t.title}</h1>
                <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                    {t.desc}
                </p>
                <Button
                    onClick={() => navigate(-1)}
                    variant="default"
                    className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t.back}
                </Button>
            </div>
            <Footer />
        </div>
    );
};

export default ComingSoon;
