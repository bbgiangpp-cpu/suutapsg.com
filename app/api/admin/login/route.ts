import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/security";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";
import { verifyPassword } from "@/lib/password";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@suutapsg.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const safeCompare = (a: string, b: string) => {
    const left = Buffer.from(a);
    const right = Buffer.from(b);

    if (left.length !== right.length) {
        return false;
    }

    return crypto.timingSafeEqual(left, right);
};

const loadCredentialByEmail = (email: string) =>
    db
        .prepare(
            "SELECT passwordHash, passwordSalt FROM user_credentials WHERE email = ?",
        )
        .get(email.toLowerCase()) as
        | { passwordHash: string; passwordSalt: string }
        | undefined;

export async function POST(req: Request) {
    if (
        process.env.NODE_ENV === "production" &&
        (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
    ) {
        return NextResponse.json(
            { message: "Thiếu cấu hình ADMIN_EMAIL hoặc ADMIN_PASSWORD" },
            { status: 500 },
        );
    }

    const ip = getClientIp(req);
    const limiter = rateLimit({
        key: `admin-login:${ip}`,
        limit: 10,
        windowMs: 15 * 60 * 1000,
    });

    if (!limiter.allowed) {
        return NextResponse.json(
            { message: "Bạn thử quá nhiều lần. Vui lòng thử lại sau." },
            { status: 429 },
        );
    }

    const body = await req.json();
    const email = String(body?.email || "").trim();
    const password = String(body?.password || "");

    if (!safeCompare(email.toLowerCase(), ADMIN_EMAIL.toLowerCase())) {
        return NextResponse.json(
            { message: "Email hoặc mật khẩu admin không đúng" },
            { status: 401 },
        );
    }

    const credential = loadCredentialByEmail(email);

    const passwordValid = credential
        ? verifyPassword(password, credential)
        : safeCompare(password, ADMIN_PASSWORD);

    if (!passwordValid) {
        return NextResponse.json(
            { message: "Email hoặc mật khẩu admin không đúng" },
            { status: 401 },
        );
    }

    cookies().set("admin_session", "authenticated", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
    });

    cookies().set("admin_role", "admin", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
    });

    cookies().set("admin_email", ADMIN_EMAIL, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
    });

    const nextCsrfToken = generateCsrfToken();
    setCsrfCookie(nextCsrfToken);

    return NextResponse.json({
        message: "Đăng nhập admin thành công",
        csrfToken: nextCsrfToken,
    });
}
