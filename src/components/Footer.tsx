import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 py-12">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-hero flex items-center justify-center">
                <span className="text-xl">🤝</span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gradient">HangHand</h3>
                <p className="text-xs text-muted-foreground">恒帮</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              邻里互助，恒心相帮。让每一次服务都充满温度。
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">服务</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">家政保洁</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">维修服务</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">搬家运输</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">跑腿代购</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">关于</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">关于我们</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">成为服务者</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">帮助中心</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">联系我们</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">法律</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">用户协议</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">隐私政策</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">服务条款</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © 2025 HangHand. Made with <Heart className="w-4 h-4 text-accent fill-accent" /> in Canada
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">🇨🇦 English</span>
            <span className="text-sm text-primary font-medium">🇨🇳 中文</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
