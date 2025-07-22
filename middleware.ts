import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// List of public routes that don't require authentication
const publicRoutes = ["/", "/login", "/signup", "/logout"];

// List of routes that require authentication but not cooperative setup
const authRoutes = ["/dashboard", "/settings", "/arkiv", "/my-associations"];

// List of routes that require cooperative setup for cooperative admins
const cooperativeSetupRoutes = ["/setup-cooperative"];

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
    // Check if the current route is public
    const isPublicRoute = publicRoutes.some(
      (route) =>
        request.nextUrl.pathname === route ||
        request.nextUrl.pathname.startsWith(route + "/")
    );

    // If it's a public route, allow access without checking session
    if (isPublicRoute) {
      return response;
    }

    // Try to get the session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    // If no session and trying to access protected route
    if (!session) {
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

      const redirectUrl = new URL("/", request.url);
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
        // If refresh fails, redirect to landing page
        const redirectUrl = new URL("/", request.url);
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

    // Get user metadata
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();

    // // Handle cooperative admin setup
    // if (user?.user_metadata?.role === "cooperative_admin") {
    //   // Check if the cooperative is already set up
    //   const { data: cooperative } = await supabase
    //     .from("cooperatives")
    //     .select("id")
    //     .eq("admin_id", user.id)
    //     .single();

    //   const needsSetup = !cooperative;
    //   const isSetupRoute = cooperativeSetupRoutes.some(
    //     (route) =>
    //       request.nextUrl.pathname === route ||
    //       request.nextUrl.pathname.startsWith(route + "/")
    //   );

    //   // If needs setup and not on setup page, redirect to setup
    //   if (needsSetup && !isSetupRoute) {
    //     const redirectUrl = new URL("/setup-cooperative", request.url);
    //     return NextResponse.redirect(redirectUrl);
    //   }

    //   // If already set up and trying to access setup page, redirect to dashboard
    //   if (!needsSetup && isSetupRoute) {
    //     const redirectUrl = new URL("/dashboard", request.url);
    //     return NextResponse.redirect(redirectUrl);
    //   }
    // }

    // If user is signed in and tries to access login/signup pages
    if (
      session &&
      (request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/signup"))
    ) {
      const redirectUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    // If any error occurs during session handling, redirect to landing page
    if (
      !publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
    ) {
      const redirectUrl = new URL("/", request.url);
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
