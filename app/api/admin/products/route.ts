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

    const products = db
        .prepare("SELECT * FROM products ORDER BY id DESC")
        .all();
    return NextResponse.json({ products });
}

export async function POST(req: Request) {
    if (!isAdmin()) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const insert = db.prepare(`
    INSERT INTO products (name, category, price, year, origin, quality, description, image, featured)
    VALUES (@name, @category, @price, @year, @origin, @quality, @description, @image, @featured)
  `);

    const result = insert.run({
        name: body.name,
        category: body.category,
        price: Number(body.price),
        year: body.year,
        origin: body.origin,
        quality: body.quality,
        description: body.description,
        image: body.image,
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
    db.prepare(
        `
    UPDATE products
    SET name = @name,
        category = @category,
        price = @price,
        year = @year,
        origin = @origin,
        quality = @quality,
        description = @description,
        image = @image,
        featured = @featured
    WHERE id = @id
  `,
    ).run({
        id: body.id,
        name: body.name,
        category: body.category,
        price: Number(body.price),
        year: body.year,
        origin: body.origin,
        quality: body.quality,
        description: body.description,
        image: body.image,
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
