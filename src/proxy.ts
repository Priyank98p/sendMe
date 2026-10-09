import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;
  const isAuthPage = ["/sign-in", "/sign-up", "/verify"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (token && isAuthPage) {
    // The dashboard route does not exist yet, so send signed-in users to the
    // existing home page instead of a 404.
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!token && isDashboard) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/sign-up", "/dashboard/:path*", "/verify"],
};
