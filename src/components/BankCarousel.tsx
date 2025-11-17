import { useEffect, useState } from "react";
import { cardService } from "@/services/cardService";
import gsap from "gsap";

const BankCarousel = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await cardService.getInitBundle();
        console.log('BankCarousel API Response:', response);
        
        if (response.status === 'error') {
          console.error('API returned error:', response.error);
          setError(true);
          return;
        }
        
        if (response.data?.bank_data) {
          // Duplicate for seamless infinite scroll
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
    if (banks.length > 0) {
      const track = document.querySelector('.bank-track');
      if (track) {
        const animation = gsap.to(track, {
          xPercent: -50,
          duration: 30,
          repeat: -1,
          ease: "none",
          force3D: true,
          smoothOrigin: true
        });

        return () => {
          animation.kill();
        };
      }
    }
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
    <section className="py-16 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-3xl font-bold text-center text-foreground">
          Trusted Partner Banks
        </h2>
      </div>
      
      <div className="relative">
        <div className="flex bank-track will-change-transform">
          {banks.map((bank, index) => (
            <div
              key={`${bank.id}-${index}`}
              className="flex-shrink-0 w-48 h-24 mx-4 flex items-center justify-center bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-all duration-300"
            >
              <img
                src={bank.logo}
                alt={`${bank.name} logo`}
                className="max-w-full max-h-full object-contain"
                style={{ filter: 'none' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BankCarousel;
