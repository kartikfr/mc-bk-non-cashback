import { useEffect, useState } from "react";
import { cardService } from "@/services/cardService";
import gsap from "gsap";

const BankCarousel = () => {
  const [banks, setBanks] = useState<any[]>([]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await cardService.getInitBundle();
        if (response.data?.bank_data) {
          // Duplicate for seamless infinite scroll
          const bankData = response.data.bank_data;
          setBanks([...bankData, ...bankData]);
        }
      } catch (error) {
        console.error('Failed to fetch banks:', error);
      }
    };

    fetchBanks();
  }, []);

  useEffect(() => {
    if (banks.length > 0) {
      const track = document.querySelector('.bank-track');
      if (track) {
        gsap.to(track, {
          xPercent: -50,
          duration: 30,
          repeat: -1,
          ease: "none"
        });
      }
    }
  }, [banks]);

  return (
    <section className="py-16 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-3xl font-bold text-center">
          Trusted Partner Banks
        </h2>
      </div>
      
      <div className="relative">
        <div className="flex bank-track">
          {banks.map((bank, index) => (
            <div
              key={`${bank.id}-${index}`}
              className="flex-shrink-0 w-48 h-24 mx-4 flex items-center justify-center bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <img
                src={bank.logo}
                alt={bank.name}
                className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BankCarousel;
