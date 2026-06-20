import { ProfileModel } from "@/models/profile.model";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { readTokenPayload } from "@/utils/getTokenPayload";

export async function GET(req: NextRequest){
    try{
        const payload = await readTokenPayload(req);
        if (!payload?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const leaderboard = await ProfileModel.find({})
            .sort({ totalPoints: -1, createdAt: 1 })
            .select({ name: 1, username: 1, totalPoints: 1 })
            .lean();

        const formattedLeaderboard = leaderboard.map((user) => ({
            name: user.name,
            username: user.username,
            totalPoints: user.totalPoints,
        }));

        return NextResponse.json({ leaderboard: formattedLeaderboard }, {
            status: 200
        }
        )
    }catch(err){
        console.error("Fetch leaderboard failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({error: "Error fetching leaderboard"}, {
            status: 500
        })
    }
}