import { useNavigate } from "react-router-dom";
import { Store, Shield, Zap, Heart, MessageSquare, Award, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";

const BecomeProvider = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();

    const handleApply = () => {
        if (!currentUser) {
            navigate('/register?role=PROVIDER');
        } else {
            navigate('/profile');
        }
    };

    const features = [
        {
            icon: Zap,
            title: "Quick Start",
            description: "Post your skills in minutes and start receiving requests from neighbors.",
            color: "text-amber-600",
            bg: "bg-amber-100"
        },
        {
            icon: Shield,
            title: "Trusted Identity",
            description: "Build reputation through our verification system and neighbor reviews.",
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            icon: MessageSquare,
            title: "Direct Chat",
            description: "Communicate directly with clients through our real-time messaging system.",
            color: "text-green-600",
            bg: "bg-green-100"
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container max-w-4xl py-12 px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-muted-foreground hover:text-foreground mb-8 group transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-xs">Go Back</span>
                </button>

                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                        <Store className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-4 leading-none">
                        Become a <span className="text-primary text-glow">Provider</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                        Share your skills, help your neighbors, and build a rewarding side business right in your community.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {features.map((feature, idx) => (
                        <Card key={idx} className="p-8 border-none shadow-card hover:shadow-warm transition-all duration-300 group">
                            <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-black mb-2 tracking-tight">{feature.title}</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>

                <div className="card-warm p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full -ml-32 -mb-32 blur-3xl" />

                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-6 tracking-tight">Ready to join the community?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={handleApply}
                                size="lg"
                                className="h-16 px-10 rounded-2xl text-lg font-black uppercase tracking-widest btn-action shadow-glow"
                            >
                                Get Started Now
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BecomeProvider;
