import { Shield, Github, Twitter, Linkedin } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const footerLinks = {
    product: [
      { name: t('verifyCertificate'), path: "/verify" },
      { name: t('myCertificates'), path: "/certificates" },
      { name: t('issueCertificate'), path: "/issue" },
    ],
    company: [
      { name: t('aboutUs'), path: "/about" },
      { name: t('contact'), path: "/contact" },
      { name: t('support'), path: "/support" },
      { name: t('faq'), path: "/#faq" },
    ],
    legal: [
      { name: t('privacyPolicy'), path: "/privacy" },
      { name: t('termsOfService'), path: "/terms" },
      { name: t('security'), path: "/security" },
    ],
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path === "/#faq") {
      e.preventDefault();
      if (location.pathname === "/") {
        // Already on home page, just scroll
        const faqSection = document.getElementById("faq");
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        // Navigate to home page with hash
        navigate("/#faq");
      }
    }
  };

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-accent" />
              <span className="font-heading text-xl font-bold">Ordinals</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footerTagline')}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-secondary/50 hover:bg-accent/20 border border-border/50 hover:border-accent/50 flex items-center justify-center transition-all group"
                >
                  <social.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('product')}</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('company')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={(e) => handleNavClick(e, link.path)}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('legal')}</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t('allRightsReserved', { year: currentYear })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('builtWith')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
