"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PWAInstallButton from "@/components/layout/PWAInstallButton";

type HeaderUser = {
  name: string;
  points: number;
  streak: number;
  achievements: number;
};

const INITIAL_USER: HeaderUser = {
  name: "",
  points: 0,
  streak: 0,
  achievements: 0,
};

interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
}

const ButtonLink = ({ href, className, children, ...props }: ButtonLinkProps) => {
  const linkClassName = [
    "inline-block rounded-md text-white font-semibold transition-colors px-4 py-2",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href={href}
      className={linkClassName}
      {...props}
    >
      {children}
    </Link>
  );
};

export default function Header() {
  const [user, setUser] = useState<HeaderUser>(INITIAL_USER);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await fetch("/api/users/sign-out", {
        method: "GET",
      });
      setUser(INITIAL_USER);
      router.replace("/sign-in");
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/get-dashboard-profile", {
          signal: controller.signal,
        });
        const data = await response.json();

        if (data.profile) {
          setUser({
            name: data.profile.name ?? "",
            points: data.profile.totalPoints ?? 0,
            streak: data.profile.currentStreak ?? 0,
            achievements: data.profile.acheivements ?? 0,
          });
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to fetch user:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      controller.abort();
    };
  }, []);

  const userInitial = user.name.trim().charAt(0).toUpperCase();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🌱</span>
          <h1 className="text-xl font-bold text-emerald-600">SDG Buddy</h1>
        </Link>

        <div className="flex min-h-11 items-center justify-end gap-3 justify-self-end">
          <PWAInstallButton />
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
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-xl font-bold text-emerald-600">{user.name}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200 font-bold text-emerald-700">
                    {userInitial || "?"}
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
        </div>
      </nav>

    </header>
  );
}