import { NextRequest, NextResponse } from "next/server";
import { ActionModel } from "@/models/action.model";
import { readTokenPayload } from "@/utils/getTokenPayload";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { ProfileModel } from "@/models/profile.model";
import { GoogleGenAI } from "@google/genai";
import { generateEmbedding } from "@/utils/generateEmbedding";
import { actionLogSchema } from "@/utils/validation";
import { checkRateLimit, getRequestIdentifier } from "@/utils/rate-limit";
import { env } from "@/utils/env";
import { hasValidSameOrigin } from "@/utils/csrf";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

function normalizeAiResult(input: unknown): { sdgs: number[]; points: number } {
    if (!input || typeof input !== "object") {
        return { sdgs: [17], points: 5 };
    }

    const data = input as { sdgs?: unknown; points?: unknown };
    const parsedSdgs = Array.isArray(data.sdgs)
        ? data.sdgs
              .map((value) => Number.parseInt(String(value), 10))
              .filter((value) => Number.isInteger(value) && value >= 1 && value <= 17)
        : [17];

    const uniqueSdgs = Array.from(new Set(parsedSdgs));
    const pointsNum = Number.parseInt(String(data.points ?? 5), 10);
    const safePoints = Number.isInteger(pointsNum) ? Math.min(Math.max(pointsNum, 5), 50) : 5;

    return {
        sdgs: uniqueSdgs.length > 0 ? uniqueSdgs : [17],
        points: safePoints,
    };
}

function parseAiResponseText(text: string | undefined): { sdgs: number[]; points: number } {
    if (!text) {
        return { sdgs: [17], points: 5 };
    }

    const normalizedText = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

    try {
        return normalizeAiResult(JSON.parse(normalizedText));
    } catch {
        return { sdgs: [17], points: 5 };
    }
}

export async function POST(
    req: NextRequest
){
    try{
        if (!hasValidSameOrigin(req)) {
            return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
        }

        const ip = getRequestIdentifier(req.headers.get("x-forwarded-for"), "unknown");
        const rateLimit = checkRateLimit({
            key: `actions:${ip}`,
            limit: 20,
            windowMs: 60_000,
        });

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many action submissions. Please try again shortly." },
                {
                    status: 429,
                    headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
                }
            );
        }

        await connectToDatabase();
        const payload = await readTokenPayload(req);

        if (!payload?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parseResult = actionLogSchema.safeParse(await req.json());
        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid action payload" }, { status: 400 });
        }

        const { description } = parseResult.data;

        const prompt = `
            Analyze the following social/environmental action description: "${description}"
            
            Based on the 17 UN Sustainable Development Goals (SDGs), identify which SDGs this action contributes to (return IDs 1-17).
            Assign a point value between 5 and 50 based on the complexity and impact of the action.
            
            Return ONLY a JSON object with this format:
            {
              "sdgs": [number],
              "points": number
            }
        `;

        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        const aiAnalysis = parseAiResponseText(result.text?.trim());

        const descriptionEmbedding = await generateEmbedding(description);

        const action = new ActionModel({
            user: payload.id,
            description: description,
            sdgs: aiAnalysis.sdgs,
            points: aiAnalysis.points,
            completedAt: new Date(),
            descriptionEmbedding: descriptionEmbedding,
            category: 'general'
        });
        await action.save();

        const userProfile = await ProfileModel.findOne({user: payload.id});
        
        if(userProfile){
            const now = new Date();
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            const lastActivity = userProfile.lastActivity ? new Date(userProfile.lastActivity) : null;
            if (lastActivity) {
                lastActivity.setHours(0, 0, 0, 0);
            }

            userProfile.totalPoints += action.points;
            if (!lastActivity) {
                userProfile.currentStreak = 1;
            } else {
                const diffInDays = (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
                if (diffInDays > 1) {
                    userProfile.currentStreak = 1;
                } else if (diffInDays === 1) {
                    userProfile.currentStreak += 1;
                }
            }

            if (userProfile.currentStreak < 1) {
                userProfile.currentStreak = 1;
            }

            userProfile.acheivements += 1;
            userProfile.lastActivity = new Date();
            
            // Update sdgGrid data
            if (!userProfile.sdgGrid || userProfile.sdgGrid.length === 0) {
                userProfile.sdgGrid = Array.from({ length: 17 }, (_, i) => ({
                    sdgId: i + 1,
                    points: 0
                }));
            }
            
            // Update points for each SDG in this action
            action.sdgs.forEach((sdg: number) => {
                const sdgEntry = userProfile.sdgGrid.find(entry => entry.sdgId === sdg);
                if (sdgEntry) {
                    sdgEntry.points += action.points;
                } else {
                    userProfile.sdgGrid.push({ sdgId: sdg, points: action.points });
                }
            });
            
            // Update yearlyMonthlyPoints data
            const year = action.completedAt.getFullYear();
            const month = action.completedAt.getMonth() + 1; // 1-12
            
            if (!userProfile.yearlyMonthlyPoints) {
                userProfile.yearlyMonthlyPoints = {};
            }
            
            if (!userProfile.yearlyMonthlyPoints[year]) {
                userProfile.yearlyMonthlyPoints[year] = {};
            }
            
            if (!userProfile.yearlyMonthlyPoints[year][month]) {
                userProfile.yearlyMonthlyPoints[year][month] = {};
            }
            
            // Add points to each SDG for this month
            action.sdgs.forEach((sdg: number) => {
                if (!userProfile.yearlyMonthlyPoints[year][month][sdg]) {
                    userProfile.yearlyMonthlyPoints[year][month][sdg] = 0;
                }
                userProfile.yearlyMonthlyPoints[year][month][sdg] += action.points;
            });
            
            await userProfile.save();
        }
        return NextResponse.json({message: "Action logged successfully"}, {
            status: 201,
        });
    }catch(err){
        console.error("Error logging action", err instanceof Error ? err.message : "unknown error");
        return NextResponse.json({error: "Error logging action"}, {
            status: 500
        })
    }
}