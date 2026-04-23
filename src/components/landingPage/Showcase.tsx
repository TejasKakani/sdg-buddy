"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SDG_GOALS } from "@/constants/sdgGoals";

const SdgShowcase = () => {
  const [activeDescription, setActiveDescription] = useState<string | null>(null);

  const handleSdgClick = (id: number) => {
    const goal = SDG_GOALS.find(g => g.id === id);
    if (goal) {
      setActiveDescription(`${goal.name}: ${goal.description}`);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 border border-gray-200 mb-16 md:mb-24">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Aligned with the UN Sustainable Development Goals
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Every action you take is mapped to specific SDG targets, showing how individual choices 
          contribute to global sustainability efforts. Click a goal to learn more.
        </p>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-4 justify-center mb-8">
        {SDG_GOALS.map((sdg) => (
          <button 
            key={sdg.id} 
            onClick={() => handleSdgClick(sdg.id)} 
            className="text-center group border-none bg-transparent cursor-pointer p-0" 
            aria-label={`View description for ${sdg.name}`}
          >
            <Image
              src={sdg.logo}
              alt={`SDG ${sdg.id}: ${sdg.name}`}
              width={64}
              height={64}
              className="w-16 h-16 rounded-lg object-cover shadow-md group-hover:scale-110 transition-transform"
            />
          </button>
        ))}
      </div>

      {/* Graceful UI display instead of an alert popup */}
      {activeDescription && (
        <div className="max-w-3xl mx-auto bg-gray-50 p-4 rounded-md border border-gray-200 text-center animate-fade-in">
          <p className="text-gray-800 font-medium">{activeDescription}</p>
        </div>
      )}
    </div>
  );
};

export default SdgShowcase;
