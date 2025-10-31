import { UserModel } from "@/models/user.model";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 

export async function POST(
    req: NextRequest
){
    try{
        await connectToDatabase();
        const data = await req.json();
        const {email, password} = data;

        const user = await UserModel.findOne({
            email
        });

        if(!user){
            return NextResponse.json("User does not exists",{
                status: 400
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if(!validPassword){
            return NextResponse.json("Incorrect Credentials", {
                status: 400
            });
        }

        const tokenPayload = {
            id: user._id,
        }

        const token = jwt.sign(tokenPayload, process.env.TOKEN_SECRET!, {
            expiresIn: '1h'
        });

        const response = NextResponse.json({
            message: "User signed in successfully",
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: true
        });

        return response;

    }catch(err){
        return NextResponse.json("Error in signing in", {
            status: 500,
        }); 
    }
}