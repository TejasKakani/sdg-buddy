import { ProfileModel } from "@/models/profile.model";
import { getSDGColor, getSDGLogo, getSDGName, SDG_GOALS } from "@/constants/sdgGoals";
import getTokenPayload from "@/utils/getTokenPayload";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextRequest } from "next/server";

function formatDataForFrontend(yearlyMonthlyPoints: any) {
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

  // Process the stored yearly monthly points data
  if (yearlyMonthlyPoints) {
    Object.values(yearlyMonthlyPoints).forEach((monthData: any) => {
      Object.entries(monthData).forEach(([month, sdgData]: [string, any]) => {
        const monthIndex = parseInt(month) - 1; // Convert to 0-indexed
        Object.entries(sdgData).forEach(([sdg, points]: [string, any]) => {
          const sdgNum = parseInt(sdg);
          if (resultMap[sdgNum]) {
            resultMap[sdgNum].data[monthIndex] += points;
          }
        });
      });
    });
  }

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
        
        // Read chart data directly from Profile instead of aggregating from Actions
        const profile = await ProfileModel.findOne({ user: userId });
        
        if (!profile || !profile.yearlyMonthlyPoints) {
            // Return empty template if no profile or data exists
            return new Response(JSON.stringify(formatDataForFrontend({})), {
                status: 200
            });
        }

        return new Response(JSON.stringify(formatDataForFrontend(profile.yearlyMonthlyPoints)), {
            status: 200
        });

    }catch(err: any){
        return new Response(JSON.stringify({error: err.message}), {
            status: 500
        })
    }
}