import { Users, ArrowRight, Sparkles } from "lucide-react";

const CommunityBanner = () => {
  return (
    <section className="py-8 container">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-primary-foreground/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              新功能上线
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-3">
              加入社区广场，分享你的故事
            </h2>
            <p className="text-primary-foreground/80 max-w-lg">
              展示你的服务成果，获得邻居们的认可。每张照片都是信任的证明。
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-12 h-12 rounded-full border-3 border-primary object-cover"
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-primary-foreground">
              <Users className="w-5 h-5" />
              <span className="font-bold">2,500+</span>
              <span className="text-primary-foreground/80">邻居</span>
            </div>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary-foreground text-primary font-bold shadow-lg hover:scale-105 transition-transform">
            立即加入
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CommunityBanner;
