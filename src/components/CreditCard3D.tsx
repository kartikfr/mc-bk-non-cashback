import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ShoppingBag, ShoppingCart, Store } from "lucide-react";

interface CreditCard3DProps {
  cardImage?: string;
  bankLogo?: string;
  cardName?: string;
  className?: string;
  estimatedSavings?: number;
}

export const CreditCard3D = ({
  cardImage,
  bankLogo,
  cardName = "Your Dream Card",
  className = "",
  estimatedSavings = 8450,
}: CreditCard3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const savingsBubbleRef = useRef<HTMLDivElement>(null);
  const featuresBubbleRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    // Floating animation for card
    const floatAnim = gsap.to(cardRef.current, {
      y: -15,
      duration: 3.5,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
      force3D: true
    });

    // Gentle rotation
    const rotateAnim = gsap.to(cardRef.current, {
      rotateY: 12,
      rotateX: -3,
      duration: 5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      force3D: true
    });

    // Floating animations for bubbles
    if (savingsBubbleRef.current) {
      gsap.to(savingsBubbleRef.current, {
        y: -10,
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut",
        force3D: true
      });
    }

    if (featuresBubbleRef.current) {
      gsap.to(featuresBubbleRef.current, {
        y: -8,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut",
        force3D: true
      });
    }

    return () => {
      floatAnim.kill();
      rotateAnim.kill();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !shineRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * 10;
    const rotateY = ((centerX - x) / centerX) * 10;

    gsap.to(cardRef.current, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.5,
      ease: "power2.out",
    });

    // Shine effect follows mouse
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    gsap.to(shineRef.current, {
      background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.3) 0%, transparent 70%)`,
      duration: 0.3,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!cardRef.current || !shineRef.current) return;

    gsap.to(cardRef.current, {
      scale: 1.03,
      duration: 0.4,
      ease: "power2.out",
    });

    gsap.to(shineRef.current, {
      opacity: 1,
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!cardRef.current || !shineRef.current) return;

    gsap.to(cardRef.current, {
      rotateX: -3,
      rotateY: 12,
      scale: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });

    gsap.to(shineRef.current, {
      opacity: 0,
      duration: 0.3,
    });
  };

  return (
    <div className={`relative ${className} overflow-visible`} style={{ perspective: "1500px" }}>
      {/* Floating Savings Bubble - Responsive sizing */}
      <div
        ref={savingsBubbleRef}
        className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 lg:-top-12 lg:-right-12 z-20 bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 lg:p-5 border border-white/50"
        style={{
          boxShadow: "0 20px 60px rgba(34, 197, 94, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5)",
        }}
      >
        <div className="text-center">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[hsl(145,100%,33%)] mb-0.5 sm:mb-1">
            ₹{estimatedSavings.toLocaleString('en-IN')}
          </div>
          <div className="text-[9px] sm:text-[10px] lg:text-xs text-charcoal-700 font-medium uppercase tracking-wide">
            Estimated Annual Savings
          </div>
        </div>
      </div>

      {/* Floating E-commerce Categories Bubble - Visible on all screens */}
      <div
        ref={featuresBubbleRef}
        className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 lg:-top-8 lg:-left-8 z-20 bg-white/95 backdrop-blur-xl rounded-lg sm:rounded-xl shadow-xl p-2 sm:p-3 lg:p-4 border border-white/60"
        style={{
          boxShadow: "0 15px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.6)",
        }}
      >
        <div className="space-y-1.5 sm:space-y-2 lg:space-y-2.5">
          {/* Flipkart */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#2874F0] flex items-center justify-center flex-shrink-0">
              <span className="text-[7px] sm:text-[8px] font-bold text-white">F</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-semibold text-charcoal-900 leading-tight">Flipkart</span>
              <span className="text-[7px] sm:text-[8px] text-charcoal-600">Shopping</span>
            </div>
          </div>
          
          {/* Amazon */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#FF9900] flex items-center justify-center flex-shrink-0">
              <span className="text-[7px] sm:text-[8px] font-bold text-white">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-semibold text-charcoal-900 leading-tight">Amazon</span>
              <span className="text-[7px] sm:text-[8px] text-charcoal-600">E-commerce</span>
            </div>
          </div>
          
          {/* Myntra */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#FF3F6C] flex items-center justify-center flex-shrink-0">
              <span className="text-[7px] sm:text-[8px] font-bold text-white">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-semibold text-charcoal-900 leading-tight">Myntra</span>
              <span className="text-[7px] sm:text-[8px] text-charcoal-600">Fashion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="perspective-container" style={{ perspective: "1500px" }}>
      <div
        ref={cardRef}
          className="credit-card-3d relative w-full aspect-[85.6/53.98] max-w-[400px] lg:max-w-[500px] mx-auto lg:hover:shadow-[0_30px_80px_rgba(34,197,94,0.3)] transition-shadow duration-500"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
            transform: "rotateY(12deg) rotateX(-3deg)",
        }}
      >
          {/* Glassmorphism Card Background - Subtle White Theme */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-white/80 via-white/70 to-slate-50/80 border-2 border-white/60 shadow-2xl">
            {/* Subtle pattern/texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:20px_20px]" />
            
            {/* Gradient overlay for depth - subtle */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-slate-200/30" />
            
            {/* Green glow effect - subtle */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[hsl(145,100%,33%)]/8 via-transparent to-transparent opacity-40" />
            
            {/* Subtle shadow for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-300/10 via-transparent to-transparent" />
            
            {/* Light border highlight */}
            <div className="absolute inset-0 rounded-3xl border border-white/80" />
        </div>

        {/* Shine Effect */}
        <div
          ref={shineRef}
            className="absolute inset-0 rounded-3xl opacity-0 pointer-events-none transition-opacity duration-300"
          style={{
              background: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.25) 0%, transparent 70%)",
          }}
        />

          {/* Holographic/Reflective Effect - Subtle for white theme */}
          <div className="absolute inset-0 rounded-3xl opacity-10 pointer-events-none bg-gradient-to-br from-blue-200/20 via-purple-200/15 to-pink-200/20 mix-blend-overlay" />

        {/* Card Content */}
          <div className="relative z-10 p-6 lg:p-8 h-full flex flex-col justify-between" style={{ transform: "translateZ(20px)" }}>
            {/* Top Section */}
            <div className="flex justify-between items-start">
              {/* Chip */}
              <div className="w-12 h-9 lg:w-14 lg:h-11 bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 rounded-lg shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent" />
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-0.5 p-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-yellow-600/40 rounded-sm" />
                  ))}
                </div>
            </div>

              {/* Contactless Symbol */}
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-charcoal-300 flex items-center justify-center shadow-sm bg-white/50">
                  <div className="flex flex-col gap-0.5">
                    <div className="w-4 h-0.5 bg-charcoal-600 rounded-full" />
                    <div className="w-3 h-0.5 bg-charcoal-600 rounded-full ml-1" />
                    <div className="w-2 h-0.5 bg-charcoal-600 rounded-full ml-2" />
                  </div>
              </div>
            </div>
          </div>

            {/* Middle Section - Card Number */}
            <div className="mt-auto space-y-4 lg:space-y-6">
              <div className="flex justify-between font-mono text-charcoal-900 text-base sm:text-lg lg:text-xl font-bold tracking-[0.2em] drop-shadow-sm">
              <span>1234</span>
                <span>0000</span>
                <span>1678</span>
                <span>9012</span>
            </div>

            {/* Card Details */}
            <div className="flex justify-between items-end">
                <div className="flex-1">
                  <div className="text-charcoal-600 text-[10px] lg:text-xs mb-1 uppercase tracking-wider font-medium">
                    Card Holder
                  </div>
                  <div className="text-charcoal-900 text-sm lg:text-base font-semibold tracking-wide">
                  {cardName}
                  </div>
                </div>
                <div className="mr-4">
                  <div className="text-charcoal-600 text-[10px] lg:text-xs mb-1 uppercase tracking-wider font-medium">
                    Expires
              </div>
                  <div className="text-charcoal-900 text-sm lg:text-base font-semibold tracking-wide">
                  12/28
                  </div>
                </div>
                {/* Mastercard Logo */}
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-red-500/90 backdrop-blur-sm relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-red-600" />
                  </div>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-orange-500/90 backdrop-blur-sm -ml-3 relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reflection Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
