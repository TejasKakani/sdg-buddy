
import getTokenPayload from "@/utils/getTokenPayload";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest
){
    return getTokenPayload(req);

}