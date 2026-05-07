import { ProfileModel } from "@/models/profile.model";
import type { MonthlySDGData, YearlyMonthlyPoints as ProfileYearlyMonthlyPoints } from "@/models/profile.model";
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

type ChartResponse = {
  years: number[];
  selectedYear: number | null;
  goals: GoalChartData[];
};

function formatDataForFrontend(yearlyMonthlyPoints: Record<number, MonthlySDGData> = {}): GoalChartData[] {
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

  for (const [month, sdgData] of Object.entries(yearlyMonthlyPoints)) {
    const monthIndex = Number.parseInt(month, 10) - 1;

    if (monthIndex < 0 || monthIndex >= months) {
      continue;
    }

    for (const [sdg, points] of Object.entries(sdgData)) {
      const sdgNum = Number.parseInt(sdg, 10);

      if (resultMap[sdgNum]) {
        resultMap[sdgNum].data[monthIndex] += points;
      }
    }
  }

  return Object.values(resultMap);
}

function getChartResponse(yearlyMonthlyPoints: ProfileYearlyMonthlyPoints = {} as ProfileYearlyMonthlyPoints, selectedYear?: number): ChartResponse {
  const years = Object.keys(yearlyMonthlyPoints)
    .map((year) => Number.parseInt(year, 10))
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => b - a);

  const yearToUse = selectedYear ?? years[0] ?? null;

  return {
    years,
    selectedYear: yearToUse,
    goals: yearToUse !== null ? formatDataForFrontend(yearlyMonthlyPoints[yearToUse] ?? {}) : formatDataForFrontend(),
  };
}

export async function GET(
    req: NextRequest
){
    try{
        await connectToDatabase();
        const tokenData = await getTokenPayload(req);
        const tokenDataJson = (await tokenData.json()) as { id: string };
        const userId = tokenDataJson.id;
        const yearParam = req.nextUrl.searchParams.get("year");
        const selectedYear = yearParam ? Number.parseInt(yearParam, 10) : undefined;
        
        // Read chart data directly from Profile instead of aggregating from Actions
        const profile = await ProfileModel.findOne({ user: userId });
        
        if (!profile || !profile.yearlyMonthlyPoints) {
            return new Response(JSON.stringify({ years: [], selectedYear: null, goals: formatDataForFrontend() }), {
                status: 200
            });
        }

        return new Response(JSON.stringify(getChartResponse(profile.yearlyMonthlyPoints, Number.isFinite(selectedYear) ? selectedYear : undefined)), {
            status: 200
        });

    }catch(err: unknown){
      const message = err instanceof Error ? err.message : "Error fetching chart data";
      return new Response(JSON.stringify({error: message}), {
            status: 500
        })
    }
}