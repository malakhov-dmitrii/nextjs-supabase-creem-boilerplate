import { type NextRequest, NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo/mode";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.next();
  }
  return await updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
