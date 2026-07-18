import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    const rows = db
        .prepare(
            "SELECT id, name, category, price, quantity, year, origin, quality, description, image, images, featured FROM products ORDER BY id DESC",
        )
        .all() as Array<{
        id: number;
        name: string;
        category: string;
        price: number;
        quantity: number;
        year: string;
        origin: string;
        quality: string;
        description: string;
        image: string;
        images: string;
        featured: number;
    }>;

    const products = rows.map((row) => {
        let images: string[] = [];
        try {
            const parsed = JSON.parse(row.images);
            if (Array.isArray(parsed)) {
                images = parsed.filter((item) => typeof item === "string");
            }
        } catch {
            images = [];
        }

        return {
            ...row,
            images: images.length ? images : [row.image].filter(Boolean),
            featured: Boolean(row.featured),
        };
    });

    return NextResponse.json({ products });
}
