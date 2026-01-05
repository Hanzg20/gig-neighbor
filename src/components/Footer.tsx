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
                <p className="text-xs text-muted-foreground">Neighborly</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Neighborly help, heartfelt support. Making every service feel warm and trusted.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cleaning</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Repair</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Moving</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Errands</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">About</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Become a Pro</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">User Agreement</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
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
