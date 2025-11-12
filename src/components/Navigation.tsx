import { Link } from "react-router-dom";
import logo from "@/assets/moneycontrol-logo.png";
const Navigation = () => {
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between mx-0 px-0 py-0">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="MoneyControl Credit Cards" className="h-40 md:h-48 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/cards" className="text-foreground hover:text-primary transition-colors font-medium">
              All Cards
            </Link>
            <Link to="/card-genius" className="text-foreground hover:text-primary transition-colors font-medium">
              Card Genius
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
          </div>

          <button className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>;
};
export default Navigation;