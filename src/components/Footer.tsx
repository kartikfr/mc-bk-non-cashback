import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <h3 className="font-bold text-xl mb-6">MoneyControl Cards</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Helping Indians make smarter credit card decisions with personalized recommendations, detailed comparisons, and expert insights.
            </p>
            <p className="text-sm opacity-80">
              Compare 100+ cards and find your perfect match.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-xl mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm opacity-80">
              <li><Link to="/" className="hover:opacity-100 transition-opacity">Home</Link></li>
              <li><Link to="/cards" className="hover:opacity-100 transition-opacity">Discover Cards</Link></li>
              <li><Link to="/card-genius" className="hover:opacity-100 transition-opacity">AI Card Genius</Link></li>
              <li><Link to="/card-genius-category" className="hover:opacity-100 transition-opacity">AI Category Card Genius</Link></li>
              <li><Link to="/beat-my-card" className="hover:opacity-100 transition-opacity">Beat My Card</Link></li>
              <li><Link to="/about" className="hover:opacity-100 transition-opacity">About Us</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-xl mb-6">Get In Touch</h4>
            <div className="space-y-3 text-sm opacity-80">
              <p>Have questions? We're here to help!</p>
              <p className="hover:opacity-100 transition-opacity">
                support@moneycontrol.com
              </p>
              <p className="pt-2">
                Available 24/7 to assist you with your credit card queries.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-background/20 pt-8 text-center text-sm opacity-60">
          <p>© 2025 MoneyControl Cards. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
