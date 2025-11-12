import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Target, Users, Lightbulb, Heart, TrendingUp, Shield } from "lucide-react";

const About = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-semibold">About Us</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Helping Indians Make Smarter Money Decisions
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We started MoneyControl Cards because we were frustrated. Tired of confusing terms, hidden fees, and feeling like we were missing out on rewards we deserved. So we built something better.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-foreground">Our Story</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                It all started over chai and complaints. Three friends, sitting at a café in Bangalore, comparing credit card bills and realizing we were all leaving thousands of rupees on the table every month.
              </p>
              <p>
                We had the wrong cards for our spending. We were missing welcome bonuses. We didn't know which cards gave the best rewards for groceries, or travel, or online shopping. The information was out there, but it was scattered, confusing, and frankly... boring.
              </p>
              <p>
                So we asked ourselves: what if choosing a credit card was as simple as answering a few questions about how you actually spend your money? What if someone just showed you the math, in plain language, without the jargon?
              </p>
              <p>
                That's how MoneyControl Cards was born. Not from a boardroom, but from real frustration with a system that felt designed to confuse rather than help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-background p-8 rounded-2xl shadow-lg border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-foreground">Our Mission</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To make personal finance accessible, transparent, and actually useful for everyday Indians. We believe everyone deserves to understand where their money goes and how to make it work harder for them.
              </p>
            </div>
            
            <div className="bg-background p-8 rounded-2xl shadow-lg border border-border">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-foreground">Our Vision</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A world where choosing financial products isn't stressful or confusing. Where you can make informed decisions in minutes, not hours. Where your money works as hard as you do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center text-foreground">What We Stand For</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Transparency First</h3>
                <p className="text-muted-foreground">
                  No hidden agendas. We show you the math, the fees, and the fine print. You deserve to know exactly what you're getting.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">User-Centric</h3>
                <p className="text-muted-foreground">
                  Built for real people, not finance experts. Simple language, clear comparisons, and recommendations that actually make sense.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Always Independent</h3>
                <p className="text-muted-foreground">
                  Our recommendations are based on data and your needs, not who pays us the highest commission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-foreground">Why Choose MoneyControl Cards?</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">We do the homework for you.</strong> Instead of spending hours researching cards, comparing rewards, and calculating which one actually saves you money, you answer a few questions and we show you the answer.
              </p>
              <p>
                <strong className="text-foreground">We speak human.</strong> No financial jargon. No confusing terms. Just straight talk about which card works best for how you actually spend your money.
              </p>
              <p>
                <strong className="text-foreground">We're always learning.</strong> Cards change. Offers update. We stay on top of it so you don't have to. Our database is constantly refreshed with the latest information.
              </p>
              <p>
                <strong className="text-foreground">We care about your results.</strong> This isn't just a tool for us. We genuinely want you to save money, earn more rewards, and feel confident about your financial choices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to Find Your Perfect Card?</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Stop leaving money on the table. Whether you're looking for cashback, travel rewards, or fuel savings, we'll help you find the card that matches your lifestyle. It takes just 60 seconds, and it's completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/card-genius"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                Try Card Genius Now
                <TrendingUp className="w-5 h-5" />
              </Link>
              <Link
                to="/cards"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary/5 transition-all"
              >
                Browse All Cards
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No hidden fees. No spam. Just honest recommendations that could save you thousands.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
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

export default About;
