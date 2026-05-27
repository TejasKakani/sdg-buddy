import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { UserModel } from "@/models/user.model";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { readTokenPayload } from "@/utils/getTokenPayload";

export async function GET(
    req: NextRequest,
) {
    try {
        await connectToDatabase();
        const payload = await readTokenPayload(req);

        if (!payload?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await UserModel.findById(payload.id).select("_id name email isVerified createdAt updatedAt");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, {
            status: 200,
        });
    } catch (err) {
        console.error("Fetch user failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({ error: "Error fetching user" }, {
            status: 500,
        });
    }
}