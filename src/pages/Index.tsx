import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import BankCarousel from "@/components/BankCarousel";
import PopularCreditCards from "@/components/PopularCreditCards";
import CategoryCardGenius from "@/components/CategoryCardGenius";
import CardGeniusCTA from "@/components/CardGeniusCTA";
import CTAConnector from "@/components/CTAConnector";
import BeatMyCardCTA from "@/components/BeatMyCardCTA";
import MidPageCTA from "@/components/MidPageCTA";
import TestimonialSection from "@/components/TestimonialSection";
import BlogSection from "@/components/BlogSection";
// import FinalCTA from "@/components/FinalCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <BankCarousel />
      <PopularCreditCards />
      <CategoryCardGenius />
      <CardGeniusCTA />
      <CTAConnector />
      <BeatMyCardCTA />
      {/* <MidPageCTA /> */}
      <TestimonialSection />
      <BlogSection />
      {/* <FinalCTA /> */}
      
      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">MoneyControl Cards</h3>
              <p className="text-sm opacity-80">
                Helping Indians make smarter credit card decisions
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link to="/" className="hover:opacity-100">Home</Link></li>
                <li><Link to="/cards" className="hover:opacity-100">All Cards</Link></li>
                <li><Link to="/card-genius" className="hover:opacity-100">Card Genius</Link></li>
                <li><Link to="/about" className="hover:opacity-100">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100">Privacy Policy</a></li>
                <li><a href="#" className="hover:opacity-100">Terms of Service</a></li>
                <li><a href="#" className="hover:opacity-100">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm opacity-80">
                support@moneycontrol.com
              </p>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm opacity-60">
            © 2025 MoneyControl Cards. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
