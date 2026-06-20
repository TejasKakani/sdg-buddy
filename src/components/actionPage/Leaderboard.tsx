"use client";

import { LeaderboardUser } from "@/types/action";
import { useEffect, useState } from "react";

// Add an interface for the raw API data to avoid using 'any'
interface ApiLeaderboardItem {
  name?: string;
  username?: string;
  totalPoints: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch('/api/get-leaderboard', {
          method: 'GET',
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch leaderboard");
        }

        const data = await res.json();

        const rawLeaderboard = data?.leaderboard;

        if (Array.isArray(rawLeaderboard)) {
          const formattedLeaderboard = rawLeaderboard.map((user: ApiLeaderboardItem, index: number) => ({
            rank: index + 1,  
            name: user.name || "Unknown user",
            username: user.username || "Unknown username",
            points: user.totalPoints || 0,
          }));
          setLeaderboard(formattedLeaderboard);
        } else {
          // If data isn't in the expected format, default to an empty list
          setLeaderboard([]);
        }
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Could not load the leaderboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-75 flex flex-col">
      <h3 className="text-xl font-bold mb-4 text-emerald-600">Leaderboard</h3>

      {/* 1. Loading State */}
      {isLoading ? (
        <div className="grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : 
      
      /* 2. Error State */
      error ? (
        <div className="grow flex items-center justify-center text-red-500 text-sm">
          <p>{error}</p>
        </div>
      ) : 
      
      /* 3. Empty State */
      leaderboard.length === 0 ? (
        <div className="grow flex items-center justify-center text-emerald-800 text-sm">
          <p>No rankings available yet. Be the first!</p>
        </div>
      ) : 
      
      /* 4. Data State */
      (
        <ul className="space-y-3">
          {leaderboard.map(user => {
            const isCurrentUser = user.name === "You";

            return (
              <li
                key={user.rank}
                className={`flex justify-between items-center p-3 transition-colors ${
                  isCurrentUser 
                    ? "bg-emerald-50 rounded-lg border border-emerald-100" 
                    : "hover:bg-slate-50 rounded-lg border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 text-center font-bold ${
                    user.rank <= 3 ? "text-emerald-600" : "text-slate-400"
                  }`}>
                    {/* Fun UX touch: Add medals for top 3 */}
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                  </span>
                  <span className={`font-medium ${isCurrentUser ? "text-emerald-800" : "text-slate-700"} flex flex-col`}>
                    {user.name}
                    <span className="text-slate-400 text-xs ml-1">
                      @{user.username}
                    </span>
                  </span>
                </div>
                <span className={`font-semibold ${
                  isCurrentUser ? "text-emerald-700" : "text-slate-600"
                }`}>
                  {user.points.toLocaleString()} pts
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  );
}