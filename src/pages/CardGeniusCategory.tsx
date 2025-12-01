import Navigation from "@/components/Navigation";
import CategoryCardGenius from "@/components/CategoryCardGenius";
const CardGeniusCategory = () => {
  return <div className="min-h-screen bg-background">
      <Navigation />
      <CategoryCardGenius />
      
      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <h3 className="font-bold text-xl mb-6">MoneyControl Cards</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                Helping Indians make smarter credit card decisions with personalized recommendations and detailed comparisons.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-xl mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm opacity-80">
                <li><a href="/" className="hover:opacity-100 transition-opacity">Home</a></li>
                <li><a href="/cards" className="hover:opacity-100 transition-opacity">Discover Cards</a></li>
                <li><a href="/card-genius" className="hover:opacity-100 transition-opacity">AI Card Genius</a></li>
                <li><a href="/card-genius-category" className="hover:opacity-100 transition-opacity">AI Category Card Genius</a></li>
                <li><a href="/beat-my-card" className="hover:opacity-100 transition-opacity">Beat My Card</a></li>
                <li><a href="/about" className="hover:opacity-100 transition-opacity">About Us</a></li>
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
    </div>;
};
export default CardGeniusCategory;