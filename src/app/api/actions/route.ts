import { NextRequest, NextResponse } from "next/server";
import { ActionModel } from "@/models/action.model";
import getTokenPayload from "@/utils/getTokenPayload";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { ProfileModel } from "@/models/profile.model";
import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

export async function POST(
    req: NextRequest
){
    try{
        await connectToDatabase();
        const {description} = await req.json();
        const tokenData = await getTokenPayload(req);
        const tokenDataJson = await tokenData.json().then(data => data);

        // --- GEMINI AI BLOCK START ---
        
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
        
        const responseText = result.text?.trim();
        const aiAnalysis = JSON.parse(responseText || ""); // Validate JSON format

        const action = new ActionModel({
            user: tokenDataJson.id,
            description: description,
            sdgs: aiAnalysis.sdgs || [17],
            points: aiAnalysis.points || 5,
            completedAt: new Date()
        });
        await action.save();

        
        const userProfile = await ProfileModel.findOne({user: tokenDataJson.id});
        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));
        const lastAction = userProfile!.lastActivity ? new Date(userProfile!.lastActivity.setHours(0, 0, 0, 0)) : null;
        
        if(userProfile){
            userProfile.totalPoints += action.points;
            const diffInDays = (today.getTime() - lastAction!.getTime()) / (1000 * 60 * 60 * 24);    
            if (diffInDays > 1) {
                userProfile.currentStreak = 1;
            } else if (diffInDays === 1) {
                userProfile.currentStreak += 1;
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
    }catch(err: any){
        console.error("Error logging action:", err);
        return NextResponse.json({error: err.message}, {
            status: 500
        })
    }
}