import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

const Footer = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sections = useMemo(() => ([
    {
      id: "about",
      title: "MoneyControl Cards",
      content: (
        <div className="space-y-3 text-sm opacity-80 leading-relaxed">
          <p>Helping Indians make smarter credit card decisions with personalized recommendations, detailed comparisons, and expert insights.</p>
        </div>
      )
    },
    {
      id: "links",
      title: "Quick Links",
      content: (
        <ul className="space-y-3 text-sm opacity-80">
          <li><Link to="/" className="hover:opacity-100 transition-opacity">Home</Link></li>
          <li><Link to="/cards" className="hover:opacity-100 transition-opacity">Discover Cards</Link></li>
          <li><Link to="/card-genius" className="hover:opacity-100 transition-opacity">AI Card Genius</Link></li>
          <li><Link to="/card-genius-category" className="hover:opacity-100 transition-opacity">AI Category Card Genius</Link></li>
          <li><Link to="/beat-my-card" className="hover:opacity-100 transition-opacity">Beat My Card</Link></li>
          <li><button className="hover:opacity-100 transition-opacity" onClick={() => window.location.assign('/#blog')}>Blogs</button></li>
        </ul>
      )
    },
    {
      id: "contact",
      title: "Get In Touch",
      content: (
        <div className="space-y-3 text-sm opacity-80">
          <p>Have questions? We're here to help!</p>
          <p className="hover:opacity-100 transition-opacity">support@moneycontrol.com</p>
          <p>Available 24/7 to assist you with your credit card queries.</p>
        </div>
      )
    }
  ]), []);

  return (
    <footer className="bg-foreground text-background pt-12 sm:pt-14 md:pt-16 pb-8 sm:pb-10 safe-area-inset-bottom">
      <div className="section-shell">
        {/* Desktop: 3-column grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-10 lg:gap-12 mb-10 lg:mb-12">
          {sections.map(section => (
            <div key={section.id}>
              <h3 className="font-bold text-lg lg:text-xl mb-5 lg:mb-6">{section.title}</h3>
              {section.content}
            </div>
          ))}
        </div>

        {/* Mobile: Accordion sections */}
        <div className="md:hidden space-y-3 mb-8">
          {sections.map(section => {
            const isOpen = openSection === section.id;
            return (
              <div key={section.id} className="border border-background/20 rounded-xl bg-background/5 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3.5 touch-target"
                  onClick={() => setOpenSection(isOpen ? null : section.id)}
                  aria-expanded={isOpen}
                  aria-controls={`footer-section-${section.id}`}
                >
                  <span className="font-semibold text-sm sm:text-base">{section.title}</span>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div id={`footer-section-${section.id}`} className="px-4 pb-4 animate-accordion-down">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Copyright & Legal Links */}
        <div className="border-t border-background/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs opacity-60 text-center sm:text-left">
            © 2025 MoneyControl Cards. All rights reserved.
          </p>
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs opacity-60">
            <a href="#" className="hover:opacity-100 hover:text-primary transition-all">Privacy Policy</a>
            <span className="hidden sm:inline">•</span>
            <a href="#" className="hover:opacity-100 hover:text-primary transition-all">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
