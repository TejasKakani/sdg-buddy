import { ProfileModel } from "@/models/profile.model";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        await connectToDatabase();
        const leaderboard = await ProfileModel.find({})
            .sort({ totalPoints: -1, createdAt: 1 })
            .select({ name: 1, totalPoints: 1 })
            .lean();

        const formattedLeaderboard = leaderboard.map((user) => ({
            name: user.name,
            totalPoints: user.totalPoints,
        }));

        return NextResponse.json({ leaderboard: formattedLeaderboard }, {
            status: 200
        }
        )
    }catch(err: unknown){
        const message = err instanceof Error ? err.message : "Error fetching leaderboard";
        return NextResponse.json({error: message}, {
            status: 500
        })
    }
}