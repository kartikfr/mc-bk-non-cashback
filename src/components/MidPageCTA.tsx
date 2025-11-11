import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MidPageCTA = () => {
  const [userCount, setUserCount] = useState(2847);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top center',
        onEnter: () => {
          gsap.to(sectionRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
          });

          // Animate counter
          gsap.to({ val: 2000 }, {
            val: 2847,
            duration: 2,
            onUpdate: function() {
              setUserCount(Math.floor(this.targets()[0].val));
            }
          });
        }
      });
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 opacity-0 translate-y-10"
    >
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-12 text-white shadow-2xl">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -top-48 -right-48 animate-float"></div>
            <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -bottom-48 -left-48 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Still scrolling?
            </h2>
            <p className="text-xl mb-2 opacity-90">
              Your perfect card is one click away.
            </p>
            <p className="text-lg mb-8 opacity-75">
              <span className="font-bold text-2xl">{userCount.toLocaleString()}</span> people found their ideal card today. Your turn!
            </p>

            <Link to="/cards">
              <Button
                size="lg"
                variant="secondary"
                className="shadow-xl hover:scale-105 transition-transform"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Find My Perfect Card Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MidPageCTA;
