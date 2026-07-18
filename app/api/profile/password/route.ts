import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/security";
import { createPasswordRecord, verifyPassword } from "@/lib/password";

const MIN_PASSWORD_LENGTH = 6;

type CredentialRow = {
    email: string;
    passwordHash: string;
    passwordSalt: string;
};

const loadCredentialByEmail = (email: string) =>
    db
        .prepare(
            "SELECT email, passwordHash, passwordSalt FROM user_credentials WHERE email = ?",
        )
        .get(email) as CredentialRow | undefined;

const validatePasswordLength = (password: string) =>
    typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;

export async function POST(req: Request) {
    const ip = getClientIp(req);
    const limiter = rateLimit({
        key: `profile-password-verify:${ip}`,
        limit: 60,
        windowMs: 10 * 60 * 1000,
    });

    if (!limiter.allowed) {
        return NextResponse.json(
            { message: "Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau." },
            { status: 429 },
        );
    }

    const body = await req.json();
    const email = String(body.email || "")
        .trim()
        .toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
        return NextResponse.json(
            { message: "Thiếu email hoặc mật khẩu" },
            { status: 400 },
        );
    }

    const credential = loadCredentialByEmail(email);

    if (!credential) {
        return NextResponse.json(
            { valid: false, hasCredential: false },
            { status: 200 },
        );
    }

    return NextResponse.json({
        valid: verifyPassword(password, credential),
        hasCredential: true,
    });
}

export async function PUT(req: Request) {
    const ip = getClientIp(req);
    const limiter = rateLimit({
        key: `profile-password-set:${ip}`,
        limit: 30,
        windowMs: 10 * 60 * 1000,
    });

    if (!limiter.allowed) {
        return NextResponse.json(
            { message: "Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau." },
            { status: 429 },
        );
    }

    const body = await req.json();
    const email = String(body.email || "")
        .trim()
        .toLowerCase();
    const newPassword = String(body.newPassword || "");

    if (!email || !validatePasswordLength(newPassword)) {
        return NextResponse.json(
            { message: "Mật khẩu mới không hợp lệ" },
            { status: 400 },
        );
    }

    const nextPassword = createPasswordRecord(newPassword);

    db.prepare(
        `
        INSERT INTO user_credentials (email, passwordHash, passwordSalt, updatedAt)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(email) DO UPDATE SET
            passwordHash = excluded.passwordHash,
            passwordSalt = excluded.passwordSalt,
            updatedAt = CURRENT_TIMESTAMP
    `,
    ).run(email, nextPassword.hash, nextPassword.salt);

    return NextResponse.json({ message: "Đã lưu mật khẩu" });
}

export async function PATCH(req: Request) {
    const ip = getClientIp(req);
    const limiter = rateLimit({
        key: `profile-password-change:${ip}`,
        limit: 20,
        windowMs: 10 * 60 * 1000,
    });

    if (!limiter.allowed) {
        return NextResponse.json(
            { message: "Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau." },
            { status: 429 },
        );
    }

    const body = await req.json();
    const email = String(body.email || "")
        .trim()
        .toLowerCase();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!email || !currentPassword || !validatePasswordLength(newPassword)) {
        return NextResponse.json(
            { message: "Thông tin đổi mật khẩu không hợp lệ" },
            { status: 400 },
        );
    }

    const credential = loadCredentialByEmail(email);

    if (!credential || !verifyPassword(currentPassword, credential)) {
        return NextResponse.json(
            { message: "Mật khẩu hiện tại không đúng" },
            { status: 401 },
        );
    }

    const nextPassword = createPasswordRecord(newPassword);

    db.prepare(
        `
        UPDATE user_credentials
        SET passwordHash = ?,
            passwordSalt = ?,
            updatedAt = CURRENT_TIMESTAMP
        WHERE email = ?
    `,
    ).run(nextPassword.hash, nextPassword.salt, email);

    return NextResponse.json({ message: "Đổi mật khẩu thành công" });
}
