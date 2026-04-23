"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Image from "next/image";

interface GoalData {
  id: string;
  label: string;
  color: string;
  logo: string;
  data: number[];
}

export default function ImpactChart() {
  const [goals, setGoals] = useState<GoalData[]>([]);
  // Start with an empty string, we will dynamically set this after fetching
  const [activeGoalId, setActiveGoalId] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Added error state

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  // 1. Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const res = await fetch('/api/get-chart-data');
        if (!res.ok) throw new Error("Failed to fetch data");
        
        const data: GoalData[] = await res.json();
        setGoals(data);
        
        // Dynamically set the active goal to the first item in the array
        if (data && data.length > 0) {
          setActiveGoalId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Could not load impact data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeGoal = goals.find((g) => g.id === activeGoalId);

  // 2. Chart Lifecycle
  useEffect(() => {
    // If we don't have a canvas or an active goal yet, bail out
    if (!chartRef.current || !activeGoal) return;

    // Destroy existing chart to prevent memory leaks
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: activeGoal.label,
          data: activeGoal.data,
          borderColor: activeGoal.color,
          backgroundColor: `${activeGoal.color}33`,
          borderWidth: 2,
          borderRadius: 6,
          hoverBackgroundColor: activeGoal.color,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 750, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' as const },
            callbacks: {
              label: (context) => ` Points: ${context.parsed.y}`
            }
          }
        },
        scales: {
          y: { 
            beginAtZero: true,
            grid: { display: true, color: '#f1f5f9' },
            ticks: { stepSize: 10 }
          },
          x: { grid: { display: false } }
        },
      },
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null; // Nullify the ref to be safe
      }
    };
  }, [activeGoal]); // Removed isLoading from deps. activeGoal change is enough.

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-emerald-600">Impact Tracking</h3>
          <p className="text-sm text-emerald-800">
            {isLoading ? "Fetching data..." : `Monitoring ${activeGoal?.label || 'Goals'}`}
          </p>
        </div>

        <div className="flex flex-col sm:items-end">
          <p className="text-xs text-slate-500 mb-2">Select a goal to view</p>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {goals.map((goal) => {
              const isActive = goal.id === activeGoalId;
              return (
                <button
                  key={goal.id}
                  type="button"
                  disabled={isLoading || !!error}
                  onClick={() => setActiveGoalId(goal.id)}
                  className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-50
                    ${isActive ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"}
                  `}
                  aria-pressed={isActive}
                  aria-label={`Show chart for ${goal.label}`}
                >
                  <Image
                    src={goal.logo}
                    alt={`SDG icon for ${goal.label}`}
                    width={20}
                    height={20}
                    className="w-5 h-5 rounded object-cover"
                  />
                  <span>{goal.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative h-72 w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}
        
        {/* Render Error State */}
        {!isLoading && error && (
          <div className="h-full flex flex-col items-center justify-center text-red-500 text-sm font-medium">
            <p>{error}</p>
          </div>
        )}

        {/* Render Empty State */}
        {!isLoading && !error && goals.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-emerald-800">
            <p>No impact data recorded yet.</p>
          </div>
        )}

        {/* Render Canvas */}
        {!isLoading && !error && goals.length > 0 && (
          <canvas ref={chartRef} aria-label="Bar chart showing impact over time" role="img"></canvas>
        )}
      </div>
    </section>
  );
}