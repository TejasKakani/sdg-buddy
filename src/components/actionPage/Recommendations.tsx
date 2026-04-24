"use client";

import { useEffect, useState } from "react";

interface Recommendation {
  sdgId: number;
  goalName: string;
  reason: string;
  suggestedAction: string;
  suggestedPoints: number;
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/get-recommendations", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to load recommendations");
        }

        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Recommendations are unavailable right now.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-emerald-600">Recommended Next Actions</h3>
        <p className="text-sm text-emerald-800">Simple suggestions to balance your SDG impact.</p>
      </div>

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-slate-100 rounded-lg"></div>
          <div className="h-16 bg-slate-100 rounded-lg"></div>
          <div className="h-16 bg-slate-100 rounded-lg"></div>
        </div>
      )}

      {!isLoading && error && <p className="text-sm text-red-500">{error}</p>}

      {!isLoading && !error && recommendations.length === 0 && (
        <p className="text-sm text-slate-600">No recommendations yet. Log a few actions first.</p>
      )}

      {!isLoading && !error && recommendations.length > 0 && (
        <ul className="space-y-3">
          {recommendations.map((item) => (
            <li key={item.sdgId} className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">SDG {item.sdgId}: {item.goalName}</p>
              <p className="text-sm text-slate-700 mt-1">{item.reason}</p>
              <p className="text-sm text-slate-900 mt-2">Try this: {item.suggestedAction}</p>
              <p className="text-xs text-emerald-700 mt-2">Potential impact: +{item.suggestedPoints} points</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
