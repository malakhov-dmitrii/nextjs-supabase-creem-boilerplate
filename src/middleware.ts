import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isDemoMode } from "@/lib/demo/mode";

export async function middleware(request: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.next();
  }
  return await updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
