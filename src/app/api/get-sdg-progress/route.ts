import { readTokenPayload } from "@/utils/getTokenPayload";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextRequest, NextResponse } from "next/server";
import { ProfileModel } from "@/models/profile.model";

export async function GET(
    req: NextRequest
){
    try{
        await connectToDatabase();
        const payload = await readTokenPayload(req);
        if (!payload?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = payload.id;
        
        // Read SDG progress directly from Profile instead of aggregating from Actions
        const profile = await ProfileModel.findOne({ user: userId });
        
        if (!profile || !profile.sdgGrid) {
            // Return empty array if no profile or sdgGrid exists
            return NextResponse.json(
                Array.from({ length: 17 }, (_, i) => ({
                    sdgId: i + 1,
                    points: 0
                })),
                { status: 200 }
            );
        }
        
        // Format the sdgGrid data to match the expected response format
        const sdgData = profile.sdgGrid.map(entry => ({
            sdgId: entry.sdgId,
            points: entry.points
        })).sort((a, b) => a.sdgId - b.sdgId);
        
        return NextResponse.json(sdgData, { status: 200 });
    }catch(err){
        console.error("Fetch SDG progress failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({error: "Error fetching SDG progress"}, {
            status: 500
        })
    }
}