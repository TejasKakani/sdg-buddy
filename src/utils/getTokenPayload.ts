import { NextRequest, NextResponse } from "next/server";
import {jwtVerify} from "jose";

export default async function getTokenPayload(req: NextRequest){
    try{
        const token = req.cookies.get("token")?.value || "";
        const payload = await jwtVerify(token, new TextEncoder().encode(process.env.TOKEN_SECRET!), {
            algorithms: ['HS256'],
        });
        return NextResponse.json(payload, {status: 200});
    }catch(err){
        return NextResponse.json("Invalid Token", {status: 401});
    }
}