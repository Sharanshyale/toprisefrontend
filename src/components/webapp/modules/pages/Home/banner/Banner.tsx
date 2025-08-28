"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function BannerSection() {
  const [offsetY, setOffsetY] = useState(0)
  const handleScroll = () => setOffsetY(window.pageYOffset)

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
     <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0" style={{ transform: `translateY(${offsetY * 0.5}px)` }}>
        <Image
          src="/assets/HeroBg.jpg"
          alt="Background"
          fill
          className="object-cover scale-110 blur-[1px] md:blur-[2px]"
          priority
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content Grid */}
      <div className="relative z-10 container mx-auto px-4 pt-8 pb-8 h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
          {/* Left Side - Text Content */}
          <div className="text-white space-y-6">
            <h1 className="font-sans font-bold text-white text-4xl md:text-5xl lg:text-6xl leading-tight">
              Find the Perfect Spare Part for Your Vehicle - Fast and Easy
            </h1>
            <p className="font-sans text-white/90 text-lg md:text-xl">
              Search thousands of parts for bikes and cars by model, series, year, and type.
            </p>
          </div>

          {/* Right Side - Search Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-md space-y-6 shadow-2xl">
              {/* Vehicle Search Form */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg mb-4">Search by vehicle</h3>

                <div className="grid grid-cols-2 gap-3">
                  <select className="w-full p-3 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 hover:bg-gray-600/80 transition-colors">
                    <option className="bg-gray-800 text-white">Select Brand</option>
                    <option className="bg-gray-800 text-white">Toyota</option>
                    <option className="bg-gray-800 text-white">Honda</option>
                    <option className="bg-gray-800 text-white">Ford</option>
                    <option className="bg-gray-800 text-white">BMW</option>
                  </select>

                  <select className="w-full p-3 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 hover:bg-gray-600/80 transition-colors">
                    <option className="bg-gray-800 text-white">Select Model</option>
                    <option className="bg-gray-800 text-white">Camry</option>
                    <option className="bg-gray-800 text-white">Civic</option>
                    <option className="bg-gray-800 text-white">Focus</option>
                    <option className="bg-gray-800 text-white">3 Series</option>
                  </select>

                  <select className="w-full p-3 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 hover:bg-gray-600/80 transition-colors">
                    <option className="bg-gray-800 text-white">Select Year</option>
                    <option className="bg-gray-800 text-white">2024</option>
                    <option className="bg-gray-800 text-white">2023</option>
                    <option className="bg-gray-800 text-white">2022</option>
                    <option className="bg-gray-800 text-white">2021</option>
                  </select>

                  <select className="w-full p-3 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 hover:bg-gray-600/80 transition-colors">
                    <option className="bg-gray-800 text-white">Select Variant</option>
                    <option className="bg-gray-800 text-white">Base</option>
                    <option className="bg-gray-800 text-white">Sport</option>
                    <option className="bg-gray-800 text-white">Premium</option>
                    <option className="bg-gray-800 text-white">Luxury</option>
                  </select>
                </div>

                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                  Search
                </button>
              </div>

              {/* Number Plate Search */}
              <div className="space-y-4 pt-4 border-t border-white/20">
                <h3 className="text-white font-semibold">Search by number plate</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., ABC123"
                    className="flex-1 p-3 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 placeholder-white/70 hover:bg-gray-600/80 transition-colors"
                  />
                  <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat/Help Button
      <div className="fixed bottom-6 right-6 z-20">
        <button className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl transition-colors shadow-lg">
          N
        </button>
      </div> */}
    </section>
  )
}
