import { connectToDatabase } from "@/utils/mongodb-connect";
import { UserModel } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/utils/mailer";
import bcrypt from 'bcrypt';
import { ProfileModel } from "@/models/profile.model";
import { signUpSchema } from "@/utils/validation";
import { checkRateLimit, getRequestIdentifier } from "@/utils/rate-limit";
import { hasValidSameOrigin } from "@/utils/csrf";

export async function POST(
    req: NextRequest,
){
    try{
        if (!hasValidSameOrigin(req)) {
            return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
        }

        const ip = getRequestIdentifier(req.headers.get("x-forwarded-for"), "unknown");
        const rateLimit = await checkRateLimit({
            key: `signup:${ip}`,
            limit: 8,
            windowMs: 60_000,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many sign-up attempts. Please try again shortly." },
                {
                    status: 429,
                    headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
                }
            );
        }

        await connectToDatabase();
        const parseResult = signUpSchema.safeParse(await req.json());
        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid sign-up payload" }, { status: 400 });
        }

        const {name, email, password} = parseResult.data;

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
 
        const userProfile = new ProfileModel({
            user: savedUser._id,
            name: savedUser.name,
        });
        
        await userProfile.save();
        
        await sendMail({
            email: email,
            emailType: 'signup',
            userId: savedUser._id.toString()
        });

        return NextResponse.json({
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
            }
        }, {
            status: 201
        });

    }catch(err){
        console.error("Sign-up failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({error: "Error in sign-up"}, {
            status: 500
        })
    }
}