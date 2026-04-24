"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Recommendation {
  sdgId: number;
  goalName: string;
  reason: string;
  suggestedAction: string;
  suggestedPoints: number;
}

interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
}

const ButtonLink = ({ href, className, children, ...props }: ButtonLinkProps) => {
  return (
    <Link
      href={href}
      className={`inline-block rounded-md text-white font-semibold transition-colors px-4 py-2 ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
};

export default function Header() {
  const [user, setUser] = useState({ name: "", points: 0, streak: 0, achievements: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await fetch("/api/users/sign-out", {
        method: "GET",
      });
      setUser({ name: "", points: 0, streak: 0, achievements: 0 });
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    if (!isRecommendationsOpen) {
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setIsRecommendationsLoading(true);
        setRecommendationsError(null);

        const response = await fetch("/api/get-recommendations", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to load recommendations");
        }

        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendationsError("Recommendations are unavailable right now.");
      } finally {
        setIsRecommendationsLoading(false);
      }
    };

    fetchRecommendations();
  }, [isRecommendationsOpen]);
    
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/get-dashboard-profile')
      .then(res => res.json())
      .then(data => {
        if(data.profile){
          setUser({
            name: data.profile.name,
            points: data.profile.totalPoints,
            streak: data.profile.currentStreak,
            achievements: data.profile.acheivements,
          });
        }
      })
        .catch(err => console.error("Failed to fetch user:", err))
        .finally(() => setIsLoading(false));
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🌱</span>
          <h1 className="text-xl font-bold text-emerald-600">SDG Buddy</h1>
        </Link>
        
        {!isLoading && (
          <>
            {user.name === "" ? (
              <ButtonLink
                href="/sign-in"
                className="bg-emerald-600 hover:bg-emerald-700"
                data-testid="link-header-login"
              >
                Sign In
              </ButtonLink>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setIsRecommendationsOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-600 text-emerald-600 transition-colors hover:bg-emerald-50"
                  aria-label="Open recommendations"
                  title="Recommendations"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" />
                    <path d="M19 13l.8 1.8L21.5 16l-1.7.7L19 18.5l-.8-1.8L16.5 16l1.7-.7L19 13z" />
                    <path d="M5 14l1.1 2.4L8.5 17l-2.4 1L5 20.5 3.9 18 1.5 17l2.4-.6L5 14z" />
                  </svg>
                </button>
                <span className="text-xl font-bold text-emerald-600">{user.name}</span>
                <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-700">
                  {user.name.split(' ')[0][0].toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="rounded-md border border-emerald-600 px-4 py-2 font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            )}
          </>
        )}
      </nav>

      {isRecommendationsOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/35 p-4 pt-24"
          onClick={() => setIsRecommendationsOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-emerald-700">Your Recommendations</h2>
                <p className="text-sm text-slate-600">Suggestions based on your current SDG balance.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRecommendationsOpen(false)}
                className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close recommendations"
              >
                X
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-5">
              {isRecommendationsLoading && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-16 bg-slate-100 rounded-lg"></div>
                  <div className="h-16 bg-slate-100 rounded-lg"></div>
                  <div className="h-16 bg-slate-100 rounded-lg"></div>
                </div>
              )}

              {!isRecommendationsLoading && recommendationsError && (
                <p className="text-sm text-red-500">{recommendationsError}</p>
              )}

              {!isRecommendationsLoading && !recommendationsError && recommendations.length === 0 && (
                <p className="text-sm text-slate-600">No recommendations yet. Log a few actions first.</p>
              )}

              {!isRecommendationsLoading && !recommendationsError && recommendations.length > 0 && (
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
            </div>
          </div>
        </div>
      )}
    </header>
  );
}