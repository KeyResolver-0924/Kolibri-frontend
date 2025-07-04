import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  try {
    // Try to get the session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (request.nextUrl.pathname.startsWith("/signup")) {
      return;
    }
    // If no session and trying to access protected route
    if (!session && !request.nextUrl.pathname.startsWith("/login")) {
      // Clear any invalid cookies
      response.cookies.set({
        name: "sb-access-token",
        value: "",
        maxAge: 0,
      });
      response.cookies.set({
        name: "sb-refresh-token",
        value: "",
        maxAge: 0,
      });

      const redirectUrl = new URL("/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If session exists but is expired, try to refresh it
    if (
      session &&
      session.expires_at &&
      session.expires_at <= Math.floor(Date.now() / 1000)
    ) {
      const {
        data: { session: newSession },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (refreshError) {
        // If refresh fails, redirect to login
        const redirectUrl = new URL("/login", request.url);
        return NextResponse.redirect(redirectUrl);
      }

      // Update the response with the new session
      if (newSession) {
        response = NextResponse.next({
          request: {
            headers: new Headers(request.headers),
          },
        });
      }
    }

    // If user is signed in and tries to access login page
    if (session && request.nextUrl.pathname.startsWith("/login")) {
      const redirectUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    // If any error occurs during session handling, redirect to login
    if (!request.nextUrl.pathname.startsWith("/login")) {
      const redirectUrl = new URL("/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
