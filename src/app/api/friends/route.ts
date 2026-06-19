import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { readTokenPayload } from "@/utils/getTokenPayload";
import { UserModel } from "@/models/user.model";
import { ProfileModel } from "@/models/profile.model";
import { ActionModel } from "@/models/action.model";
import { FollowModel } from "@/models/follow.model";
import { followSchema } from "@/utils/validation";
import { checkRateLimit, getRequestIdentifier } from "@/utils/rate-limit";
import { hasValidSameOrigin } from "@/utils/csrf";

const RECENT_ACTIONS_PER_FRIEND = 5;

type RecentAction = {
    description: string;
    sdgs: number[];
    points: number;
    completedAt: Date;
};

// GET /api/friends — list everyone the current user follows, with their
// headline stats and most recent actions.
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const payload = await readTokenPayload(req);
        if (!payload?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const follows = await FollowModel.find({ follower: payload.id })
            .sort({ createdAt: -1 })
            .select("following")
            .lean();

        const followingIds = follows.map((f) => f.following);

        if (followingIds.length === 0) {
            return NextResponse.json({ friends: [] }, { status: 200 });
        }

        const [users, profiles, recentGroups] = await Promise.all([
            UserModel.find({ _id: { $in: followingIds } })
                .select("name username")
                .lean(),
            ProfileModel.find({ user: { $in: followingIds } })
                .select("user totalPoints currentStreak acheivements")
                .lean(),
            ActionModel.aggregate<{ _id: mongoose.Types.ObjectId; actions: RecentAction[] }>([
                { $match: { user: { $in: followingIds } } },
                { $sort: { completedAt: -1 } },
                {
                    $group: {
                        _id: "$user",
                        actions: {
                            $push: {
                                description: "$description",
                                sdgs: "$sdgs",
                                points: "$points",
                                completedAt: "$completedAt",
                            },
                        },
                    },
                },
                { $project: { actions: { $slice: ["$actions", RECENT_ACTIONS_PER_FRIEND] } } },
            ]),
        ]);

        const profileByUser = new Map(profiles.map((p) => [String(p.user), p]));
        const recentByUser = new Map(recentGroups.map((g) => [String(g._id), g.actions]));

        // Preserve the follow order (most recently followed first).
        const friends = followingIds
            .map((id) => {
                const user = users.find((u) => String(u._id) === String(id));
                if (!user) return null;
                const profile = profileByUser.get(String(id));
                return {
                    id: String(user._id),
                    name: user.name,
                    username: user.username,
                    totalPoints: profile?.totalPoints ?? 0,
                    currentStreak: profile?.currentStreak ?? 0,
                    achievements: profile?.acheivements ?? 0,
                    recentActions: recentByUser.get(String(id)) ?? [],
                };
            })
            .filter(Boolean);

        return NextResponse.json({ friends }, { status: 200 });
    } catch (err) {
        console.error("Fetch friends failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({ error: "Error fetching friends" }, { status: 500 });
    }
}

// POST /api/friends — follow a user by username.
export async function POST(req: NextRequest) {
    try {
        if (!hasValidSameOrigin(req)) {
            return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
        }

        const ip = getRequestIdentifier(req.headers.get("x-forwarded-for"), "unknown");
        const rateLimit = await checkRateLimit({
            key: `follow:${ip}`,
            limit: 30,
            windowMs: 60_000,
        });
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many requests. Please try again shortly." },
                { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
            );
        }

        await connectToDatabase();
        const payload = await readTokenPayload(req);
        if (!payload?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parseResult = followSchema.safeParse(await req.json());
        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid username" }, { status: 400 });
        }

        const target = await UserModel.findOne({ username: parseResult.data.username })
            .select("_id name username")
            .lean();

        if (!target) {
            return NextResponse.json({ error: "No user found with that username" }, { status: 404 });
        }

        if (String(target._id) === payload.id) {
            return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
        }

        // Idempotent: upsert so following someone twice is a no-op, not an error.
        await FollowModel.updateOne(
            { follower: payload.id, following: target._id },
            { $setOnInsert: { follower: payload.id, following: target._id } },
            { upsert: true }
        );

        return NextResponse.json(
            {
                message: `You are now following ${target.username}`,
                friend: { id: String(target._id), name: target.name, username: target.username },
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("Follow failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({ error: "Error following user" }, { status: 500 });
    }
}

// DELETE /api/friends — unfollow a user by username.
export async function DELETE(req: NextRequest) {
    try {
        if (!hasValidSameOrigin(req)) {
            return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
        }

        await connectToDatabase();
        const payload = await readTokenPayload(req);
        if (!payload?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parseResult = followSchema.safeParse(await req.json());
        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid username" }, { status: 400 });
        }

        const target = await UserModel.findOne({ username: parseResult.data.username })
            .select("_id")
            .lean();

        if (!target) {
            return NextResponse.json({ error: "No user found with that username" }, { status: 404 });
        }

        await FollowModel.deleteOne({ follower: payload.id, following: target._id });

        return NextResponse.json({ message: "Unfollowed" }, { status: 200 });
    } catch (err) {
        console.error("Unfollow failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({ error: "Error unfollowing user" }, { status: 500 });
    }
}
