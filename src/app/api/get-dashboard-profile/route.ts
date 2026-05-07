import { ProfileModel } from "@/models/profile.model";
import getTokenPayload from "@/utils/getTokenPayload";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest
){
    try{
        await connectToDatabase();
        const tokenPayload = await getTokenPayload(req);
        if(!tokenPayload) return NextResponse.json({profile: null}, {status: 200})
        const tokenPayloadJson = (await tokenPayload.json()) as { id: string };
        const userId = tokenPayloadJson.id;
        const userProfile = await ProfileModel.findOne({user: userId});
        return NextResponse.json({profile: userProfile}, {
            status: 200
        });
    }catch(err: unknown){
        const message = err instanceof Error ? err.message : "Error fetching dashboard profile";
        return NextResponse.json({error: message}, {
            status: 500
        })
    }
}