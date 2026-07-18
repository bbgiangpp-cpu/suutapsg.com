import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
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
