import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useConfigStore } from "@/stores/configStore";

const Footer = () => {
  const { language } = useConfigStore();

  const t = {
    services: language === 'zh' ? '服务' : 'Services',
    cleaning: language === 'zh' ? '保洁' : 'Cleaning',
    repair: language === 'zh' ? '维修' : 'Repair',
    moving: language === 'zh' ? '搬家' : 'Moving',
    errands: language === 'zh' ? '跑腿' : 'Errands',
    about: language === 'zh' ? '关于' : 'About',
    aboutUs: language === 'zh' ? '关于我们' : 'About Us',
    becomePro: language === 'zh' ? '成为服务商' : 'Become a Pro',
    helpCenter: language === 'zh' ? '帮助中心' : 'Help Center',
    contactUs: language === 'zh' ? '联系我们' : 'Contact Us',
    legal: language === 'zh' ? '法律' : 'Legal',
    userAgreement: language === 'zh' ? '用户协议' : 'User Agreement',
    privacy: language === 'zh' ? '隐私政策' : 'Privacy Policy',
    terms: language === 'zh' ? '服务条款' : 'Terms of Service',
    slogan: language === 'zh' ? '一个连接渥太华邻居、专业人士和商家的本地便民服务平台，让生活和办事更轻松，更放心' : 'A local platform connecting Ottawa neighbors, professionals, and businesses for easy, trusted services.',
    madeIn: language === 'zh' ? '加拿大制作' : 'Made with',
    inCanada: language === 'zh' ? '' : 'in Canada', // "Made with <love> in Canada" structure handling
    brandName: language === 'zh' ? '渥帮' : 'JUSTWEDO',
  };

  return (
    <footer className="bg-card border-t border-border/50 py-12">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="JUSTWEDO" className="w-10 h-10 rounded-2xl object-cover shadow-warm" />
              <div>
                <h3 className="text-xl font-extrabold text-gradient">{t.brandName}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Powered by JUSTWEDO</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.slogan}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">{t.services}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.cleaning}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.repair}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.moving}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.errands}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">{t.about}</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.aboutUs}</Link></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.becomePro}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.helpCenter}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.contactUs}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">{t.legal}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.userAgreement}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.privacy}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.terms}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 <a href="https://goldsky.jinbean.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-bold">GoldSky Technologies</a>. All rights reserved.
          </p>
          <div className="flex items-center gap-4 opacity-50">
            {/* Simple indicator since it's controlled in header */}
            <span className="text-sm text-muted-foreground">
              {language === 'zh' ? '🇨🇳 中文' : '🇨🇦 English'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
