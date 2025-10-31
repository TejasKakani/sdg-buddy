import { User, UserModel } from '@/models/user.model';
import { connectToDatabase } from '@/utils/mongodb-connect';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    req: NextRequest,
){
    try{
        await connectToDatabase();
        const searchParams = req.nextUrl.searchParams;
        const token = searchParams.get("token");

        const user = await UserModel.findOne({
            verifyEmailToken: token,
            verifyEmailTokenExpires: {$gt: Date.now()}
        });

        if(!user){
            return NextResponse.json("User not found", {
                status: 400
            });
        }

        user.isVerified = true;
        user.verifyEmailToken = undefined;
        user.verifyEmailTokenExpires = undefined;

        await user.save();

        return NextResponse.json("Email verified successfully", {
            status: 200
        });

    }catch(err){
        return NextResponse.json("Error in verifying email", {
            status: 500,
        });
    }
}