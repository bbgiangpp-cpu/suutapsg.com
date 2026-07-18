import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const isAdmin = () =>
    cookies().get("admin_session")?.value === "authenticated" &&
    cookies().get("admin_role")?.value === "admin";

const parseImages = (body: { images?: unknown; image?: unknown }) => {
    const images = Array.isArray(body.images)
        ? body.images.filter((item): item is string => typeof item === "string")
        : [];

    if (images.length) {
        return images;
    }

    const fallback = String(body.image || "").trim();
    return fallback ? [fallback] : [];
};

export async function GET() {
    if (!isAdmin()) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const rows = db
        .prepare("SELECT * FROM products ORDER BY id DESC")
        .all() as Array<Record<string, unknown> & { images: string }>;

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

        return { ...row, images };
    });

    return NextResponse.json({ products });
}

export async function POST(req: Request) {
    if (!isAdmin()) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const images = parseImages(body);
    const insert = db.prepare(`
    INSERT INTO products (name, category, price, quantity, year, origin, quality, description, image, images, featured)
    VALUES (@name, @category, @price, @quantity, @year, @origin, @quality, @description, @image, @images, @featured)
  `);

    const result = insert.run({
        name: body.name,
        category: body.category,
        price: Number(body.price),
        quantity: Number(body.quantity) || 0,
        year: body.year,
        origin: body.origin,
        quality: body.quality,
        description: body.description,
        image: images[0] || "",
        images: JSON.stringify(images),
        featured: body.featured ? 1 : 0,
    });

    return NextResponse.json({
        message: "Sản phẩm đã được lưu",
        id: result.lastInsertRowid,
    });
}

export async function PUT(req: Request) {
    if (!isAdmin()) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const images = parseImages(body);
    db.prepare(
        `
    UPDATE products
    SET name = @name,
        category = @category,
        price = @price,
        quantity = @quantity,
        year = @year,
        origin = @origin,
        quality = @quality,
        description = @description,
        image = @image,
        images = @images,
        featured = @featured
    WHERE id = @id
  `,
    ).run({
        id: body.id,
        name: body.name,
        category: body.category,
        price: Number(body.price),
        quantity: Number(body.quantity) || 0,
        year: body.year,
        origin: body.origin,
        quality: body.quality,
        description: body.description,
        image: images[0] || "",
        images: JSON.stringify(images),
        featured: body.featured ? 1 : 0,
    });

    return NextResponse.json({ message: "Sản phẩm đã được cập nhật" });
}

export async function DELETE(req: Request) {
    if (!isAdmin()) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
        return NextResponse.json(
            { message: "Thiếu id sản phẩm" },
            { status: 400 },
        );
    }

    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return NextResponse.json({ message: "Sản phẩm đã được xoá" });
}
