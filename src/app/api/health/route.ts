import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/utils/mongodb-connect";

export async function GET() {
  try {
    await connectToDatabase();
    const isConnected = mongoose.connection.readyState === 1;

    return NextResponse.json(
      {
        status: isConnected ? "ok" : "degraded",
        database: isConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: isConnected ? 200 : 503 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "down",
        database: "unavailable",
        error: err instanceof Error ? err.message : "unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
