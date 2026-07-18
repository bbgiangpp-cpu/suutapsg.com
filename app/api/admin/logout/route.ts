import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";

export async function POST() {
    ["admin_session", "admin_role", "admin_email"].forEach((key) => {
        cookies().set(key, "", {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 0,
        });
    });

    const nextCsrfToken = generateCsrfToken();
    setCsrfCookie(nextCsrfToken);

    return NextResponse.json({
        message: "Đăng xuất thành công",
        csrfToken: nextCsrfToken,
    });
}
