import { ProfileModel } from "@/models/profile.model";
import { readTokenPayload } from "@/utils/getTokenPayload";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest
){
    try{
        await connectToDatabase();
        const payload = await readTokenPayload(req);
        if(!payload?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = payload.id;
        const userProfile = await ProfileModel.findOne({user: userId});
        return NextResponse.json({profile: userProfile}, {
            status: 200
        });
    }catch(err){
        console.error("Fetch dashboard profile failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({error: "Error fetching dashboard profile"}, {
            status: 500
        })
    }
}