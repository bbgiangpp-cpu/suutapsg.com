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

    const orders = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();
    return NextResponse.json({ orders });
}
