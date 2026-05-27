import { NextRequest, NextResponse } from "next/server";
import {jwtVerify} from "jose";
import { env } from "@/utils/env";

export type AuthTokenPayload = {
    id: string;
    iat?: number;
    exp?: number;
};

export async function readTokenPayload(req: NextRequest): Promise<AuthTokenPayload | null> {
    const token = req.cookies.get("token")?.value;

    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(env.TOKEN_SECRET), {
            algorithms: ["HS256"],
        });

        if (!payload?.id || typeof payload.id !== "string") {
            return null;
        }

        return {
            id: payload.id,
            iat: typeof payload.iat === "number" ? payload.iat : undefined,
            exp: typeof payload.exp === "number" ? payload.exp : undefined,
        };
    } catch {
        return null;
    }
}

export default async function getTokenPayload(req: NextRequest){
    const payload = await readTokenPayload(req);
    if (!payload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(payload, {status: 200});
}