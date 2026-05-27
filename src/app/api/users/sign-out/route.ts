import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { isProduction } from "@/utils/env";
import { hasValidSameOrigin } from "@/utils/csrf";

export async function POST(req: NextRequest){
    try{
        if (!hasValidSameOrigin(req)) {
            return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
        }

        await connectToDatabase();

        const response = NextResponse.json("Signed out successfully", {
            status: 200
        });

        response.cookies.set("token", "", {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            path: "/",
            expires: new Date(0)
        });

        return response;


    }catch{
        return NextResponse.json("Error signing out", {
            status: 500
        });

    }
}

export async function GET(){
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}