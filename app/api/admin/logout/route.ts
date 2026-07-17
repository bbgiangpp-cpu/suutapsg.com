import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    return NextResponse.json({ message: "Đăng xuất thành công" });
}
