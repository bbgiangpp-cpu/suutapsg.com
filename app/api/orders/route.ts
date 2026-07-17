import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
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

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const isOnlinePayment = body.paymentMethod !== "cod";
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
        body.paymentMethod,
        Number(body.total || 0),
        JSON.stringify(body.items || []),
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
