import crypto from "node:crypto";
import { cookies } from "next/headers";

export const CSRF_COOKIE_NAME = "admin_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";

const isProd = process.env.NODE_ENV === "production";

export const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

export const setCsrfCookie = (token: string) => {
    cookies().set(CSRF_COOKIE_NAME, token, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: isProd,
        maxAge: 60 * 60 * 24,
    });
};

export const clearCsrfCookie = () => {
    cookies().set(CSRF_COOKIE_NAME, "", {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: isProd,
        maxAge: 0,
    });
};

export const verifyCsrfRequest = (req: Request) => {
    const csrfFromCookie = cookies().get(CSRF_COOKIE_NAME)?.value || "";
    const csrfFromHeader = req.headers.get(CSRF_HEADER_NAME) || "";

    if (!csrfFromCookie || !csrfFromHeader) {
        return false;
    }

    const left = Buffer.from(csrfFromCookie);
    const right = Buffer.from(csrfFromHeader);

    if (left.length !== right.length) {
        return false;
    }

    return crypto.timingSafeEqual(left, right);
};
