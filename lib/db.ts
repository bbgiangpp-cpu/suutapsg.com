import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { products as seedProducts } from "@/lib/storeData";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "store.db");
const db = new Database(dbPath);

const hasColumn = (tableName: string, columnName: string) => {
    const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
        name: string;
    }>;

    return rows.some((row) => row.name === columnName);
};

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    year TEXT,
    origin TEXT,
    quality TEXT,
    description TEXT,
    image TEXT,
    images TEXT NOT NULL DEFAULT '[]',
    featured INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId TEXT NOT NULL UNIQUE,
    customerName TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    paymentMethod TEXT NOT NULL,
    total INTEGER NOT NULL,
    items TEXT NOT NULL,
    paymentStatus TEXT DEFAULT 'pending',
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

    CREATE TABLE IF NOT EXISTS user_profiles (
        email TEXT PRIMARY KEY,
        displayName TEXT NOT NULL,
        initials TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        avatarUrl TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        address TEXT DEFAULT '',
        isOnline INTEGER NOT NULL DEFAULT 1,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_credentials (
        email TEXT PRIMARY KEY,
        passwordHash TEXT NOT NULL,
        passwordSalt TEXT NOT NULL,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS frontend_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        brandName TEXT NOT NULL,
        heroTitle TEXT NOT NULL,
        heroDescription TEXT NOT NULL,
        hotline TEXT NOT NULL,
        primaryColor TEXT NOT NULL,
        accentColor TEXT NOT NULL,
        paymentQrUrl TEXT NOT NULL DEFAULT '',
        bankQrUrl TEXT NOT NULL DEFAULT '',
        momoQrUrl TEXT NOT NULL DEFAULT '',
        showHotline INTEGER NOT NULL DEFAULT 1,
        showHeroStats INTEGER NOT NULL DEFAULT 1,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);

if (!hasColumn("products", "images")) {
    db.exec(
        "ALTER TABLE products ADD COLUMN images TEXT NOT NULL DEFAULT '[]'",
    );

    const legacyProducts = db
        .prepare(
            "SELECT id, image FROM products WHERE image IS NOT NULL AND image != ''",
        )
        .all() as Array<{ id: number; image: string }>;

    const setImages = db.prepare(
        "UPDATE products SET images = ? WHERE id = ?",
    );

    for (const product of legacyProducts) {
        setImages.run(JSON.stringify([product.image]), product.id);
    }
}

if (!hasColumn("products", "quantity")) {
    db.exec(
        "ALTER TABLE products ADD COLUMN quantity INTEGER NOT NULL DEFAULT 0",
    );
    db.exec("UPDATE products SET quantity = 1 WHERE quantity = 0");
}

if (!hasColumn("orders", "paymentStatus")) {
    db.exec(
        "ALTER TABLE orders ADD COLUMN paymentStatus TEXT DEFAULT 'pending'",
    );
}

if (!hasColumn("orders", "status")) {
    db.exec("ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'");
}

if (!hasColumn("frontend_settings", "paymentQrUrl")) {
    db.exec(
        "ALTER TABLE frontend_settings ADD COLUMN paymentQrUrl TEXT NOT NULL DEFAULT ''",
    );
}

if (!hasColumn("frontend_settings", "bankQrUrl")) {
    db.exec(
        "ALTER TABLE frontend_settings ADD COLUMN bankQrUrl TEXT NOT NULL DEFAULT ''",
    );
    db.exec(
        "UPDATE frontend_settings SET bankQrUrl = paymentQrUrl WHERE bankQrUrl = ''",
    );
}

if (!hasColumn("frontend_settings", "momoQrUrl")) {
    db.exec(
        "ALTER TABLE frontend_settings ADD COLUMN momoQrUrl TEXT NOT NULL DEFAULT ''",
    );
}

const frontendSettingsCount = db
    .prepare("SELECT COUNT(*) as count FROM frontend_settings")
    .get() as {
    count: number;
};

if (frontendSettingsCount.count === 0) {
    db.prepare(
        `
        INSERT INTO frontend_settings (
            id,
            brandName,
            heroTitle,
            heroDescription,
            hotline,
            primaryColor,
            accentColor,
            paymentQrUrl,
            showHotline,
            showHeroStats
        ) VALUES (1, ?, ?, ?, ?, ?, ?, '', 1, 1)
    `,
    ).run(
        "SuutapSG",
        "Storefront chuyên nghiệp cho tem thư, bưu ảnh và niêm giấy xưa",
        "Trang này được nâng cấp thành storefront hoàn chỉnh với dữ liệu thực, giỏ hàng và form thanh toán mẫu, áp dụng mô hình Next.js hiện đại.",
        "0900 123 456",
        "#b96f36",
        "#84512b",
    );
}

const count = db.prepare("SELECT COUNT(*) as count FROM products").get() as {
    count: number;
};

if (count.count === 0) {
    const insertProduct = db.prepare(`
    INSERT INTO products (id, name, category, price, quantity, year, origin, quality, description, image, images, featured)
    VALUES (@id, @name, @category, @price, @quantity, @year, @origin, @quality, @description, @image, @images, @featured)
  `);

    const insertMany = db.transaction((items: typeof seedProducts) => {
        for (const item of items) {
            insertProduct.run({
                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                quantity: item.quantity,
                year: item.year,
                origin: item.origin,
                quality: item.quality,
                description: item.description,
                image: item.image,
                images: JSON.stringify(
                    item.images && item.images.length
                        ? item.images
                        : [item.image],
                ),
                featured: item.featured ? 1 : 0,
            });
        }
    });

    insertMany(seedProducts);
}

export { db };
