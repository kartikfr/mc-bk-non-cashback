import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import logo from "@/assets/moneycontrol-logo.png";

const Navigation = () => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between mx-0 px-0 py-0">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="MoneyControl Credit Cards" className="h-16 md:h-20 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/cards" className="text-foreground hover:text-primary transition-colors font-medium">
              Discover
            </Link>
            
            {/* Tools Dropdown */}
            <div 
              className="relative group"
            >
              <button className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
                Tools
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                  <Link 
                    to="/card-genius" 
                    className="block px-4 py-2.5 text-foreground hover:bg-accent transition-colors"
                  >
                    <div className="font-medium">AI Card Genius</div>
                    <div className="text-xs text-muted-foreground">Enter spends → best card</div>
                  </Link>
                  <Link 
                    to="/card-genius-category" 
                    className="block px-4 py-2.5 text-foreground hover:bg-accent transition-colors"
                  >
                    <div className="font-medium">AI Category Genius</div>
                    <div className="text-xs text-muted-foreground">Find best card by category</div>
                  </Link>
                  <Link 
                    to="/beat-my-card" 
                    className="block px-4 py-2.5 text-foreground hover:bg-accent transition-colors"
                  >
                    <div className="font-medium">Beat My Card</div>
                    <div className="text-xs text-muted-foreground">See better alternatives</div>
                  </Link>
                </div>
            </div>

            <Link to="/#blog" className="text-foreground hover:text-primary transition-colors font-medium">
              Blogs
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <Link 
              to="/" 
              className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/cards" 
              className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Discover
            </Link>
            <div className="py-2">
              <div className="text-foreground font-medium mb-2">Tools</div>
              <Link 
                to="/card-genius" 
                className="block py-2 pl-4 text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Card Genius
              </Link>
              <Link 
                to="/card-genius-category" 
                className="block py-2 pl-4 text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Category Genius
              </Link>
              <Link 
                to="/beat-my-card" 
                className="block py-2 pl-4 text-sm text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Beat My Card
              </Link>
            </div>
            <Link 
              to="/#blog" 
              className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blogs
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navigation;