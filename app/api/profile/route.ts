import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!email) {
        return NextResponse.json({ message: "Thiếu email" }, { status: 400 });
    }

    const profile = db
        .prepare("SELECT * FROM user_profiles WHERE email = ?")
        .get(email) as
        | {
              email: string;
              displayName: string;
              initials: string;
              role: string;
              avatarUrl: string;
              phone: string;
              address: string;
              isOnline: number;
          }
        | undefined;

    if (!profile) {
        return NextResponse.json(
            { message: "Không tìm thấy profile" },
            { status: 404 },
        );
    }

    return NextResponse.json({
        profile: {
            ...profile,
            isOnline: Boolean(profile.isOnline),
        },
    });
}

export async function PUT(req: Request) {
    const body = await req.json();
    const email = String(body.email || "")
        .trim()
        .toLowerCase();

    if (!email) {
        return NextResponse.json({ message: "Thiếu email" }, { status: 400 });
    }

    db.prepare(
        `
        INSERT INTO user_profiles (
            email,
            displayName,
            initials,
            role,
            avatarUrl,
            phone,
            address,
            isOnline,
            updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(email) DO UPDATE SET
            displayName = excluded.displayName,
            initials = excluded.initials,
            role = excluded.role,
            avatarUrl = excluded.avatarUrl,
            phone = excluded.phone,
            address = excluded.address,
            isOnline = excluded.isOnline,
            updatedAt = CURRENT_TIMESTAMP
    `,
    ).run(
        email,
        String(body.displayName || "").trim() || email.split("@")[0],
        String(body.initials || "").trim() || "US",
        String(body.role || "user").trim() || "user",
        String(body.avatarUrl || "").trim(),
        String(body.phone || "").trim(),
        String(body.address || "").trim(),
        body.isOnline ? 1 : 0,
    );

    return NextResponse.json({ message: "Đã lưu profile" });
}
