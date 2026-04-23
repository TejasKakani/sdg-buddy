import { ActionModel } from "@/models/action.model";
import { getSDGColor, getSDGLogo, getSDGName, SDG_GOALS } from "@/constants/sdgGoals";
import getTokenPayload from "@/utils/getTokenPayload";
import { connectToDatabase } from "@/utils/mongodb-connect";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

function formatDataForFrontend(stats: any[]) {
  const months = 12;
  const goalTemplate = (id: number) => ({
    id: `goal${id}`,
    label: getSDGName(id),
    color: getSDGColor(id),
    logo: getSDGLogo(id),
    data: Array(months).fill(0)
  });

  const resultMap: Record<number, any> = {};
  for (const goal of SDG_GOALS) {
    resultMap[goal.id] = goalTemplate(goal.id);
  }

  stats.forEach(stat => {
    // MongoDB $month is 1-indexed. Adjust to 0-indexed for the array.
    const monthIndex = stat._id.month - 1; 
    const sdgNum = stat._id.sdg;
    
    if (resultMap[sdgNum]) {
      resultMap[sdgNum].data[monthIndex] = stat.totalPoints;
    }
  });

  return Object.values(resultMap);
}

export async function GET(
    req: NextRequest
){
    try{
        await connectToDatabase();
        const tokenData = await getTokenPayload(req);
        const tokenDataJson = await tokenData.json().then(data => data);
        const userId = tokenDataJson.id;
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const stats = await ActionModel.aggregate([
        {
            // 1. Filter by user and time range
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                completedAt: { $gte: oneYearAgo }
            }
            },
            {
            // 2. Expand the sdgs array so an action with [1, 2] becomes two separate documents
            $unwind: "$sdgs"
            },
            {
            // 3. Group by SDG and Month
            $group: {
                _id: {
                sdg: "$sdgs",
                month: { $month: "$completedAt" }, // Returns 1-12
                year: { $year: "$completedAt" }
                },
                totalPoints: { $sum: "$points" }
            }
            }
        ]);

        return new Response(JSON.stringify(formatDataForFrontend(stats)), {
            status: 200
        });

    }catch(err: any){
        return new Response(JSON.stringify({error: err.message}), {
            status: 500
        })
    }
}