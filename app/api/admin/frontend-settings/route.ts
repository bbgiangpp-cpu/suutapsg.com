import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const isAdmin = () =>
    cookies().get("admin_session")?.value === "authenticated" &&
    cookies().get("admin_role")?.value === "admin";

export async function GET() {
    if (!isAdmin()) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const settings = db
        .prepare("SELECT * FROM frontend_settings WHERE id = 1")
        .get() as
        | {
              brandName: string;
              heroTitle: string;
              heroDescription: string;
              hotline: string;
              primaryColor: string;
              accentColor: string;
              paymentQrUrl: string;
              bankQrUrl: string;
              momoQrUrl: string;
              showHotline: number;
              showHeroStats: number;
          }
        | undefined;

    if (!settings) {
        return NextResponse.json(
            { message: "Không tìm thấy cấu hình frontend" },
            { status: 404 },
        );
    }

    return NextResponse.json({
        settings: {
            ...settings,
            showHotline: Boolean(settings.showHotline),
            showHeroStats: Boolean(settings.showHeroStats),
        },
    });
}

export async function PUT(req: Request) {
    if (!isAdmin()) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const bankQrUrl = String(body.bankQrUrl || "").trim();
    const momoQrUrl = String(body.momoQrUrl || "").trim();

    const isValidQrImage = (value: string) =>
        !value ||
        /^https?:\/\//i.test(value) ||
        value.startsWith("/") ||
        value.startsWith("data:image/");

    if (!isValidQrImage(bankQrUrl) || !isValidQrImage(momoQrUrl)) {
        return NextResponse.json(
            { message: "Ảnh QR không hợp lệ" },
            { status: 400 },
        );
    }

    db.prepare(
        `
        UPDATE frontend_settings
        SET brandName = @brandName,
            heroTitle = @heroTitle,
            heroDescription = @heroDescription,
            hotline = @hotline,
            primaryColor = @primaryColor,
            accentColor = @accentColor,
            bankQrUrl = @bankQrUrl,
            momoQrUrl = @momoQrUrl,
            showHotline = @showHotline,
            showHeroStats = @showHeroStats,
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = 1
    `,
    ).run({
        brandName: body.brandName,
        heroTitle: body.heroTitle,
        heroDescription: body.heroDescription,
        hotline: body.hotline,
        primaryColor: body.primaryColor,
        accentColor: body.accentColor,
        bankQrUrl,
        momoQrUrl,
        showHotline: body.showHotline ? 1 : 0,
        showHeroStats: body.showHeroStats ? 1 : 0,
    });

    return NextResponse.json({ message: "Đã lưu cấu hình frontend" });
}
