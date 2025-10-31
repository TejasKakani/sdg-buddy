import { connectToDatabase } from "@/utils/mongodb-connect";
import { User, UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/utils/mailer";
import bcrypt from 'bcrypt';

export async function POST(
    req: NextRequest,
){
    try{
        await connectToDatabase();
        const data: User = await req.json();
        const {name, email, password} = data;

        const user = await UserModel.findOne({
            email: email
        });

        if(user){
            return NextResponse.json({error: "User already exists"},{
                status: 400
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();
 
        await sendMail({
            email: email,
            emailType: 'signup',
            userId: savedUser._id.toString()
        });

        return NextResponse.json(savedUser, {
            status: 201
        });

    }catch(err: any){
        return NextResponse.json({error: err.message}, {
            status: 500
        })
    }
}