import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { UserModel } from "@/models/user.model";
import { connectToDatabase } from "@/utils/mongodb-connect";

export async function GET(
    req: NextRequest,
) {
    try {
        await connectToDatabase();
        const searchParams = req.nextUrl.searchParams;
        const users = await UserModel.find(
            {role: searchParams.get('role')}
        );
        return NextResponse.json(users, {
            status: 200,
        });
    } catch (e) {
        return NextResponse.json("Error in fetching Users", {
            status: 500,
        });
    }
}