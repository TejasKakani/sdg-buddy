import { UserModel } from "@/models/user.model";
import getTokenPayload from "@/utils/getTokenPayload";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest
){
    const token = req.cookies.get("token")?.value || "";
    const userPayload: any = getTokenPayload(req);

    const user = await UserModel.findOne({
        _id: userPayload.id
    }).select("-password");

    if(!user){
        return NextResponse.json("User not found", {status: 404});
    }

    return NextResponse.json({user, token}, {status: 200});

}