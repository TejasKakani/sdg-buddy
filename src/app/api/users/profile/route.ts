import { UserModel } from "@/models/user.model";
import { readTokenPayload } from "@/utils/getTokenPayload";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest
){
    await connectToDatabase();
    const userPayload = await readTokenPayload(req);
    if (!userPayload?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserModel.findOne({
        _id: userPayload.id
    }).select("-password");

    if(!user){
        return NextResponse.json("User not found", {status: 404});
    }

    return NextResponse.json({user}, {status: 200});

}