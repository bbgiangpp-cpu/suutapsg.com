import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/security";

export async function POST(req: Request) {
    const ip = getClientIp(req);
    const limiter = rateLimit({
        key: `order-create:${ip}`,
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

    const requiredFields = ["name", "phone", "address", "paymentMethod"];
    const missing = requiredFields.filter((field) => !body[field]);

    if (missing.length > 0) {
        return NextResponse.json(
            {
                message: `Thiếu thông tin: ${missing.join(", ")}`,
            },
            { status: 400 },
        );
    }

    const paymentMethod = String(body.paymentMethod || "").trim();
    const allowedMethods = new Set(["cod", "bank", "momo"]);
    if (!allowedMethods.has(paymentMethod)) {
        return NextResponse.json(
            { message: "Phương thức thanh toán không hợp lệ" },
            { status: 400 },
        );
    }

    const total = Number(body.total || 0);
    if (!Number.isFinite(total) || total < 0 || total > 1_000_000_000) {
        return NextResponse.json(
            { message: "Tổng tiền không hợp lệ" },
            { status: 400 },
        );
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length > 100) {
        return NextResponse.json(
            { message: "Số lượng sản phẩm vượt quá giới hạn" },
            { status: 400 },
        );
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const isOnlinePayment = paymentMethod !== "cod";
    const paymentStatus = isOnlinePayment ? "pending" : "paid";
    const status = isOnlinePayment ? "pending" : "completed";

    db.prepare(
        `
        INSERT INTO orders (
            orderId,
            customerName,
            phone,
            address,
            paymentMethod,
            total,
            items,
            paymentStatus,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
        orderId,
        body.name,
        body.phone,
        body.address,
        paymentMethod,
        total,
        JSON.stringify(items),
        paymentStatus,
        status,
    );

    return NextResponse.json(
        {
            message: isOnlinePayment
                ? "Đặt hàng mẫu thành công, cần xác nhận thanh toán online"
                : "Đặt hàng mẫu thành công",
            orderId,
            paymentStatus,
            paymentUrl: isOnlinePayment
                ? `https://pay-demo.example.vn/checkout/${orderId}`
                : "",
            data: body,
        },
        { status: 201 },
    );
}
