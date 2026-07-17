import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@suutapsg.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(req: Request) {
    const body = await req.json();

    if (body.email !== ADMIN_EMAIL || body.password !== ADMIN_PASSWORD) {
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

    return NextResponse.json({ message: "Đăng nhập admin thành công" });
}
