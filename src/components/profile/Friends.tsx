"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getSDGColor, getSDGName, getSDGLogo } from "@/constants/sdgGoals";

interface RecentAction {
  description: string;
  sdgs: number[];
  points: number;
  completedAt: string;
}

interface Friend {
  id: string;
  name: string;
  username: string;
  totalPoints: number;
  currentStreak: number;
  achievements: number;
  recentActions: RecentAction[];
}

interface SearchResult {
  id: string;
  name: string;
  username: string;
  isFollowing: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Friends() {
  const [myUsername, setMyUsername] = useState<string | null>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load the current user's own username so they can share it.
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/users/get-user", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.username) setMyUsername(data.user.username);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // Load the list of people the user follows (refetched when refreshKey bumps).
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/friends", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load friends");
        return res.json();
      })
      .then((data) => {
        setFriends(data.friends ?? []);
        setFriendsError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setFriendsError("Could not load your friends.");
      })
      .finally(() => setLoadingFriends(false));
    return () => controller.abort();
  }, [refreshKey]);

  // Debounced username search.
  useEffect(() => {
    const q = query.trim();
    const controller = new AbortController();

    const timer = setTimeout(() => {
      if (q.length < 1) {
        setResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      fetch(`/api/friends/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data) => setResults(data.results ?? []))
        .catch((err: unknown) => {
          if (!(err instanceof Error && err.name === "AbortError")) setResults([]);
        })
        .finally(() => setSearching(false));
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, refreshKey]);

  const handleFollow = async (username: string) => {
    setMessage(null);
    setPendingUsername(username);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage({ type: "error", text: data?.error || "Could not follow that user." });
        return;
      }
      setMessage({ type: "success", text: data?.message || `You are now following ${username}.` });
      setQuery("");
      setResults([]);
      setRefreshKey((k) => k + 1);
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setPendingUsername(null);
    }
  };

  const handleUnfollow = async (username: string) => {
    setMessage(null);
    setPendingUsername(username);
    try {
      const res = await fetch("/api/friends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage({ type: "error", text: data?.error || "Could not unfollow that user." });
        return;
      }
      setMessage({ type: "success", text: `Unfollowed @${username}.` });
      setRefreshKey((k) => k + 1);
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setPendingUsername(null);
    }
  };

  const trimmedQuery = query.trim();

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h3 className="text-xl font-bold text-emerald-600">Friends</h3>
        {myUsername && (
          <p className="text-sm text-slate-500">
            Your username: <span className="font-semibold text-slate-700">@{myUsername}</span>
          </p>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Follow friends by their username to see their progress.
      </p>

      {/* Add a friend */}
      <div className="relative mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a username to follow…"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
        />

        {trimmedQuery.length > 0 && (
          <div className="mt-2 border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
            {searching && results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400">Searching…</p>
            ) : results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400">No users found for “{trimmedQuery}”.</p>
            ) : (
              results.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                  </div>
                  {user.isFollowing ? (
                    <span className="text-xs font-medium text-slate-400 shrink-0">Following</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleFollow(user.username)}
                      disabled={pendingUsername === user.username}
                      className="shrink-0 px-3 py-1.5 text-sm font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {pendingUsername === user.username ? "Following…" : "Follow"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {message && (
        <p
          className={`text-sm mb-4 ${message.type === "success" ? "text-emerald-600" : "text-red-500"}`}
          role="status"
        >
          {message.text}
        </p>
      )}

      {/* Following list */}
      <div className="mt-4">
        {loadingFriends ? (
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-slate-100 rounded-lg" />
            <div className="h-20 bg-slate-100 rounded-lg" />
          </div>
        ) : friendsError ? (
          <p className="text-red-500 text-sm">{friendsError}</p>
        ) : friends.length === 0 ? (
          <p className="text-slate-400 text-sm">
            You’re not following anyone yet. Search a username above to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div key={friend.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-200 font-bold text-emerald-700">
                      {friend.name.trim().charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{friend.name}</p>
                      <p className="text-xs text-slate-400 truncate">@{friend.username}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnfollow(friend.username)}
                    disabled={pendingUsername === friend.username}
                    className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {pendingUsername === friend.username ? "…" : "Unfollow"}
                  </button>
                </div>

                <div className="flex gap-4 mt-3 text-sm text-slate-500">
                  <span><span className="font-semibold text-emerald-600">{friend.totalPoints}</span> pts</span>
                  <span><span className="font-semibold text-emerald-600">{friend.currentStreak}</span> day streak</span>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Recent actions
                  </p>
                  {friend.recentActions.length === 0 ? (
                    <p className="text-sm text-slate-400">No actions logged yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {friend.recentActions.map((action, idx) => (
                        <li key={idx} className="bg-slate-50 rounded-md px-3 py-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-slate-700">{action.description}</p>
                            <span className="shrink-0 text-xs font-semibold text-emerald-600">
                              +{action.points}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {action.sdgs.map((sdgId) => (
                              <span
                                key={sdgId}
                                className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${getSDGColor(sdgId)}20`,
                                  color: getSDGColor(sdgId),
                                }}
                                title={getSDGName(sdgId)}
                              >
                                <Image
                                  src={getSDGLogo(sdgId)}
                                  alt=""
                                  width={12}
                                  height={12}
                                  className="w-3 h-3 rounded-sm object-cover"
                                />
                                SDG {sdgId}
                              </span>
                            ))}
                            <span className="text-[11px] text-slate-400 ml-auto">
                              {formatDate(action.completedAt)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
