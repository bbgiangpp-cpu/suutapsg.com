"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

type FrontendSettings = {
    brandName: string;
    heroTitle: string;
    heroDescription: string;
    hotline: string;
    primaryColor: string;
    accentColor: string;
    paymentQrUrl: string;
    showHotline: boolean;
    showHeroStats: boolean;
};

const defaultSettings: FrontendSettings = {
    brandName: "SuutapSG",
    heroTitle: "Storefront chuyên nghiệp cho tem thư, bưu ảnh và niêm giấy xưa",
    heroDescription:
        "Trang này được nâng cấp thành storefront hoàn chỉnh với dữ liệu thực, giỏ hàng và form thanh toán mẫu, áp dụng mô hình Next.js hiện đại.",
    hotline: "0900 123 456",
    primaryColor: "#b96f36",
    accentColor: "#84512b",
    paymentQrUrl: "",
    showHotline: true,
    showHeroStats: true,
};

export default function AdminFrontendPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [message, setMessage] = useState("");
    const [csrfToken, setCsrfToken] = useState("");
    const [settings, setSettings] = useState<FrontendSettings>(defaultSettings);

    const ensureCsrfToken = async () => {
        if (csrfToken) {
            return csrfToken;
        }

        const res = await fetch("/api/admin/csrf", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        const token = String(data?.token || "");

        if (res.ok && token) {
            setCsrfToken(token);
            return token;
        }

        return "";
    };

    useEffect(() => {
        const verify = async () => {
            const res = await fetch("/api/admin/products");
            setIsLoggedIn(res.ok);
        };

        verify();
        ensureCsrfToken();
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            return;
        }

        const loadSettings = async () => {
            const res = await fetch("/api/admin/frontend-settings");
            if (!res.ok) {
                setMessage("Không tải được cấu hình frontend hiện tại.");
                return;
            }

            const data = await res.json();
            if (data.settings) {
                setSettings((prev) => ({ ...prev, ...data.settings }));
            }
        };

        loadSettings();
    }, [isLoggedIn]);

    const updateField = <K extends keyof FrontendSettings>(
        key: K,
        value: FrontendSettings[K],
    ) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        const token = await ensureCsrfToken();
        if (!token) {
            setMessage("Không thể tạo CSRF token. Vui lòng tải lại trang.");
            return;
        }

        const res = await fetch("/api/admin/frontend-settings", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": token,
            },
            body: JSON.stringify(settings),
        });

        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
            setMessage(result.message || "Lưu cấu hình thất bại.");
            return;
        }

        setMessage("Đã lưu cấu hình frontend vào database.");
    };

    const handleReset = () => {
        setSettings(defaultSettings);
        setMessage("Đã khôi phục về mặc định trong form. Bấm Lưu để áp dụng.");
    };

    if (!isLoggedIn) {
        return (
            <main style={wrapStyle}>
                <section style={loginCardStyle}>
                    <h1 style={{ marginTop: 0 }}>
                        Bạn chưa đăng nhập quản trị
                    </h1>
                    <p style={{ color: "#6a5138" }}>
                        Vui lòng đăng nhập ở trang admin trước khi chỉnh
                        frontend.
                    </p>
                    <Link href="/admin" style={primaryButtonStyle}>
                        Về trang admin
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main style={wrapStyle}>
            <div style={{ maxWidth: 1220, margin: "0 auto", width: "100%" }}>
                <header style={headerStyle}>
                    <div>
                        <div style={eyebrowStyle}>Admin Frontend Studio</div>
                        <h1 style={{ margin: "4px 0 0", fontSize: 30 }}>
                            Chỉnh giao diện storefront
                        </h1>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Link href="/admin" style={ghostButtonStyle}>
                            Về dashboard
                        </Link>
                        <button style={primaryButtonStyle} onClick={handleSave}>
                            Lưu cấu hình
                        </button>
                    </div>
                </header>

                <p
                    style={{
                        margin: "12px 0 0",
                        color: "#9d6535",
                        minHeight: 24,
                    }}
                >
                    {message}
                </p>

                <section style={gridStyle}>
                    <div style={panelStyle}>
                        <h2 style={{ marginTop: 0 }}>Nội dung chính</h2>
                        <div style={formGridStyle}>
                            <label style={labelStyle}>
                                Tên thương hiệu
                                <input
                                    style={inputStyle}
                                    value={settings.brandName}
                                    onChange={(e) =>
                                        updateField("brandName", e.target.value)
                                    }
                                />
                            </label>
                            <label style={labelStyle}>
                                Hotline
                                <input
                                    style={inputStyle}
                                    value={settings.hotline}
                                    onChange={(e) =>
                                        updateField("hotline", e.target.value)
                                    }
                                />
                            </label>
                            <label style={labelStyle}>
                                Tiêu đề hero
                                <input
                                    style={inputStyle}
                                    value={settings.heroTitle}
                                    onChange={(e) =>
                                        updateField("heroTitle", e.target.value)
                                    }
                                />
                            </label>
                            <label style={labelStyle}>
                                Mô tả hero
                                <textarea
                                    style={{
                                        ...inputStyle,
                                        minHeight: 110,
                                        resize: "vertical",
                                    }}
                                    value={settings.heroDescription}
                                    onChange={(e) =>
                                        updateField(
                                            "heroDescription",
                                            e.target.value,
                                        )
                                    }
                                />
                            </label>
                        </div>
                    </div>

                    <div style={panelStyle}>
                        <h2 style={{ marginTop: 0 }}>Màu sắc & hiển thị</h2>
                        <div style={formGridStyle}>
                            <label style={labelStyle}>
                                Màu chính
                                <input
                                    type="color"
                                    style={colorInputStyle}
                                    value={settings.primaryColor}
                                    onChange={(e) =>
                                        updateField(
                                            "primaryColor",
                                            e.target.value,
                                        )
                                    }
                                />
                            </label>
                            <label style={labelStyle}>
                                Màu nhấn
                                <input
                                    type="color"
                                    style={colorInputStyle}
                                    value={settings.accentColor}
                                    onChange={(e) =>
                                        updateField(
                                            "accentColor",
                                            e.target.value,
                                        )
                                    }
                                />
                            </label>
                            <label style={switchStyle}>
                                <input
                                    type="checkbox"
                                    checked={settings.showHotline}
                                    onChange={(e) =>
                                        updateField(
                                            "showHotline",
                                            e.target.checked,
                                        )
                                    }
                                />
                                Hiển thị hotline ở header
                            </label>
                            <label style={switchStyle}>
                                <input
                                    type="checkbox"
                                    checked={settings.showHeroStats}
                                    onChange={(e) =>
                                        updateField(
                                            "showHeroStats",
                                            e.target.checked,
                                        )
                                    }
                                />
                                Hiển thị khối thống kê hero
                            </label>
                        </div>

                        <div
                            style={{ display: "flex", gap: 10, marginTop: 18 }}
                        >
                            <button
                                style={ghostButtonStyle}
                                onClick={handleReset}
                            >
                                Khôi phục mặc định
                            </button>
                            <button
                                style={primaryButtonStyle}
                                onClick={handleSave}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </section>

                <section style={{ ...panelStyle, marginTop: 20 }}>
                    <div
                        style={{
                            marginBottom: 12,
                            color: "#8a6642",
                            fontWeight: 700,
                        }}
                    >
                        Xem trước nhanh giao diện
                    </div>
                    <div
                        style={{
                            borderRadius: 16,
                            overflow: "hidden",
                            border: "1px solid #eadbc6",
                            background: "#fff",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px 16px",
                                background: "#fff8ef",
                                borderBottom: "1px solid #eadbc6",
                            }}
                        >
                            <strong style={{ color: settings.accentColor }}>
                                {settings.brandName}
                            </strong>
                            {settings.showHotline ? (
                                <span
                                    style={{
                                        color: settings.accentColor,
                                        fontWeight: 700,
                                    }}
                                >
                                    Hotline: {settings.hotline}
                                </span>
                            ) : null}
                        </div>
                        <div style={{ padding: 18 }}>
                            <h3
                                style={{
                                    marginTop: 0,
                                    color: settings.accentColor,
                                }}
                            >
                                {settings.heroTitle}
                            </h3>
                            <p style={{ margin: "8px 0 0", color: "#5e4d3c" }}>
                                {settings.heroDescription}
                            </p>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    marginTop: 14,
                                }}
                            >
                                <button
                                    style={{
                                        ...primaryButtonStyle,
                                        background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`,
                                    }}
                                >
                                    Nút chính
                                </button>
                                <button
                                    style={{
                                        ...ghostButtonStyle,
                                        borderColor: settings.primaryColor,
                                        color: settings.accentColor,
                                        background: "#fff",
                                    }}
                                >
                                    Nút phụ
                                </button>
                            </div>
                            {settings.showHeroStats ? (
                                <div
                                    style={{
                                        marginTop: 16,
                                        display: "grid",
                                        gap: 8,
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(150px, 1fr))",
                                    }}
                                >
                                    <div style={miniStatStyle}>
                                        500+ phiên bản
                                    </div>
                                    <div style={miniStatStyle}>
                                        98% khách quay lại
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

const wrapStyle: CSSProperties = {
    minHeight: "100vh",
    background: "#f7f0e3",
    padding: 24,
    color: "#2c1d0d",
};

const loginCardStyle: CSSProperties = {
    maxWidth: 520,
    margin: "0 auto",
    background: "#fffdf9",
    borderRadius: 20,
    padding: 24,
    border: "1px solid #f0dfc4",
    boxShadow: "0 12px 30px rgba(73, 45, 13, 0.07)",
};

const headerStyle: CSSProperties = {
    background: "#ffffff",
    borderRadius: 20,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    boxShadow: "0 10px 28px rgba(73, 45, 13, 0.08)",
};

const eyebrowStyle: CSSProperties = {
    fontSize: 12,
    color: "#8a6642",
    textTransform: "uppercase",
    letterSpacing: 1,
};

const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 20,
    marginTop: 20,
};

const panelStyle: CSSProperties = {
    background: "#fffdf9",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 12px 30px rgba(73, 45, 13, 0.07)",
    border: "1px solid #f0dfc4",
};

const formGridStyle: CSSProperties = {
    display: "grid",
    gap: 12,
};

const labelStyle: CSSProperties = {
    display: "grid",
    gap: 6,
    fontWeight: 600,
    color: "#5d4327",
};

const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e2ccaa",
    background: "#fffefb",
    fontSize: 14,
    outline: "none",
};

const colorInputStyle: CSSProperties = {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    border: "1px solid #e2ccaa",
    background: "#fffefb",
    padding: 6,
};

const switchStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#5d4327",
    fontWeight: 600,
};

const primaryButtonStyle: CSSProperties = {
    padding: "10px 16px",
    border: 0,
    borderRadius: 12,
    cursor: "pointer",
    background: "linear-gradient(135deg, #b96f36, #84512b)",
    color: "#fff",
    fontWeight: 700,
    textDecoration: "none",
};

const ghostButtonStyle: CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #dab27e",
    cursor: "pointer",
    background: "#fff7ed",
    color: "#5d4327",
    fontWeight: 700,
    textDecoration: "none",
};

const miniStatStyle: CSSProperties = {
    border: "1px solid #eadbc6",
    borderRadius: 12,
    padding: "10px 12px",
    background: "#fffdf9",
    fontWeight: 700,
};
