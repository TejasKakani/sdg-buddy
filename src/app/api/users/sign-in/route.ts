import { UserModel } from "@/models/user.model";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import {SignJWT} from "jose";
import { env, isProduction } from "@/utils/env";
import { signInSchema } from "@/utils/validation";
import { checkRateLimit, getRequestIdentifier } from "@/utils/rate-limit";
import { hasValidSameOrigin } from "@/utils/csrf";

const DUMMY_BCRYPT_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8wsl5M86yvv9tM4I6Qm8q4f4vMx3Ly";

export async function POST(
    req: NextRequest
){
    try{
        if (!hasValidSameOrigin(req)) {
            return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
        }

        const ip = getRequestIdentifier(req.headers.get("x-forwarded-for"), "unknown");
        const rateLimit = await checkRateLimit({
            key: `signin:${ip}`,
            limit: 10,
            windowMs: 60_000,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many sign-in attempts. Please try again shortly." },
                {
                    status: 429,
                    headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
                }
            );
        }

        await connectToDatabase();
        const parseResult = signInSchema.safeParse(await req.json());

        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid sign-in payload" }, { status: 400 });
        }

        const {email, password} = parseResult.data;

        const user = await UserModel.findOne({
            email
        });

        if(!user){
            await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if(!validPassword){
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (!user.isVerified) {
            return NextResponse.json(
                {
                    error: "Please verify your email before signing in. Check your inbox for the verification link.",
                    code: "EMAIL_NOT_VERIFIED",
                },
                { status: 403 }
            );
        }

        const tokenPayload = {
            id: user._id.toString(),
        }

        const token = await new SignJWT(tokenPayload)
                        .setProtectedHeader({ alg: 'HS256' })
                        .setIssuedAt()
                        .setExpirationTime('24h')
                        .sign(new TextEncoder().encode(env.TOKEN_SECRET))

        const response = NextResponse.json({
            message: "User signed in successfully",
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            path: "/"
        });

        return response;

    }catch(err){
        console.error("Sign-in failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({ error: "Error signing in" }, { status: 500 }); 
    }
}