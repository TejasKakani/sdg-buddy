import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export default function getTokenPayload(req: NextRequest){
    try{
        const token = req.cookies.get("token")?.value || "";
        const payload = jwt.verify(token, process.env.TOKEN_SECRET!);
        return payload;
    }catch(err){
        return NextResponse.json("Invalid Token", {status: 401});
    }
}