import { useEffect, useRef, useState } from "react";
import { cardService } from "@/services/cardService";
import gsap from "gsap";

const BankCarousel = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await cardService.getInitBundle();
        if (import.meta.env.DEV) {
          console.debug('BankCarousel API Response:', response);
        }
        
        if (response.status === 'error') {
          console.error('API returned error:', response.error);
          setError(true);
          return;
        }
        
        if (response.data?.bank_data) {
          const bankData = response.data.bank_data;
          setBanks([...bankData, ...bankData]);
        }
      } catch (error) {
        console.error('Failed to fetch banks:', error);
        setError(true);
      }
    };

    fetchBanks();
  }, []);

  useEffect(() => {
    if (!trackRef.current || banks.length === 0) return;

    // Adjust duration based on screen size - faster on mobile for smoother experience
    const duration = window.innerWidth < 768 ? 40 : 30;

    const animation = gsap.to(trackRef.current, {
      xPercent: -50,
      duration: duration,
      repeat: -1,
      ease: "none",
      force3D: true,
      smoothOrigin: true
    });

    return () => {
      animation.kill();
    };
  }, [banks]);

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Trusted Partner Banks
          </h2>
          <p className="text-muted-foreground">
            Unable to load partner banks. The backend API is currently experiencing issues.
          </p>
        </div>
      </section>
    );
  }

  if (banks.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      <div className="section-shell mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center text-muted-foreground/80">
          Trusted Partner Banks
        </h2>
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-0">
        {/* Gradient fade on edges */}
        <div className="absolute inset-y-0 left-0 w-8 sm:w-12 md:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 sm:w-12 md:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <div ref={trackRef} className="flex bank-track will-change-transform w-[200%] lg:w-full">
          {banks.map((bank, index) => (
            <div
              key={`${bank.id}-${index}`}
              className="flex-shrink-0 w-24 h-14 sm:w-32 sm:h-16 md:w-36 md:h-18 lg:w-40 lg:h-20 mx-2 sm:mx-3 lg:mx-4 flex items-center justify-center bg-card/60 rounded-lg shadow-sm border border-border/30 p-3 sm:p-4 transition-opacity duration-300"
            >
              <img
                src={bank.logo}
                alt={`${bank.name} logo`}
                className="max-w-full max-h-full object-contain opacity-75"
                style={{ filter: 'grayscale(10%)' }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BankCarousel;
