import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest
){
    try{
        connectToDatabase();

        const response = NextResponse.json("Signed out successfully", {
            status: 200
        });

        response.cookies.set("token", "", {
            httpOnly: true,
            expires: new Date(0)
        });

        return response;


    }catch(err){
        NextResponse.json("Error signing out", {
            status: 500
        });

    }
}