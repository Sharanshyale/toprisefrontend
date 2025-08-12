"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function HeroSection() {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${offsetY * 0.5}px)` }}
      >
        <Image
          src="/assets/HeroBg.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content Grid */}
      <div className="relative z-10 container mx-auto px-2 pt-8 pb-8 md:px-4 h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
          {/* Left Side - Text Content */}
          <div className="text-white space-y-6">

            <p className="font-sans font-bold text-[#ffffff] text-[48px]">
              Find the Perfect Spare Part for Your Vehicle - Fast and Easy
            </p>
          </div>

          {/* Right Side - Image Placeholder with subtle counter-parallax */}
          <div
            className="flex justify-center lg:justify-end"
            style={{ transform: `translateY(-${offsetY * 0.1}px)` }} // Subtle counter-movement
          >
            <div className="relative">
              {/* Phone mockup container */}
              <div className="relative w-64 h-96 md:w-80 md:h-[480px]">
                <Image
                  src="/assets/HeroCard.png"
                  alt="Mobile App Preview"
                  width={320}
                  height={480}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Glowing border effect */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
