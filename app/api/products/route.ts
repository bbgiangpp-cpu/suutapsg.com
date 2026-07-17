import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    const products = db
        .prepare(
            "SELECT id, name, category, price, year, origin, quality, description, image, featured FROM products ORDER BY id DESC",
        )
        .all();

    return NextResponse.json({ products });
}
