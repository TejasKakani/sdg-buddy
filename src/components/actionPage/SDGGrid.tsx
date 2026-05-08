"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SDG_GOALS } from "@/constants/sdgGoals";

// Initialize SDG data with points from the central SDG_GOALS
const INITIAL_SDG_DATA = SDG_GOALS.map(goal => ({
  ...goal,
  points: 0,
  description: undefined,
}));

export default function SDGGrid() {
  const [sdgData, setSdgData] = useState(INITIAL_SDG_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSDGProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const res = await fetch('/api/get-sdg-progress', { method: 'GET' });
        
        if (!res.ok) {
          throw new Error("Failed to fetch SDG progress");
        }
        
        const data = await res.json();
        
        // 2. Immutably update state using .map() and .find()
        setSdgData(prevData => 
          prevData.map(goal => {
            // Safely find the progress data for this specific SDG ID
            const progressItem = data.find((item: { sdgId: number; points: number }) => item.sdgId === goal.id);
            
            // If we found progress, return a NEW object with updated points. Otherwise, return the original.
            return progressItem 
              ? { ...goal, points: progressItem.points } 
              : goal;
          })
        );
        
      } catch (err) {
        console.error("Error fetching SDG progress:", err);
        setError("Could not load your progress data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSDGProgress();
  }, []);

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-emerald-800">My SDG Progress</h3>
        {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>}
      </div>

      {error ? (
        <div className="grow flex items-center justify-center text-red-500 text-sm">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-6 text-center">
          {sdgData.map(goal => (
            <div key={goal.id} className="relative group flex flex-col items-center">
              
              <div
                className={`w-16 h-16 rounded-lg overflow-hidden mx-auto transition-all duration-200 shadow-sm cursor-default
                  ${goal.points > 0 ? 'ring-2 ring-offset-2 ring-emerald-500 scale-105' : 'opacity-70 hover:opacity-100'}
                `}
              >
                <Image
                  src={goal.logo}
                  alt={`SDG ${goal.id}: ${goal.name}`}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover"
                />
              </div>

              {/* 3. Fixed Tooltip Positioning & Styling */}
              <div className="absolute bottom-full mb-3 w-max max-w-[150px] px-3 py-2 bg-slate-800 text-white text-xs rounded-md left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-lg text-center">
                <p className="font-semibold mb-1">{goal.name}</p>
                <p className="text-emerald-400 font-bold">{goal.points.toLocaleString()} pts</p>
                {/* CSS Triangle pointing down */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}