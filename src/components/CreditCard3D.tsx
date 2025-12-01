import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface CreditCard3DProps {
  cardImage?: string;
  bankLogo?: string;
  cardName?: string;
  className?: string;
}

export const CreditCard3D = ({
  cardImage = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop",
  bankLogo,
  cardName = "Premium Card",
  className = "",
}: CreditCard3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    // Floating animation
    const floatAnim = gsap.to(cardRef.current, {
      y: -20,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
      force3D: true
    });

    // Gentle rotation
    const rotateAnim = gsap.to(cardRef.current, {
      rotateY: 15,
      rotateX: -5,
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      force3D: true
    });

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

    const rotateX = ((y - centerY) / centerY) * 15;
    const rotateY = ((centerX - x) / centerX) * 15;

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
      background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`,
      duration: 0.3,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!cardRef.current || !shineRef.current) return;

    gsap.to(cardRef.current, {
      scale: 1.05,
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
      rotateX: -5,
      rotateY: 15,
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
    <div className={`perspective-container ${className}`} style={{ perspective: "1200px" }}>
      <div
        ref={cardRef}
        className="credit-card-3d lg:hover:shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(15deg) rotateX(-5deg)",
        }}
      >
        {/* Card Background */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <img
            src={cardImage}
            alt={cardName}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
        </div>

        {/* Shine Effect */}
        <div
          ref={shineRef}
          className="absolute inset-0 rounded-3xl opacity-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)",
          }}
        />

        {/* Holographic Effect */}
        <div className="absolute inset-0 rounded-3xl opacity-20 pointer-events-none bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 mix-blend-overlay" />

        {/* Card Content */}
        <div className="relative z-10 p-8 h-full flex flex-col justify-between" style={{ transform: "translateZ(20px)" }}>
          {/* Bank Logo */}
          {bankLogo && (
            <div className="flex justify-between items-start">
              <img
                src={bankLogo}
                alt="Bank Logo"
                className="h-12 w-auto filter drop-shadow-lg"
              />
              <div className="w-12 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded opacity-80" />
            </div>
          )}

          {/* Chip */}
          <div className="mt-8">
            <div className="w-14 h-11 bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 rounded-lg shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-0.5 p-1.5">
                <div className="bg-yellow-600/30 rounded-sm" />
                <div className="bg-yellow-600/30 rounded-sm" />
                <div className="bg-yellow-600/30 rounded-sm" />
                <div className="bg-yellow-600/30 rounded-sm" />
                <div className="bg-yellow-600/30 rounded-sm" />
                <div className="bg-yellow-600/30 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Card Number */}
          <div className="space-y-6">
            <div className="flex justify-between font-mono text-white text-xl font-bold tracking-widest drop-shadow-lg">
              <span>••••</span>
              <span>••••</span>
              <span>••••</span>
              <span>1234</span>
            </div>

            {/* Card Details */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-white/70 text-xs mb-1 uppercase tracking-wide">Card Holder</div>
                <div className="text-white text-sm font-semibold tracking-wide drop-shadow">
                  {cardName}
                </div>
              </div>
              <div>
                <div className="text-white/70 text-xs mb-1 uppercase tracking-wide">Expires</div>
                <div className="text-white text-sm font-semibold tracking-wide drop-shadow">
                  12/28
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-sm" />
                <div className="w-8 h-8 rounded-full bg-yellow-400/80 backdrop-blur-sm -ml-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Reflection Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
