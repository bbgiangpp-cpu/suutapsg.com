"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Product = {
    id: number;
    name: string;
    category: string;
    price: number;
    year: string;
    origin: string;
    quality: string;
    description: string;
    image: string;
    featured: boolean;
};

type Order = {
    id: number;
    orderId: string;
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: string;
    total: number;
    items: string;
    createdAt: string;
};

const emptyForm: Product = {
    id: 0,
    name: "",
    category: "tem",
    price: 0,
    year: "",
    origin: "",
    quality: "",
    description: "",
    image: "",
    featured: false,
};

const formatCurrency = (value: number) =>
    `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const categoryLabel: Record<string, string> = {
    tem: "Tem thư",
    "buu-anh": "Bưu ảnh",
    niem: "Niêm - giấy tờ xưa",
};

export default function AdminPage() {
    const router = useRouter();
    const [login, setLogin] = useState({
        email: "admin@suutapsg.com",
        password: "admin123",
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [message, setMessage] = useState("");
    const [form, setForm] = useState<Product>(emptyForm);

    const stats = useMemo(() => {
        return {
            totalProducts: products.length,
            totalOrders: orders.length,
            featuredCount: products.filter((item) => item.featured).length,
            totalRevenue: orders.reduce(
                (sum: number, order: Order) => sum + Number(order.total || 0),
                0,
            ),
        };
    }, [products, orders]);

    const loadAdminData = async () => {
        const [productRes, orderRes] = await Promise.all([
            fetch("/api/admin/products"),
            fetch("/api/admin/orders"),
        ]);

        if (productRes.ok) {
            const productData = await productRes.json();
            setProducts(productData.products || []);
        }

        if (orderRes.ok) {
            const orderData = await orderRes.json();
            setOrders(orderData.orders || []);
        }
    };

    const verifySession = async () => {
        const res = await fetch("/api/admin/products");
        if (!res.ok) {
            setIsLoggedIn(false);
            return;
        }

        setIsLoggedIn(true);
        await loadAdminData();
    };

    useEffect(() => {
        verifySession();
    }, []);

    const handleLogin = async () => {
        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(login),
        });

        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
            setMessage(result.message || "Đăng nhập thất bại");
            return;
        }

        setIsLoggedIn(true);
        setMessage(result.message || "Đăng nhập admin thành công");
        await loadAdminData();
    };

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        setIsLoggedIn(false);
        setProducts([]);
        setOrders([]);
        setForm(emptyForm);
        setMessage("Đăng xuất thành công");
        router.push("/");
    };

    const handleSave = async () => {
        const method = form.id ? "PUT" : "POST";
        const res = await fetch("/api/admin/products", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
            setMessage(result.message || "Không thể lưu sản phẩm");
            return;
        }

        setMessage(form.id ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm mới");
        setForm(emptyForm);
        await loadAdminData();
    };

    const handleEdit = (product: Product) => {
        setForm(product);
        setMessage(`Đang chỉnh sửa: ${product.name}`);
    };

    const handleDelete = async (id: number) => {
        const res = await fetch(`/api/admin/products?id=${id}`, {
            method: "DELETE",
        });
        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
            setMessage(result.message || "Không thể xoá sản phẩm");
            return;
        }

        setMessage("Đã xoá sản phẩm");
        setForm(emptyForm);
        await loadAdminData();
    };

    if (!isLoggedIn) {
        return (
            <main
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    background:
                        "linear-gradient(135deg, #f6eadb 0%, #fffdf8 45%, #efe4d1 100%)",
                    padding: 24,
                }}
            >
                <section
                    style={{
                        width: "100%",
                        maxWidth: 440,
                        background: "#fff",
                        borderRadius: 24,
                        padding: 28,
                        boxShadow: "0 20px 60px rgba(72, 42, 11, 0.16)",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <div
                            style={{
                                width: 72,
                                height: 72,
                                margin: "0 auto 12px",
                                borderRadius: 18,
                                display: "grid",
                                placeItems: "center",
                                color: "#fff",
                                background:
                                    "linear-gradient(135deg, #b96f36, #84512b)",
                                fontWeight: 700,
                                fontSize: 26,
                            }}
                        >
                            ST
                        </div>
                        <h1 style={{ margin: 0, color: "#3b2412" }}>
                            Admin Storefront
                        </h1>
                        <p style={{ margin: "8px 0 0", color: "#7a6044" }}>
                            Chỉ quản trị viên được phép truy cập trang quản lý.
                        </p>
                    </div>

                    <div style={{ display: "grid", gap: 12 }}>
                        <input
                            value={login.email}
                            onChange={(e) =>
                                setLogin({ ...login, email: e.target.value })
                            }
                            placeholder="Email admin"
                            style={inputStyle}
                        />
                        <input
                            type="password"
                            value={login.password}
                            onChange={(e) =>
                                setLogin({ ...login, password: e.target.value })
                            }
                            placeholder="Mật khẩu"
                            style={inputStyle}
                        />
                        <button
                            onClick={handleLogin}
                            style={primaryButtonStyle}
                        >
                            Đăng nhập quản trị
                        </button>
                        <p style={{ margin: 0, color: "#a05431" }}>{message}</p>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "#f7f0e3",
                padding: 24,
                color: "#2c1d0d",
            }}
        >
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                <header
                    style={{
                        background: "#ffffff",
                        borderRadius: 20,
                        padding: "18px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        boxShadow: "0 10px 28px rgba(73, 45, 13, 0.08)",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 12,
                                color: "#8a6642",
                                textTransform: "uppercase",
                                letterSpacing: 1,
                            }}
                        >
                            Admin Console
                        </div>
                        <h1 style={{ margin: "4px 0 0", fontSize: 28 }}>
                            Quản trị storefront tem thư Việt Nam
                        </h1>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Link href="/admin/frontend" style={ghostButtonStyle}>
                            Chỉnh frontend
                        </Link>
                        <button onClick={handleLogout} style={ghostButtonStyle}>
                            Đăng xuất
                        </button>
                    </div>
                </header>

                <section
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 16,
                        marginTop: 20,
                    }}
                >
                    <StatCard label="Sản phẩm" value={stats.totalProducts} />
                    <StatCard label="Đơn hàng" value={stats.totalOrders} />
                    <StatCard label="Nổi bật" value={stats.featuredCount} />
                    <StatCard
                        label="Doanh thu"
                        value={formatCurrency(stats.totalRevenue)}
                    />
                </section>

                <p style={{ margin: "12px 0 0", color: "#9d6535" }}>
                    {message}
                </p>

                <section
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 20,
                        marginTop: 20,
                    }}
                >
                    <div style={panelStyle}>
                        <div style={{ marginBottom: 16 }}>
                            <h2 style={{ margin: 0 }}>Sản phẩm</h2>
                            <div style={{ color: "#8a6642", marginTop: 4 }}>
                                {form.id
                                    ? "Chỉnh sửa sản phẩm"
                                    : "Thêm sản phẩm mới"}
                            </div>
                        </div>

                        <div style={{ display: "grid", gap: 12 }}>
                            <input
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                placeholder="Tên sản phẩm"
                                style={inputStyle}
                            />
                            <select
                                value={form.category}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        category: e.target.value,
                                    })
                                }
                                style={inputStyle}
                            >
                                <option value="tem">Tem thư</option>
                                <option value="buu-anh">Bưu ảnh</option>
                                <option value="niem">Niêm - giấy tờ xưa</option>
                            </select>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        price: Number(e.target.value),
                                    })
                                }
                                placeholder="Giá"
                                style={inputStyle}
                            />
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 12,
                                }}
                            >
                                <input
                                    value={form.year}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            year: e.target.value,
                                        })
                                    }
                                    placeholder="Năm"
                                    style={inputStyle}
                                />
                                <input
                                    value={form.origin}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            origin: e.target.value,
                                        })
                                    }
                                    placeholder="Xuất xứ"
                                    style={inputStyle}
                                />
                            </div>
                            <input
                                value={form.quality}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        quality: e.target.value,
                                    })
                                }
                                placeholder="Chất lượng"
                                style={inputStyle}
                            />
                            <textarea
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Mô tả"
                                style={{
                                    ...inputStyle,
                                    minHeight: 120,
                                    resize: "vertical",
                                }}
                            />
                            <input
                                value={form.image}
                                onChange={(e) =>
                                    setForm({ ...form, image: e.target.value })
                                }
                                placeholder="URL hình ảnh"
                                style={inputStyle}
                            />
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={form.featured}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            featured: e.target.checked,
                                        })
                                    }
                                />
                                Đánh dấu là sản phẩm nổi bật
                            </label>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    flexWrap: "wrap",
                                }}
                            >
                                <button
                                    onClick={handleSave}
                                    style={primaryButtonStyle}
                                >
                                    {form.id
                                        ? "Cập nhật sản phẩm"
                                        : "Thêm sản phẩm"}
                                </button>
                                <button
                                    onClick={() => setForm(emptyForm)}
                                    style={ghostButtonStyle}
                                >
                                    Làm mới
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={panelStyle}>
                        <div style={{ marginBottom: 16 }}>
                            <h2 style={{ margin: 0 }}>Đơn hàng</h2>
                            <div style={{ color: "#8a6642", marginTop: 4 }}>
                                Theo dõi đơn đặt hàng mới nhất
                            </div>
                        </div>

                        <div style={{ display: "grid", gap: 10 }}>
                            {orders.length === 0 ? (
                                <div
                                    style={{
                                        padding: 12,
                                        borderRadius: 12,
                                        background: "#faf5ec",
                                    }}
                                >
                                    Chưa có đơn hàng nào.
                                </div>
                            ) : (
                                orders.map((order) => (
                                    <div
                                        key={order.id}
                                        style={{
                                            border: "1px solid #eadbc6",
                                            borderRadius: 14,
                                            padding: 12,
                                            background: "#fffdf9",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 8,
                                            }}
                                        >
                                            <strong>{order.orderId}</strong>
                                            <span style={{ color: "#7a5a36" }}>
                                                {formatCurrency(order.total)}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                marginTop: 6,
                                                color: "#5d4327",
                                            }}
                                        >
                                            {order.customerName} • {order.phone}
                                        </div>
                                        <div
                                            style={{
                                                marginTop: 2,
                                                color: "#5d4327",
                                            }}
                                        >
                                            {order.address}
                                        </div>
                                        <div
                                            style={{
                                                marginTop: 4,
                                                fontSize: 13,
                                                color: "#7a6044",
                                            }}
                                        >
                                            Thanh toán: {order.paymentMethod}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <section style={{ ...panelStyle, marginTop: 20 }}>
                    <div style={{ marginBottom: 16 }}>
                        <h2 style={{ margin: 0 }}>Danh sách sản phẩm</h2>
                        <div style={{ color: "#8a6642", marginTop: 4 }}>
                            CRUD rõ ràng, đang phục vụ từ database nội bộ
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: 12 }}>
                        {products.map((product) => (
                            <div
                                key={product.id}
                                style={{
                                    border: "1px solid #eadbc6",
                                    borderRadius: 16,
                                    background: "#fffdf9",
                                    padding: 14,
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto",
                                    gap: 12,
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            fontSize: 18,
                                        }}
                                    >
                                        {product.name}
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 4,
                                            color: "#7a6044",
                                        }}
                                    >
                                        {categoryLabel[product.category] ||
                                            product.category}{" "}
                                        • {formatCurrency(product.price)} •{" "}
                                        {product.year}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 8,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <button
                                        onClick={() => handleEdit(product)}
                                        style={ghostButtonStyle}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        style={{
                                            ...ghostButtonStyle,
                                            background: "#7d2b2b",
                                            color: "#fff",
                                        }}
                                    >
                                        Xoá
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div style={{ ...panelStyle, padding: 18 }}>
            <div style={{ color: "#8a6642", fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                {value}
            </div>
        </div>
    );
}

const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e2ccaa",
    background: "#fffefb",
    fontSize: 14,
    outline: "none",
};

const panelStyle: CSSProperties = {
    background: "#fffdf9",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 12px 30px rgba(73, 45, 13, 0.07)",
    border: "1px solid #f0dfc4",
};

const primaryButtonStyle: CSSProperties = {
    padding: "12px 18px",
    border: 0,
    borderRadius: 12,
    cursor: "pointer",
    background: "linear-gradient(135deg, #b96f36, #84512b)",
    color: "#fff",
    fontWeight: 700,
};

const ghostButtonStyle: CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #dab27e",
    cursor: "pointer",
    background: "#fff7ed",
    color: "#5d4327",
    fontWeight: 600,
};
