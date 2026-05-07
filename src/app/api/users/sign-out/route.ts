import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        await connectToDatabase();

        const response = NextResponse.json("Signed out successfully", {
            status: 200
        });

        response.cookies.set("token", "", {
            httpOnly: true,
            expires: new Date(0)
        });

        return response;


    }catch{
        return NextResponse.json("Error signing out", {
            status: 500
        });

    }
}