import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { readTokenPayload } from "@/utils/getTokenPayload";
import { UserModel } from "@/models/user.model";
import { FollowModel } from "@/models/follow.model";
import { friendSearchSchema } from "@/utils/validation";
import { checkRateLimit, getRequestIdentifier } from "@/utils/rate-limit";

const SEARCH_LIMIT = 10;

// Escape user input before using it in a RegExp so a query like "a.*" can't be
// turned into an expensive or unexpected pattern.
function escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/friends/search?q= — find users by username prefix to follow.
export async function GET(req: NextRequest) {
    try {
        const ip = getRequestIdentifier(req.headers.get("x-forwarded-for"), "unknown");
        const rateLimit = await checkRateLimit({
            key: `friend-search:${ip}`,
            limit: 40,
            windowMs: 60_000,
        });
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many searches. Please try again shortly." },
                { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
            );
        }

        await connectToDatabase();
        const payload = await readTokenPayload(req);
        if (!payload?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parseResult = friendSearchSchema.safeParse({
            q: req.nextUrl.searchParams.get("q") ?? "",
        });
        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid search query" }, { status: 400 });
        }

        const prefix = parseResult.data.q.toLowerCase();
        const pattern = new RegExp(`^${escapeRegex(prefix)}`);

        const [matches, following] = await Promise.all([
            UserModel.find({
                username: pattern,
                _id: { $ne: payload.id }, // never return yourself
            })
                .select("name username")
                .limit(SEARCH_LIMIT)
                .lean(),
            FollowModel.find({ follower: payload.id }).select("following").lean(),
        ]);

        const followingSet = new Set(following.map((f) => String(f.following)));

        const results = matches.map((u) => ({
            id: String(u._id),
            name: u.name,
            username: u.username,
            isFollowing: followingSet.has(String(u._id)),
        }));

        return NextResponse.json({ results }, { status: 200 });
    } catch (err) {
        console.error("Friend search failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({ error: "Error searching users" }, { status: 500 });
    }
}
