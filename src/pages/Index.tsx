import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import BankCarousel from "@/components/BankCarousel";
import FourKeyUSPs from "@/components/FourKeyUSPs";
import PopularCreditCards from "@/components/PopularCreditCards";
import TestimonialSection from "@/components/TestimonialSection";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FourKeyUSPs />
      <BankCarousel />
      <PopularCreditCards />
      <TestimonialSection />
      <BlogSection />
      <Footer />
    </div>
  );
};

export default Index;
