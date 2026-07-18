import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CSRF_COOKIE_NAME = "admin_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

const getAllowedOrigin = () => {
    if (!configuredSiteUrl) {
        return "";
    }

    try {
        return new URL(configuredSiteUrl).origin;
    } catch {
        return "";
    }
};

const isSameOriginRequest = (req: NextRequest) => {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");

    const allowedOrigins = new Set([req.nextUrl.origin]);
    const configuredOrigin = getAllowedOrigin();
    if (configuredOrigin) {
        allowedOrigins.add(configuredOrigin);
    }

    if (origin && allowedOrigins.has(origin)) {
        return true;
    }

    if (referer) {
        try {
            if (allowedOrigins.has(new URL(referer).origin)) {
                return true;
            }
        } catch {
            // Malformed referer header — fall through to rejection.
        }
    }

    return false;
};

const isValidCsrf = (req: NextRequest) => {
    const csrfFromCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value || "";
    const csrfFromHeader = req.headers.get(CSRF_HEADER_NAME) || "";

    return Boolean(
        csrfFromCookie && csrfFromHeader && csrfFromCookie === csrfFromHeader,
    );
};

export function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const method = req.method.toUpperCase();
    const requiresCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    if (pathname.startsWith("/api/admin/") && requiresCsrf) {
        if (!isSameOriginRequest(req)) {
            return NextResponse.json(
                { message: "Origin hoặc Referer không hợp lệ" },
                { status: 403 },
            );
        }

        if (!isValidCsrf(req)) {
            return NextResponse.json(
                { message: "CSRF token không hợp lệ" },
                { status: 403 },
            );
        }
    }

    const response = NextResponse.next();

    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    );
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

    if (pathname.startsWith("/api/") || pathname.startsWith("/admin")) {
        response.headers.set("Cache-Control", "no-store");
    }

    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
