import { UserModel } from '@/models/user.model';
import { connectToDatabase } from '@/utils/mongodb-connect';
import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailTokenSchema } from '@/utils/validation';
import { checkRateLimit, getRequestIdentifier } from '@/utils/rate-limit';
import crypto from 'crypto';
import { hasValidSameOrigin } from '@/utils/csrf';

export async function POST(
    req: NextRequest,
){
    try{
        if (!hasValidSameOrigin(req)) {
            return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
        }

        const ip = getRequestIdentifier(req.headers.get("x-forwarded-for"), "unknown");
        const rateLimit = await checkRateLimit({
            key: `verify-email:${ip}`,
            limit: 12,
            windowMs: 60_000,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many verification attempts. Please try again shortly." },
                {
                    status: 429,
                    headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
                }
            );
        }

        await connectToDatabase();
        const searchParams = req.nextUrl.searchParams;
        const parseResult = verifyEmailTokenSchema.safeParse({ token: searchParams.get("token") ?? "" });

        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid verification token" }, { status: 400 });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(parseResult.data.token)
            .digest("hex");

        const user = await UserModel.findOne({
            verifyEmailToken: hashedToken,
            verifyEmailTokenExpires: {$gt: Date.now()}
        });

        if(!user){
            return NextResponse.json({ error: "Invalid or expired verification token" }, {
                status: 400
            });
        }

        user.isVerified = true;
        user.verifyEmailToken = undefined;
        user.verifyEmailTokenExpires = undefined;

        await user.save();

        return NextResponse.json({ message: "Email verified successfully" }, {
            status: 200
        });

    }catch(err){
        console.error("Verify email failed", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({ error: "Error in verifying email" }, {
            status: 500,
        });
    }
}