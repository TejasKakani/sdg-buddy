import { NextRequest } from "next/server";

export function hasValidSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  return origin === request.nextUrl.origin;
}
