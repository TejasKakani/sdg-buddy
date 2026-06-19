import { UserModel } from "@/models/user.model";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/utils/mailer";
import { resendVerificationSchema } from "@/utils/validation";
import { checkRateLimit, getRequestIdentifier } from "@/utils/rate-limit";
import { hasValidSameOrigin } from "@/utils/csrf";

// Generic response used for every outcome so this endpoint can't be used to
// enumerate which emails are registered or already verified.
const GENERIC_RESPONSE = {
    message: "If an account exists for that email and is not yet verified, a new verification link has been sent.",
};

export async function POST(req: NextRequest) {
    try {
        if (!hasValidSameOrigin(req)) {
            return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
        }

        const ip = getRequestIdentifier(req.headers.get("x-forwarded-for"), "unknown");
        const rateLimit = await checkRateLimit({
            key: `resend-verification:${ip}`,
            limit: 5,
            windowMs: 60_000,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many requests. Please try again shortly." },
                {
                    status: 429,
                    headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
                }
            );
        }

        await connectToDatabase();
        const parseResult = resendVerificationSchema.safeParse(await req.json());
        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
        }

        const normalizedIdentifier = parseResult.data.identifier.toLowerCase();
        const user = await UserModel.findOne({
            $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
        });

        // Only send when there's an unverified account; otherwise stay silent.
        if (user && !user.isVerified) {
            await sendMail({
                email: user.email,
                emailType: "signup",
                userId: user._id.toString(),
            });
        }

        return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    } catch (err) {
        console.error("Resend verification failed", err instanceof Error ? err.message : "unknown error");
        // Still return the generic response shape to avoid leaking internal state.
        return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }
}
