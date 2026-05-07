"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/actionPage/StatCard"; // Using @/ alias is usually cleaner
import ActionLogger from "@/components/actionPage/ActionLogger";
import ImpactChart from "@/components/actionPage/ImpactChart";
import Leaderboard from "@/components/actionPage/Leaderboard";
import SDGGrid from "@/components/actionPage/SDGGrid";

export default function ActionPage() {
  const router = useRouter();
  
  const [user, setUser] = useState({
    name: "",
    points: 0,
    streak: 0,
    achievements: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const res = await fetch('/api/get-dashboard-profile');
        
        // Handle unauthenticated users gracefully
        if (res.status === 401) {
          router.push('/sign-in');
          return;
        }

        if (!res.ok) throw new Error("Failed to load profile data");

        const data = await res.json();
        
        // Defensive check: ensure data.profile exists before accessing properties
        if (data?.profile) {
          setUser({
            name: data.profile.name || "User",
            points: data.profile.totalPoints || 0,
            streak: data.profile.currentStreak || 0,
            // Note: Carefully spelling "acheivements" exactly as your API returns it
            achievements: data.profile.acheivements || 0, 
          });
        } else {
           throw new Error("Invalid profile data received");
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Could not load your dashboard. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardProfile();
  }, [router]);

  // Handle critical page-level errors
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    // Cleaned up the background and removed the forced green text color
    <div className="min-h-screen bg-emerald-50 p-4 md:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto py-4">
        
        {/* Header Section with Skeleton Loading */}
        <div className="mb-8">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-9 bg-slate-200 rounded w-64 mb-3"></div>
              <div className="h-5 bg-slate-200 rounded w-48"></div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-emerald-600 mb-2">
                Welcome Back, {user.name}!
              </h2>
              <p className="text-emerald-800">
                Here is a summary of your positive impact.
              </p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-8">
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard 
                icon="⭐" 
                label="Total Points" 
                value={isLoading ? "..." : user.points} 
              />
              <StatCard 
                icon="🔥" 
                label="Current Streak" 
                value={isLoading ? "..." : `${user.streak} Days`} 
              />
              <StatCard 
                icon="🏆" 
                label="Achievements" 
                value={isLoading ? "..." : `${user.achievements} Badges`} 
              />
            </section>

            <ActionLogger />
            <ImpactChart />
          </div>

          {/* RIGHT SIDE */}
          <aside className="space-y-8">
            <Leaderboard />
            <SDGGrid />
          </aside>

        </div>
      </main>
    </div>
  );
}