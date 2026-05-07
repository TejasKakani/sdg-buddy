import { ActionModel } from "@/models/action.model";
import getTokenPayload from "@/utils/getTokenPayload";
import { connectToDatabase } from "@/utils/mongodb-connect";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type SdgProgressItem = {
  _id: number;
  totalPoints: number;
  actionCount: number;
};

const SDG_NAMES: Record<number, string> = {
  1: "No Poverty",
  2: "Zero Hunger",
  3: "Good Health and Well-being",
  4: "Quality Education",
  5: "Gender Equality",
  6: "Clean Water and Sanitation",
  7: "Affordable and Clean Energy",
  8: "Decent Work and Economic Growth",
  9: "Industry, Innovation and Infrastructure",
  10: "Reduced Inequality",
  11: "Sustainable Cities and Communities",
  12: "Responsible Consumption and Production",
  13: "Climate Action",
  14: "Life Below Water",
  15: "Life on Land",
  16: "Peace, Justice and Strong Institutions",
  17: "Partnerships for the Goals",
};

const ACTION_TEMPLATES: Record<number, string[]> = {
  1: ["Donate one useful item this week.", "Support a local charity drive with food or clothes."],
  2: ["Plan one zero-waste meal this week.", "Share extra groceries with someone in need."],
  3: ["Walk or bike for one short trip today.", "Take a 20-minute wellness break without screens."],
  4: ["Share one educational resource with a friend.", "Spend 30 minutes learning a sustainability topic."],
  5: ["Support a women-led local business this week.", "Amplify one voice from an underrepresented group."],
  6: ["Reduce your shower time by two minutes.", "Fix a leaking tap or report it this week."],
  7: ["Switch off idle devices before bed.", "Replace one old bulb with an energy-efficient one."],
  8: ["Choose one fair-trade product this week.", "Support a local small business for your next purchase."],
  9: ["Repair one item instead of replacing it.", "Use a digital solution that reduces paper usage."],
  10: ["Donate or volunteer for an inclusion-focused cause.", "Make one decision today that improves accessibility."],
  11: ["Use public transport for one trip this week.", "Join or suggest one neighborhood clean-up action."],
  12: ["Carry a reusable bottle and cup today.", "Skip single-use plastic for one full day."],
  13: ["Eat one plant-based meal this week.", "Avoid one unnecessary car trip today."],
  14: ["Avoid products with microplastics.", "Take part in a local waterway clean-up."],
  15: ["Plant a native species this month.", "Choose paper products from certified sources."],
  16: ["Participate in one civic discussion respectfully.", "Verify one news source before sharing it."],
  17: ["Invite a friend to log one SDG action with you.", "Collaborate with a group on one local SDG task."],
};

function pickSuggestion(goalId: number, seed: number): string {
  const options = ACTION_TEMPLATES[goalId] || ["Log one small positive action today."];
  return options[seed % options.length];
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const tokenPayloadResponse = await getTokenPayload(req);
    if (tokenPayloadResponse.status !== 200) {
      return NextResponse.json({ recommendations: [] }, { status: 401 });
    }

    const tokenPayloadJson = await tokenPayloadResponse.json();
    const userId = tokenPayloadJson?.id;

    if (!userId) {
      return NextResponse.json({ recommendations: [] }, { status: 401 });
    }

    const sdgProgress = await ActionModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$sdgs" },
      {
        $group: {
          _id: "$sdgs",
          totalPoints: { $sum: "$points" },
          actionCount: { $sum: 1 },
        },
      },
    ]);

    const pointsByGoal = new Map<number, number>();
    for (let goal = 1; goal <= 17; goal += 1) {
      pointsByGoal.set(goal, 0);
    }

    sdgProgress.forEach((item: SdgProgressItem) => {
      pointsByGoal.set(item._id, item.totalPoints || 0);
    });

    const recommendations = Array.from(pointsByGoal.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([goalId, points], index) => {
        const isNewArea = points === 0;

        return {
          sdgId: goalId,
          goalName: SDG_NAMES[goalId],
          reason: isNewArea
            ? "You have no logged impact in this goal yet."
            : `This goal has fewer points than your other goals (${points} pts).`,
          suggestedAction: pickSuggestion(goalId, index),
          suggestedPoints: Math.max(10, Math.round((points + 15) / 2)),
        };
      });

    return NextResponse.json(
      {
        recommendations,
        strategy: "lowest-sdg-points",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching recommendations";
    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
