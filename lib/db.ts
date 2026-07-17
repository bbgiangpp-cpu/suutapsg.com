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
    year TEXT,
    origin TEXT,
    quality TEXT,
    description TEXT,
    image TEXT,
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

    CREATE TABLE IF NOT EXISTS frontend_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        brandName TEXT NOT NULL,
        heroTitle TEXT NOT NULL,
        heroDescription TEXT NOT NULL,
        hotline TEXT NOT NULL,
        primaryColor TEXT NOT NULL,
        accentColor TEXT NOT NULL,
        showHotline INTEGER NOT NULL DEFAULT 1,
        showHeroStats INTEGER NOT NULL DEFAULT 1,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);

if (!hasColumn("orders", "paymentStatus")) {
    db.exec(
        "ALTER TABLE orders ADD COLUMN paymentStatus TEXT DEFAULT 'pending'",
    );
}

if (!hasColumn("orders", "status")) {
    db.exec("ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'");
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
            showHotline,
            showHeroStats
        ) VALUES (1, ?, ?, ?, ?, ?, ?, 1, 1)
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
    INSERT INTO products (id, name, category, price, year, origin, quality, description, image, featured)
    VALUES (@id, @name, @category, @price, @year, @origin, @quality, @description, @image, @featured)
  `);

    const insertMany = db.transaction((items: typeof seedProducts) => {
        for (const item of items) {
            insertProduct.run({
                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                year: item.year,
                origin: item.origin,
                quality: item.quality,
                description: item.description,
                image: item.image,
                featured: item.featured ? 1 : 0,
            });
        }
    });

    insertMany(seedProducts);
}

export { db };
