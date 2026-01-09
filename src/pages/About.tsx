import { motion } from "framer-motion";
import { Users, Building2, Cpu, ShieldCheck, Heart, MapPin, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useConfigStore } from "@/stores/configStore";

const About = () => {
    const { language } = useConfigStore();

    const content = {
        zh: {
            title: "关于恒帮",
            subtitle: "(社区 × 专业人士 × 本地商家 × AI)",
            intro: "恒帮（HangHand） 是一个面向本地社区的便民服务平台，连接邻里互助、区域内有资质的专业人士，以及本地商家，通过技术与人工智能赋能，构建一种更高效、更可信的新型社区关系。",
            missionTitle: "我们的使命",
            missionText: "在社区生活中，人们既需要邻居之间的相互帮忙，也需要专业可靠的服务支持。恒帮不仅让邻里互助更容易发生，也为具备合法资质的专业人士（如维修、技术、教育、出行等）以及本地商家，提供一个直接服务社区的数字化平台。",
            visionTitle: "共享资源的网络",
            visionText: "我们相信，社区不只是居住空间，更是一个可以彼此支持、共享资源的网络。通过恒帮，居民可以在一个平台内完成需求发布、服务匹配与沟通协作，让日常生活中的各种需求变得更简单、更透明。",
            aiTitle: "AI 赋能社区",
            aiText: "恒帮引入人工智能技术，用于优化需求匹配、提升沟通效率，并帮助社区更好地理解和响应真实的生活需求。技术不是取代人与人之间的关系，而是让这些关系变得更顺畅、更有温度。",
            pilotTitle: "渥太华试点",
            pilotText: "目前，恒帮正在 渥太华（Ottawa） 进行社区试点，联合居民、专业服务者与本地商家，共同探索一种更可持续、更贴近生活的社区服务模式。",
            tagline: "恒帮 —— 让生活更轻松"
        },
        en: {
            title: "About HangHand",
            subtitle: "(Community × Professionals × Local Commerce × AI)",
            intro: "HangHand is a community-based platform designed to connect neighbors, licensed local professionals, and trusted businesses — all in one place.",
            missionTitle: "Our Mission",
            missionText: "Everyday community life relies on more than just neighborly help. People also need reliable professional services and convenient access to local businesses they can trust. HangHand brings these elements together, creating a practical, technology-enabled ecosystem for modern community living.",
            visionTitle: "A Resource-Sharing Network",
            visionText: "Our platform enables neighbors to help one another, while also allowing qualified professionals and local merchants to offer their services directly within the community. By combining peer support with professional expertise, HangHand helps residents find the right kind of help — quickly and transparently.",
            aiTitle: "AI Powered Community",
            aiText: "At the core of HangHand is a belief that strong communities are built on connection, trust, and accessibility. We use AI-powered tools to improve service matching, streamline communication, and better understand real community needs. Technology, in our view, should strengthen human connections, not replace them.",
            pilotTitle: "Ottawa Pilot",
            pilotText: "HangHand is currently piloting in Ottawa, working closely with residents, professionals, and local businesses to build a smarter, more connected community service platform.",
            tagline: "HangHand — Help from your neighbour, made easy."
        }
    };

    const t = language === 'zh' ? content.zh : content.en;

    const sections = [
        {
            icon: <ShieldCheck className="w-8 h-8 text-primary" />,
            title: t.missionTitle,
            text: t.missionText
        },
        {
            icon: <Users className="w-8 h-8 text-secondary" />,
            title: t.visionTitle,
            text: t.visionText
        },
        {
            icon: <Cpu className="w-8 h-8 text-accent" />,
            title: t.aiTitle,
            text: t.aiText
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container max-w-4xl py-12 md:py-20">
                {/* Hero section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4">
                        <Sparkles className="w-3 h-3" />
                        Our Vision
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        {t.title}
                    </h1>
                    <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-8">
                        {t.subtitle}
                    </p>
                    <div className="p-8 rounded-[40px] bg-card/50 backdrop-blur-xl border border-white/20 shadow-warm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Building2 className="w-32 h-32 text-primary" />
                        </div>
                        <p className="text-xl md:text-2xl font-medium leading-relaxed text-foreground/90 relative z-10">
                            {t.intro}
                        </p>
                    </div>
                </motion.div>

                {/* Main sections */}
                <div className="grid gap-8 mb-16">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col md:flex-row gap-6 p-8 rounded-[32px] bg-white/40 border border-white/20 hover:shadow-warm transition-all duration-500 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-card flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                                {section.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-black mb-3 text-foreground group-hover:text-primary transition-colors">
                                    {section.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed font-medium">
                                    {section.text}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Pilot section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative p-12 rounded-[48px] bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border border-white/30 text-center overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.05),transparent)] pointer-events-none" />

                    <div className="w-12 h-12 rounded-full bg-white shadow-glow-sm flex items-center justify-center mx-auto mb-6">
                        <MapPin className="w-6 h-6 text-primary" />
                    </div>

                    <h2 className="text-2xl font-black mb-4">{t.pilotTitle}</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-medium">
                        {t.pilotText}
                    </p>

                    <div className="flex items-center justify-center gap-2">
                        <Heart className="w-5 h-5 text-accent fill-accent" />
                        <span className="text-xl font-black tracking-tight text-primary">
                            {t.tagline}
                        </span>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
