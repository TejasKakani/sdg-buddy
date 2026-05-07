'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface Recommendation {
    _id?: string;
    description: string;
    sdgs: number[];
    points: number;
    category?: string;
    score?: number;
    completedAt?: string;
}

export default function RecommendationsButton() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/get-recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 5 }),
            });

            const data = await response.json();
            if (data.success) {
                setRecommendations(data.recommendations);
                setShowModal(true);
            } else {
                setError(data.error || 'Failed to fetch recommendations');
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setError('An error occurred while fetching recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleLogAction = async (rec: Recommendation) => {
        try {
            const response = await fetch('/api/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: rec.description,
                }),
            });

            if (response.ok) {
                alert('Action logged successfully!');
                setShowModal(false);
                setRecommendations([]);
            } else {
                alert('Failed to log action');
            }
        } catch (error) {
            console.error('Error logging action:', error);
            alert('Error logging action');
        }
    };

    return (
        <>
            <button
                onClick={fetchRecommendations}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
                <Sparkles size={18} />
                {loading ? 'Loading...' : '💡 Get AI Recommendations'}
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                ✨ Recommended Actions For You
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        {recommendations.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">
                                No recommendations yet. Start logging actions to get personalized
                                recommendations! 🚀
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recommendations.map((rec, idx) => (
                                    <div
                                        key={idx}
                                        className="border-2 border-gray-200 p-4 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-lg text-gray-800 flex-1">
                                                {rec.description}
                                            </h3>
                                            {rec.score && (
                                                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full whitespace-nowrap">
                                                    {(rec.score * 100).toFixed(0)}% Match
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-4 mb-3 text-sm text-gray-600">
                                            <span className="font-semibold">
                                                Points: <span className="text-green-600">{rec.points}</span>
                                            </span>
                                            <span>
                                                SDGs: <span className="font-semibold">{rec.sdgs.join(', ')}</span>
                                            </span>
                                            {rec.category && (
                                                <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                                                    {rec.category}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleLogAction(rec)}
                                            className="w-full px-4 py-2 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                                        >
                                            ✓ Log This Action
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-all duration-200"
                            >
                                Close
                            </button>
                            <button
                                onClick={fetchRecommendations}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
                            >
                                {loading ? 'Refreshing...' : 'Refresh Recommendations'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
