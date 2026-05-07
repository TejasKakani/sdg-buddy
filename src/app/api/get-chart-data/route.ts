import { ProfileModel } from "@/models/profile.model";
import type { YearlyMonthlyPoints as ProfileYearlyMonthlyPoints } from "@/models/profile.model";
import { getSDGColor, getSDGLogo, getSDGName, SDG_GOALS } from "@/constants/sdgGoals";
import getTokenPayload from "@/utils/getTokenPayload";
import { connectToDatabase } from "@/utils/mongodb-connect";
import { NextRequest } from "next/server";

type GoalChartData = {
  id: string;
  label: string;
  color: string;
  logo: string;
  data: number[];
};

function formatDataForFrontend(yearlyMonthlyPoints: ProfileYearlyMonthlyPoints = {} as ProfileYearlyMonthlyPoints): GoalChartData[] {
  const months = 12;
  const goalTemplate = (id: number): GoalChartData => ({
    id: `goal${id}`,
    label: getSDGName(id),
    color: getSDGColor(id),
    logo: getSDGLogo(id),
    data: Array(months).fill(0)
  });

  const resultMap: Record<number, GoalChartData> = {};
  for (const goal of SDG_GOALS) {
    resultMap[goal.id] = goalTemplate(goal.id);
  }

  // Process the stored yearly monthly points data
  if (yearlyMonthlyPoints) {
    Object.values(yearlyMonthlyPoints).forEach((monthData) => {
      Object.entries(monthData as Record<string, Record<string, number>>).forEach(([month, sdgData]) => {
        const monthIndex = Number.parseInt(month, 10) - 1; // Convert to 0-indexed
        Object.entries(sdgData as Record<string, number>).forEach(([sdg, points]) => {
          const sdgNum = Number.parseInt(sdg, 10);
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
        const tokenDataJson = (await tokenData.json()) as { id: string };
        const userId = tokenDataJson.id;
        
        // Read chart data directly from Profile instead of aggregating from Actions
        const profile = await ProfileModel.findOne({ user: userId });
        
        if (!profile || !profile.yearlyMonthlyPoints) {
            // Return empty template if no profile or data exists
            return new Response(JSON.stringify(formatDataForFrontend()), {
                status: 200
            });
        }

        return new Response(JSON.stringify(formatDataForFrontend(profile.yearlyMonthlyPoints)), {
            status: 200
        });

    }catch(err: unknown){
      const message = err instanceof Error ? err.message : "Error fetching chart data";
      return new Response(JSON.stringify({error: message}), {
            status: 500
        })
    }
}