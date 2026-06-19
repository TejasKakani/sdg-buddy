import { UserModel } from "@/models/user.model";
import { readTokenPayload } from "@/utils/getTokenPayload";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest
){
    try {
        await connectToDatabase();
        const userPayload = await readTokenPayload(req);
        if (!userPayload?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await UserModel.findOne({
            _id: userPayload.id
        }).select("-password");

        if(!user){
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({user}, {status: 200});
    } catch (err) {
        console.error("Fetch profile failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({ error: "Error fetching profile" }, { status: 500 });
    }
}
