"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ActionHistoryItem } from "@/types/action";
import { getSDGColor, getSDGName, getSDGLogo } from "@/constants/sdgGoals";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ActionHistoryProps {
  compact?: boolean;
}

export default function ActionHistory({ compact = false }: ActionHistoryProps) {
  const [actions, setActions] = useState<ActionHistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch is inlined as a promise chain so all setState calls happen inside
  // async callbacks (never synchronously in the effect body). Loading is shown
  // via the initial state on mount and via goToPage() on page change. The
  // AbortController cancels in-flight requests when the page changes or the
  // component unmounts.
  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/actions?page=${page}&limit=10`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load action history");
        return res.json();
      })
      .then((data) => {
        setActions(data.actions);
        setPagination(data.pagination);
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Error fetching action history:", err);
        setError("Could not load action history.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page]);

  const goToPage = (nextPage: number) => {
    setLoading(true);
    setPage(nextPage);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-xl font-bold mb-4 text-emerald-600">Action History</h3>

      {error && (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      )}

      {loading && actions.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-lg p-4">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : actions.length === 0 ? (
        <p className="text-slate-500 text-sm">No actions logged yet. Start making an impact!</p>
      ) : (
        <>
          <div className={`space-y-3 pr-1 ${compact ? "max-h-[500px] overflow-y-auto" : ""}`}>
            {actions.map((action) => (
              <div
                key={action._id}
                className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-slate-800 font-medium flex-1 leading-snug">
                    {action.description}
                  </p>
                  <span className="shrink-0 bg-emerald-100 text-emerald-700 font-bold text-sm px-2.5 py-1 rounded-full">
                    +{action.points}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {action.sdgs.map((sdgId) => (
                    <span
                      key={sdgId}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${getSDGColor(sdgId)}20`,
                        color: getSDGColor(sdgId),
                      }}
                      title={getSDGName(sdgId)}
                    >
                      <Image
                        src={getSDGLogo(sdgId)}
                        alt=""
                        width={14}
                        height={14}
                        className="w-3.5 h-3.5 rounded-sm object-cover"
                      />
                      SDG {sdgId}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-400 mt-2">
                  {formatDate(action.completedAt)}
                </p>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
