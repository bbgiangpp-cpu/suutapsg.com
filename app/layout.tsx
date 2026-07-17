import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://suutapsg.com";

export const metadata: Metadata = {
    title: "Tem Thư Việt Nam | Bưu Ảnh Indochine",
    description:
        "Trang bán sưu tập tem thư Việt Nam, bưu ảnh Indochine và niêm giấy tờ xưa.",
    metadataBase: new URL(siteUrl),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Tem Thư Việt Nam | Bưu Ảnh Indochine",
        description:
            "Trang bán sưu tập tem thư Việt Nam, bưu ảnh Indochine và niêm giấy tờ xưa.",
        url: siteUrl,
        siteName: "SuutapSG",
        locale: "vi_VN",
        type: "website",
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="vi">
            <body>{children}</body>
        </html>
    );
}
