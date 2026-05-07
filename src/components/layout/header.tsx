"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InstallAppButton from "@/components/layout/InstallAppButton";

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
              <div className="flex items-center gap-3">
                <InstallAppButton />
                <ButtonLink
                  href="/sign-in"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  data-testid="link-header-login"
                >
                  Sign In
                </ButtonLink>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <InstallAppButton />
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

    </header>
  );
}