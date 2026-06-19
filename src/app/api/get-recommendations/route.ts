import { NextRequest, NextResponse } from "next/server";
import { ActionModel } from "@/models/action.model";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { readTokenPayload } from "@/utils/getTokenPayload";
import mongoose from "mongoose";
import { recommendationRequestSchema } from "@/utils/validation";
import { checkRateLimit, getRequestIdentifier } from "@/utils/rate-limit";
import { hasValidSameOrigin } from "@/utils/csrf";

// Vector search + app-side cosine ranking over many candidates can exceed the
// default 10s function limit.
export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        if (!hasValidSameOrigin(request)) {
            return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
        }

        const ip = getRequestIdentifier(request.headers.get("x-forwarded-for"), "unknown");
        const rateLimit = await checkRateLimit({
            key: `recommendations:${ip}`,
            limit: 30,
            windowMs: 60_000,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many recommendation requests. Please try again shortly." },
                {
                    status: 429,
                    headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
                }
            );
        }

        const payload = await readTokenPayload(request);

        if (!payload?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const body = await request.json().catch(() => ({}));
        const parseResult = recommendationRequestSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid recommendation request payload" }, { status: 400 });
        }
        const limit = parseResult.data.limit;

        // Step 1: Get user's past actions (last 5)
        const userActions = await ActionModel.find({ user: payload.id })
            .sort({ completedAt: -1 })
            .limit(5);

        // If no past actions, return popular actions from community
        if (userActions.length === 0) {
            return NextResponse.json(await getPopularRecommendations(limit));
        }

        // Step 2: Get embeddings from user's actions (filter out zero vectors)
        const userEmbeddings = userActions
            .filter(
                (action) =>
                    action.descriptionEmbedding &&
                    action.descriptionEmbedding.length > 0 &&
                    !isZeroVector(action.descriptionEmbedding)
            )
            .map((action) => action.descriptionEmbedding!);

        // If no valid embeddings, return popular recommendations
        if (userEmbeddings.length === 0) {
            return NextResponse.json(await getPopularRecommendations(limit));
        }

        // Step 3: Calculate average embedding (centroid of user's interests)
        const avgEmbedding = calculateAverageEmbedding(userEmbeddings);

        // Step 4: Try Atlas Vector Search first, then fallback to app-side cosine ranking.
        const userActionIds = userActions.map((a) => a._id);

        let recommendations: unknown[] = [];
        try {
            recommendations = await ActionModel.aggregate([
                {
                    $vectorSearch: {
                        index: "action_embedding_index",
                        path: "descriptionEmbedding",
                        queryVector: avgEmbedding,
                        numCandidates: Math.max(limit * 20, 50),
                        limit: limit * 3,
                    },
                },
                {
                    $match: {
                        _id: { $nin: userActionIds },
                        descriptionEmbedding: { $exists: true, $ne: null },
                    },
                },
                {
                    $project: {
                        description: 1,
                        sdgs: 1,
                        points: 1,
                        category: 1,
                        completedAt: 1,
                        score: { $meta: "vectorSearchScore" },
                    },
                },
                {
                    $sort: { score: -1 },
                },
                {
                    $limit: limit,
                },
            ]);
        } catch {
            console.warn("Vector search unavailable, using fallback ranking");
            recommendations = await getFallbackRecommendations(avgEmbedding, userActionIds, limit);
        }

        return NextResponse.json({
            success: true,
            recommendations,
            count: recommendations.length,
        });
    } catch (error) {
        console.error("Error fetching recommendations", error instanceof Error ? error.message : "unknown error");
        return NextResponse.json(
            { error: "Failed to fetch recommendations" },
            { status: 500 }
        );
    }
}

/**
 * Helper: Calculate average embedding (vector centroid)
 * This represents the center of all user's past actions in vector space
 */
function calculateAverageEmbedding(embeddings: number[][]): number[] {
    if (embeddings.length === 0) return [];

    const dimension = embeddings[0].length;
    const average = new Array(dimension).fill(0);

    embeddings.forEach((embedding) => {
        embedding.forEach((val, idx) => {
            average[idx] += val;
        });
    });

    return average.map((val) => val / embeddings.length);
}

/**
 * Helper: Check if a vector is all zeros
 */
function isZeroVector(vector: number[]): boolean {
    return vector.every((val) => val === 0);
}

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0 || b.length === 0) return 0;

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i += 1) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function getFallbackRecommendations(
    queryVector: number[],
    excludedIds: mongoose.Types.ObjectId[],
    limit: number
) {
    const candidates = await ActionModel.find({
        _id: { $nin: excludedIds },
        descriptionEmbedding: { $exists: true, $ne: null },
    })
        .select("description sdgs points category completedAt descriptionEmbedding")
        .limit(Math.max(limit * 30, 200))
        .lean();

    const ranked = candidates
        .map((candidate) => {
            const embedding = Array.isArray(candidate.descriptionEmbedding)
                ? candidate.descriptionEmbedding
                : [];

            return {
                _id: candidate._id,
                description: candidate.description,
                sdgs: candidate.sdgs,
                points: candidate.points,
                category: candidate.category,
                completedAt: candidate.completedAt,
                score: cosineSimilarity(queryVector, embedding),
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return ranked;
}

/**
 * Helper: Get popular recommendations if no user history
 * Groups actions by description and returns most common ones
 */
async function getPopularRecommendations(limit: number) {
    try {
        const popular = await ActionModel.aggregate([
            {
                $group: {
                    _id: "$description",
                    count: { $sum: 1 },
                    points: { $first: "$points" },
                    sdgs: { $first: "$sdgs" },
                    category: { $first: "$category" },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: limit,
            },
            {
                $project: {
                    description: "$_id",
                    points: 1,
                    sdgs: 1,
                    category: 1,
                    count: 1,
                    _id: 0,
                },
            },
        ]);

        return {
            success: true,
            recommendations: popular,
            count: popular.length,
        };
    } catch (error) {
        console.error("Error fetching popular recommendations", error instanceof Error ? error.message : "unknown error");
        return {
            success: false,
            recommendations: [],
            count: 0,
        };
    }
}
