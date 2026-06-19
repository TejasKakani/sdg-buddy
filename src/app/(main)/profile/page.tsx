"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ActionHistory from "@/components/actionPage/ActionHistory";
import Friends from "@/components/profile/Friends";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState({
    name: "",
    username: "",
    points: 0,
    streak: 0,
    achievements: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [profileRes, userRes] = await Promise.all([
          fetch("/api/get-dashboard-profile"),
          fetch("/api/users/get-user"),
        ]);
        if (!profileRes.ok) throw new Error("Failed to load profile");

        const data = await profileRes.json();
        const userData = userRes.ok ? await userRes.json() : null;

        if (data?.profile) {
          setUser({
            name: data.profile.name || "User",
            username: userData?.user?.username || "",
            points: data.profile.totalPoints || 0,
            streak: data.profile.currentStreak || 0,
            achievements: data.profile.acheivements || 0,
          });
        } else {
          router.replace("/sign-in");
          router.refresh();
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Could not load your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

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
    <div className="min-h-screen bg-emerald-50 p-4 md:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto py-4 space-y-8">
        {/* Profile Header */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-8 bg-slate-200 rounded w-48"></div>
              <div className="h-5 bg-slate-200 rounded w-64"></div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-200 text-2xl font-bold text-emerald-700">
                {user.name.trim().charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-600">{user.name}</h2>
                {user.username && (
                  <p className="text-slate-500 text-sm mt-0.5">@{user.username}</p>
                )}
                <p className="text-emerald-800 mt-1">Your sustainability journey</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{isLoading ? "..." : user.points}</p>
              <p className="text-sm text-emerald-700 mt-1">Total Points</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{isLoading ? "..." : `${user.streak} Days`}</p>
              <p className="text-sm text-emerald-700 mt-1">Current Streak</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{isLoading ? "..." : `${user.achievements} Badges`}</p>
              <p className="text-sm text-emerald-700 mt-1">Achievements</p>
            </div>
          </div>
        </div>

        {/* Action History */}
        <ActionHistory />

        {/* Friends */}
        <Friends />
      </main>
    </div>
  );
}
