"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type ChangeEvent,
    type FormEvent,
} from "react";
import Link from "next/link";
import type { Product } from "@/lib/storeData";

const formatPrice = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

const categoryLabels: Record<string, string> = {
    all: "Tất cả",
    tem: "Tem thư Việt Nam",
    "buu-anh": "Bưu ảnh Indochine",
    niem: "Niêm - Giấy tờ xưa",
};

type FrontendSettings = {
    brandName: string;
    heroTitle: string;
    heroDescription: string;
    hotline: string;
    primaryColor: string;
    accentColor: string;
    showHotline: boolean;
    showHeroStats: boolean;
};

type AuthMode = "login" | "register";
type UserRole = "admin" | "user";

const defaultFrontendSettings: FrontendSettings = {
    brandName: "SuutapSG",
    heroTitle: "Storefront chuyên nghiệp cho tem thư, bưu ảnh và niêm giấy xưa",
    heroDescription:
        "Trang này được nâng cấp thành storefront hoàn chỉnh với dữ liệu thực, giỏ hàng và form thanh toán mẫu, áp dụng mô hình Next.js hiện đại.",
    hotline: "0900 123 456",
    primaryColor: "#b96f36",
    accentColor: "#84512b",
    showHotline: true,
    showHeroStats: true,
};

const authStorageKey = "storefront_auth_email";

export default function HomePage() {
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<"all" | Product["category"]>(
        "all",
    );
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<Record<number, number>>({});
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [checkout, setCheckout] = useState({
        name: "",
        phone: "",
        address: "",
        paymentMethod: "cod",
    });
    const [orderMessage, setOrderMessage] = useState("");
    const [paymentLink, setPaymentLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [frontendSettings, setFrontendSettings] = useState<FrontendSettings>(
        defaultFrontendSettings,
    );
    const [authMode, setAuthMode] = useState<AuthMode | null>(null);
    const [authMessage, setAuthMessage] = useState("");
    const [captchaQuestion, setCaptchaQuestion] = useState("");
    const [captchaAnswer, setCaptchaAnswer] = useState("");
    const [authForm, setAuthForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        captchaInput: "",
    });
    const [userProfile, setUserProfile] = useState({
        displayName: "Bạn",
        initials: "SG",
        isOnline: true,
        role: "user" as UserRole,
        avatarUrl: "",
        email: "",
        phone: "",
        address: "",
    });
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [profileForm, setProfileForm] = useState({
        avatarUrl: "",
        email: "",
        phone: "",
        address: "",
    });

    const saveProfileToApi = async (payload: {
        email: string;
        displayName: string;
        initials: string;
        role: UserRole;
        avatarUrl: string;
        phone: string;
        address: string;
        isOnline: boolean;
    }) => {
        await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    };

    const loadProfileByEmail = async (email: string) => {
        const res = await fetch(
            `/api/profile?email=${encodeURIComponent(email.toLowerCase())}`,
        );

        if (!res.ok) {
            return null;
        }

        const result = await res.json();
        return result.profile as {
            email: string;
            displayName: string;
            initials: string;
            role: UserRole;
            avatarUrl: string;
            phone: string;
            address: string;
            isOnline: boolean;
        } | null;
    };

    useEffect(() => {
        fetch("/api/products")
            .then((res) => res.json())
            .then((data) => setProducts(data.products || []))
            .catch(() => setProducts([]));
    }, []);

    useEffect(() => {
        fetch("/api/frontend-settings")
            .then((res) => res.json())
            .then((data) => {
                if (data.settings) {
                    setFrontendSettings((prev) => ({
                        ...prev,
                        ...data.settings,
                    }));
                }
            })
            .catch(() => setFrontendSettings(defaultFrontendSettings));
    }, []);

    useEffect(() => {
        const storedEmail = localStorage.getItem(authStorageKey);
        if (!storedEmail) {
            return;
        }

        loadProfileByEmail(storedEmail)
            .then((profile) => {
                if (!profile) {
                    return;
                }

                setUserProfile({
                    displayName: profile.displayName,
                    initials: profile.initials,
                    isOnline: profile.isOnline,
                    role: profile.role,
                    avatarUrl: profile.avatarUrl,
                    email: profile.email,
                    phone: profile.phone,
                    address: profile.address,
                });
            })
            .catch(() => {
                // Keep default user profile when API lookup fails.
            });
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const syncViewport = () => setIsMobile(mediaQuery.matches);
        syncViewport();

        mediaQuery.addEventListener("change", syncViewport);
        return () => {
            mediaQuery.removeEventListener("change", syncViewport);
        };
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchCategory =
                category === "all" || product.category === category;
            const matchSearch = product.name
                .toLowerCase()
                .includes(search.toLowerCase());
            return matchCategory && matchSearch;
        });
    }, [products, category, search]);

    const visibleProducts = useMemo(() => {
        return filteredProducts.slice(0, isMobile ? 6 : 15);
    }, [filteredProducts, isMobile]);

    const cartItems = products.filter((product) => cart[product.id]);
    const total = cartItems.reduce(
        (sum, item) => sum + item.price * (cart[item.id] ?? 0),
        0,
    );

    const addToCart = (productId: number) => {
        setCart((prev) => ({
            ...prev,
            [productId]: (prev[productId] ?? 0) + 1,
        }));
    };

    const updateQuantity = (productId: number, change: number) => {
        setCart((prev) => {
            const next = (prev[productId] ?? 0) + change;
            if (next <= 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: next };
        });
    };

    const submitOrder = async () => {
        setLoading(true);
        setOrderMessage("");
        setPaymentLink("");

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...checkout, items: cart, total }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Có lỗi xảy ra");
            }

            const paymentLabel =
                result.paymentStatus === "pending"
                    ? "Đơn hàng đã được tạo. Bước tiếp theo: thanh toán online mẫu."
                    : "Đặt hàng thành công!";

            setOrderMessage(
                `${paymentLabel} Mã đơn: ${result.orderId}. ${result.paymentStatus === "pending" ? "Vui lòng bấm vào liên kết thanh toán mẫu để hoàn tất." : ""}`,
            );
            setPaymentLink(result.paymentUrl || "");
            setCart({});
            setCheckout({
                name: "",
                phone: "",
                address: "",
                paymentMethod: "cod",
            });
        } catch (error) {
            setOrderMessage(
                error instanceof Error ? error.message : "Có lỗi xảy ra",
            );
        } finally {
            setLoading(false);
        }
    };

    const createCaptcha = () => {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        setCaptchaQuestion(`${a} + ${b} = ?`);
        setCaptchaAnswer(String(a + b));
    };

    const openAuthModal = (mode: AuthMode) => {
        setAuthMode(mode);
        setAuthMessage("");
        setAuthForm({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            captchaInput: "",
        });
        createCaptcha();
    };

    const closeAuthModal = () => {
        setAuthMode(null);
        setAuthMessage("");
    };

    const openProfileModal = () => {
        setProfileMessage("");
        setProfileForm({
            avatarUrl: userProfile.avatarUrl,
            email: userProfile.email,
            phone: userProfile.phone,
            address: userProfile.address,
        });
        setProfileModalOpen(true);
    };

    const closeProfileModal = () => {
        setProfileModalOpen(false);
        setProfileMessage("");
    };

    const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setProfileMessage("Vui lòng chọn tệp ảnh hợp lệ.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result =
                typeof reader.result === "string" ? reader.result : "";
            setProfileForm((prev) => ({ ...prev, avatarUrl: result }));
            setProfileMessage("Đã tải ảnh avatar. Bấm Lưu profile để áp dụng.");
        };
        reader.onerror = () => {
            setProfileMessage("Không đọc được tệp ảnh. Vui lòng thử lại.");
        };
        reader.readAsDataURL(file);
    };

    const saveProfile = async (event: FormEvent) => {
        event.preventDefault();

        if (profileForm.email && !/\S+@\S+\.\S+/.test(profileForm.email)) {
            setProfileMessage("Email profile không hợp lệ.");
            return;
        }

        const nextEmail =
            profileForm.email.trim().toLowerCase() || userProfile.email;

        if (!nextEmail) {
            setProfileMessage("Vui lòng nhập email để lưu profile.");
            return;
        }

        const nextProfile = {
            ...userProfile,
            avatarUrl: profileForm.avatarUrl.trim(),
            email: nextEmail,
            phone: profileForm.phone.trim(),
            address: profileForm.address.trim(),
        };

        setUserProfile(nextProfile);
        localStorage.setItem(authStorageKey, nextProfile.email);

        try {
            await saveProfileToApi(nextProfile);
        } catch {
            setProfileMessage("Không lưu được profile lên hệ thống.");
            return;
        }
        setProfileMessage("Đã cập nhật profile và lưu vào hệ thống.");
        setTimeout(() => {
            closeProfileModal();
        }, 700);
    };

    const getInitials = (name: string) => {
        const clean = name.trim();
        if (!clean) {
            return "US";
        }
        const parts = clean.split(/\s+/).filter(Boolean);
        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    };

    const submitAuthForm = async (event: FormEvent) => {
        event.preventDefault();

        const emailValid = /\S+@\S+\.\S+/.test(authForm.email);
        if (!emailValid) {
            setAuthMessage("Email không hợp lệ.");
            return;
        }

        if (authForm.password.length < 6) {
            setAuthMessage("Mật khẩu cần tối thiểu 6 ký tự.");
            return;
        }

        if (authMode === "register") {
            if (!authForm.name.trim()) {
                setAuthMessage("Vui lòng nhập họ tên để đăng ký.");
                return;
            }

            if (authForm.password !== authForm.confirmPassword) {
                setAuthMessage("Mật khẩu xác nhận chưa khớp.");
                return;
            }
        }

        if (authForm.captchaInput.trim() !== captchaAnswer) {
            setAuthMessage("CAPTCHA chưa đúng. Vui lòng thử lại.");
            createCaptcha();
            setAuthForm((prev) => ({ ...prev, captchaInput: "" }));
            return;
        }

        const displayName =
            authMode === "register"
                ? authForm.name.trim()
                : authForm.email.split("@")[0];
        const role: UserRole =
            authForm.email.trim().toLowerCase() === "admin@suutapsg.com"
                ? "admin"
                : "user";

        const normalizedEmail = authForm.email.trim().toLowerCase();
        const existingProfile = await loadProfileByEmail(normalizedEmail);

        const nextProfile = existingProfile
            ? {
                  displayName: existingProfile.displayName,
                  initials: existingProfile.initials,
                  isOnline: true,
                  role,
                  avatarUrl: existingProfile.avatarUrl,
                  email: normalizedEmail,
                  phone: existingProfile.phone,
                  address: existingProfile.address,
              }
            : {
                  displayName,
                  initials: getInitials(displayName),
                  isOnline: true,
                  role,
                  avatarUrl: "",
                  email: normalizedEmail,
                  phone: "",
                  address: "",
              };

        setUserProfile(nextProfile);
        localStorage.setItem(authStorageKey, normalizedEmail);

        try {
            await saveProfileToApi(nextProfile);
        } catch {
            setAuthMessage("Không thể lưu profile đăng nhập lên hệ thống.");
            return;
        }

        setAuthMessage(
            authMode === "register"
                ? "Đăng ký thành công. Bạn đã được đăng nhập."
                : "Đăng nhập thành công.",
        );

        setTimeout(() => {
            closeAuthModal();
        }, 700);
    };

    return (
        <main style={{ paddingBottom: 48 }}>
            <header style={styles.topbar}>
                <div style={{ ...styles.container, ...styles.topbarRow }}>
                    <div style={styles.brandBlock}>
                        <div style={styles.brandRow}>
                            <div style={styles.brandIcon}>ST</div>
                            <div>
                                <div style={styles.brandTitle}>
                                    {frontendSettings.brandName}
                                </div>
                                <div style={styles.brandSub}>
                                    Collector Edition
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={styles.navBlock}>
                        <nav style={styles.menu}>
                            <a href="#home">Trang chủ</a>
                            <a href="#products">Bộ sưu tập</a>
                            <a href="#cart">Giỏ hàng</a>
                            <a href="#contact">Liên hệ</a>
                        </nav>
                    </div>
                    <div style={styles.accountBlock}>
                        {frontendSettings.showHotline ? (
                            <div style={styles.hotline}>
                                Hotline: {frontendSettings.hotline}
                            </div>
                        ) : null}
                        <div style={styles.authActions}>
                            <button
                                style={styles.registerBtn}
                                onClick={() => openAuthModal("register")}
                            >
                                Đăng ký
                            </button>
                            <button
                                style={styles.loginBtn}
                                onClick={() => openAuthModal("login")}
                            >
                                Đăng nhập
                            </button>
                            <button
                                style={styles.userBadge}
                                onClick={openProfileModal}
                                type="button"
                            >
                                <div style={styles.avatarWrap}>
                                    {userProfile.avatarUrl ? (
                                        <img
                                            src={userProfile.avatarUrl}
                                            alt="Avatar người dùng"
                                            style={styles.avatarImage}
                                            loading="eager"
                                            decoding="async"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div style={styles.avatar}>
                                            {userProfile.initials}
                                        </div>
                                    )}
                                    {userProfile.isOnline ? (
                                        <span style={styles.onlineDot} />
                                    ) : null}
                                </div>
                                <span style={styles.userLabel}>
                                    {userProfile.displayName}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <section id="home" style={styles.hero}>
                <div style={{ ...styles.container, ...styles.heroGrid }}>
                    <div>
                        <span style={styles.eyebrow}>
                            Tem thư Việt Nam & đồ sưu tầm cổ
                        </span>
                        <h1 style={styles.heroTitle}>
                            {frontendSettings.heroTitle}
                        </h1>
                        <p style={styles.heroDesc}>
                            {frontendSettings.heroDescription}
                        </p>
                        <div style={styles.actions}>
                            <a
                                href="#products"
                                style={{
                                    ...styles.primaryBtn,
                                    background: `linear-gradient(135deg, ${frontendSettings.primaryColor}, ${frontendSettings.accentColor})`,
                                }}
                            >
                                Xem bộ sưu tập
                            </a>
                            <a href="#cart" style={styles.secondaryBtn}>
                                Chốt đơn ngay
                            </a>
                        </div>
                    </div>

                    <div style={styles.heroCard}>
                        {frontendSettings.showHeroStats ? (
                            <>
                                <div style={styles.statBox}>500+ phiên bản</div>
                                <div style={styles.statBox}>
                                    98% khách quay lại
                                </div>
                            </>
                        ) : null}
                        <div style={styles.featureBox}>
                            <h3>Điểm mạnh</h3>
                            <ul>
                                <li>Danh mục có giá trị thật và dễ mở rộng</li>
                                <li>Giỏ hàng và thanh toán mẫu hoàn chỉnh</li>
                                <li>Modal chi tiết sản phẩm hiện đại</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ padding: "10px 0 16px" }}>
                <div style={styles.container}>
                    <div style={styles.filters}>
                        {["all", "tem", "buu-anh", "niem"].map((item) => (
                            <button
                                key={item}
                                onClick={() =>
                                    setCategory(
                                        item as "all" | Product["category"],
                                    )
                                }
                                style={{
                                    ...styles.chip,
                                    ...(category === item
                                        ? styles.chipActive
                                        : {}),
                                }}
                            >
                                {categoryLabels[item]}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section id="products" style={styles.section}>
                <div style={styles.container}>
                    <div style={styles.sectionHead}>
                        <div>
                            <span style={styles.eyebrow}>
                                Bộ sưu tập nổi bật
                            </span>
                            <h2 style={styles.sectionTitle}>
                                Danh sách sản phẩm có giá trị thật
                            </h2>
                        </div>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm tên sản phẩm..."
                            style={styles.searchInput}
                        />
                    </div>

                    <div
                        style={{
                            ...styles.productGrid,
                            gridTemplateColumns: `repeat(${isMobile ? 2 : 5}, minmax(0, 1fr))`,
                        }}
                    >
                        {visibleProducts.map((product) => (
                            <article key={product.id} style={styles.card}>
                                <div
                                    style={{
                                        ...styles.productImage,
                                        backgroundImage: `url(${product.image})`,
                                    }}
                                />
                                <div style={styles.cardHead}>
                                    <h3 style={styles.productName}>
                                        {product.name}
                                    </h3>
                                    <span style={styles.price}>
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                                <p style={styles.desc}>{product.description}</p>
                                <div style={styles.metaRow}>
                                    <span>Năm: {product.year}</span>
                                    <span>Xuất xứ: {product.origin}</span>
                                </div>
                                <div style={styles.actionsMini}>
                                    <button
                                        onClick={() => addToCart(product.id)}
                                        style={styles.buyBtn}
                                    >
                                        Thêm vào giỏ
                                    </button>
                                    <button
                                        onClick={() =>
                                            setSelectedProduct(product)
                                        }
                                        style={styles.detailBtn}
                                    >
                                        Chi tiết
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="cart" style={styles.section}>
                <div style={styles.container}>
                    <div style={styles.cartWrap}>
                        <div>
                            <span style={styles.eyebrow}>Giỏ hàng mẫu</span>
                            <h2 style={styles.sectionTitle}>Thanh toán demo</h2>
                            <p style={styles.heroDesc}>
                                Bạn có thể thêm sản phẩm, điều chỉnh số lượng và
                                điền form thanh toán để gửi đơn mẫu.
                            </p>
                        </div>

                        <div style={styles.checkoutCard}>
                            {cartItems.length === 0 ? (
                                <p style={{ color: "#667085", margin: 0 }}>
                                    Giỏ hàng đang trống.
                                </p>
                            ) : (
                                <div>
                                    {cartItems.map((item) => (
                                        <div
                                            key={item.id}
                                            style={styles.cartItem}
                                        >
                                            <div>
                                                <strong>{item.name}</strong>
                                                <div
                                                    style={{
                                                        color: "#667085",
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    Số lượng: {cart[item.id]}
                                                </div>
                                            </div>
                                            <div style={styles.qtyWrap}>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            -1,
                                                        )
                                                    }
                                                    style={styles.qtyBtn}
                                                >
                                                    -
                                                </button>
                                                <span>{cart[item.id]}</span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            1,
                                                        )
                                                    }
                                                    style={styles.qtyBtn}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div>
                                                {formatPrice(
                                                    item.price *
                                                        (cart[item.id] ?? 0),
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div style={styles.totalRow}>
                                        <span>Tổng tiền</span>
                                        <strong>{formatPrice(total)}</strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.checkoutFormCard}>
                        <h3>Form thanh toán đầy đủ</h3>
                        <div style={styles.formGrid}>
                            <input
                                placeholder="Họ tên"
                                value={checkout.name}
                                onChange={(e) =>
                                    setCheckout((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                style={styles.input}
                            />
                            <input
                                placeholder="Số điện thoại"
                                value={checkout.phone}
                                onChange={(e) =>
                                    setCheckout((prev) => ({
                                        ...prev,
                                        phone: e.target.value,
                                    }))
                                }
                                style={styles.input}
                            />
                            <textarea
                                placeholder="Địa chỉ giao hàng"
                                value={checkout.address}
                                onChange={(e) =>
                                    setCheckout((prev) => ({
                                        ...prev,
                                        address: e.target.value,
                                    }))
                                }
                                style={{
                                    ...styles.input,
                                    minHeight: 100,
                                    resize: "vertical",
                                }}
                            />
                            <select
                                value={checkout.paymentMethod}
                                onChange={(e) =>
                                    setCheckout((prev) => ({
                                        ...prev,
                                        paymentMethod: e.target.value,
                                    }))
                                }
                                style={styles.input}
                            >
                                <option value="cod">
                                    Thanh toán khi nhận hàng
                                </option>
                                <option value="bank">
                                    Chuyển khoản ngân hàng
                                </option>
                                <option value="momo">Ví MoMo</option>
                            </select>
                        </div>
                        <div style={styles.formActions}>
                            <button
                                onClick={submitOrder}
                                style={styles.buyBtn}
                                disabled={loading || cartItems.length === 0}
                            >
                                {loading
                                    ? "Đang xử lý..."
                                    : "Xác nhận thanh toán mẫu"}
                            </button>
                        </div>
                        {orderMessage ? (
                            <div style={styles.successBlock}>
                                <p style={styles.successText}>{orderMessage}</p>
                                {paymentLink ? (
                                    <a
                                        href={paymentLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={styles.paymentLink}
                                    >
                                        Đi tới cổng thanh toán mẫu
                                    </a>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            <section id="contact" style={styles.section}>
                <div style={styles.container}>
                    <div style={styles.contactBox}>
                        <div>
                            <span style={styles.eyebrow}>Liên hệ</span>
                            <h2 style={styles.sectionTitle}>
                                Bạn muốn một storefront bán hàng sưu tầm thật sự
                                chuyên nghiệp?
                            </h2>
                        </div>
                        <a
                            href="mailto:hello@suutapsg.com"
                            style={styles.primaryBtn}
                        >
                            hello@suutapsg.com
                        </a>
                    </div>
                </div>
            </section>

            {selectedProduct ? (
                <div
                    style={styles.modalOverlay}
                    onClick={() => setSelectedProduct(null)}
                >
                    <div
                        style={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            style={styles.closeBtn}
                            onClick={() => setSelectedProduct(null)}
                        >
                            ×
                        </button>
                        <div
                            style={{
                                ...styles.productImage,
                                backgroundImage: `url(${selectedProduct.image})`,
                            }}
                        />
                        <h3>{selectedProduct.name}</h3>
                        <p style={styles.desc}>{selectedProduct.description}</p>
                        <div style={styles.metaRow}>
                            <span>
                                Loại: {categoryLabels[selectedProduct.category]}
                            </span>
                            <span>Năm: {selectedProduct.year}</span>
                        </div>
                        <div style={styles.metaRow}>
                            <span>Xuất xứ: {selectedProduct.origin}</span>
                            <span>Chất lượng: {selectedProduct.quality}</span>
                        </div>
                        <div style={styles.metaRow}>
                            <span>
                                {selectedProduct.featured
                                    ? "Sản phẩm nổi bật"
                                    : "Bộ sưu tập thường"}
                            </span>
                            <span>
                                Giá: {formatPrice(selectedProduct.price)}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                addToCart(selectedProduct.id);
                                setSelectedProduct(null);
                            }}
                            style={styles.buyBtn}
                        >
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
            ) : null}

            {authMode ? (
                <div style={styles.modalOverlay} onClick={closeAuthModal}>
                    <form
                        style={styles.authModal}
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={submitAuthForm}
                    >
                        <button
                            type="button"
                            style={styles.closeBtn}
                            onClick={closeAuthModal}
                        >
                            ×
                        </button>
                        <h3 style={{ margin: "0 0 4px" }}>
                            {authMode === "register"
                                ? "Đăng ký tài khoản"
                                : "Đăng nhập"}
                        </h3>
                        <p style={styles.authSubtext}>
                            Vui lòng điền thông tin và xác thực CAPTCHA.
                        </p>

                        <div style={styles.authGrid}>
                            {authMode === "register" ? (
                                <input
                                    placeholder="Họ và tên"
                                    value={authForm.name}
                                    onChange={(e) =>
                                        setAuthForm((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    style={styles.authInput}
                                />
                            ) : null}
                            <input
                                placeholder="Email"
                                value={authForm.email}
                                onChange={(e) =>
                                    setAuthForm((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                style={styles.authInput}
                            />
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={authForm.password}
                                onChange={(e) =>
                                    setAuthForm((prev) => ({
                                        ...prev,
                                        password: e.target.value,
                                    }))
                                }
                                style={styles.authInput}
                            />
                            {authMode === "register" ? (
                                <input
                                    type="password"
                                    placeholder="Xác nhận mật khẩu"
                                    value={authForm.confirmPassword}
                                    onChange={(e) =>
                                        setAuthForm((prev) => ({
                                            ...prev,
                                            confirmPassword: e.target.value,
                                        }))
                                    }
                                    style={styles.authInput}
                                />
                            ) : null}
                            <div style={styles.captchaRow}>
                                <span style={styles.captchaBox}>
                                    CAPTCHA: {captchaQuestion}
                                </span>
                                <button
                                    type="button"
                                    style={styles.captchaRefreshBtn}
                                    onClick={createCaptcha}
                                >
                                    Đổi mã
                                </button>
                            </div>
                            <input
                                placeholder="Nhập kết quả CAPTCHA"
                                value={authForm.captchaInput}
                                onChange={(e) =>
                                    setAuthForm((prev) => ({
                                        ...prev,
                                        captchaInput: e.target.value,
                                    }))
                                }
                                style={styles.authInput}
                            />
                        </div>

                        {authMessage ? (
                            <p style={styles.authMessage}>{authMessage}</p>
                        ) : null}

                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <button type="submit" style={styles.loginBtn}>
                                {authMode === "register"
                                    ? "Hoàn tất đăng ký"
                                    : "Đăng nhập"}
                            </button>
                            <button
                                type="button"
                                style={styles.registerBtn}
                                onClick={closeAuthModal}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            {profileModalOpen ? (
                <div style={styles.modalOverlay} onClick={closeProfileModal}>
                    <form
                        style={styles.authModal}
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={saveProfile}
                    >
                        <button
                            type="button"
                            style={styles.closeBtn}
                            onClick={closeProfileModal}
                        >
                            ×
                        </button>
                        <h3 style={{ margin: "0 0 4px" }}>Tùy chỉnh profile</h3>
                        <p style={styles.authSubtext}>
                            Cập nhật avatar, email, địa chỉ và số điện thoại.
                        </p>

                        <div style={styles.authGrid}>
                            <div style={styles.avatarUploadRow}>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarFileChange}
                                    style={styles.hiddenFileInput}
                                />
                                <button
                                    type="button"
                                    style={styles.uploadAvatarBtn}
                                    onClick={() =>
                                        avatarInputRef.current?.click()
                                    }
                                >
                                    Chọn ảnh avatar từ máy
                                </button>
                                {profileForm.avatarUrl ? (
                                    <img
                                        src={profileForm.avatarUrl}
                                        alt="Xem trước avatar"
                                        style={styles.avatarPreviewInForm}
                                    />
                                ) : null}
                            </div>
                            <input
                                placeholder="Email"
                                value={profileForm.email}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                style={styles.authInput}
                            />
                            <input
                                placeholder="Số điện thoại"
                                value={profileForm.phone}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        phone: e.target.value,
                                    }))
                                }
                                style={styles.authInput}
                            />
                            <textarea
                                placeholder="Địa chỉ"
                                value={profileForm.address}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        address: e.target.value,
                                    }))
                                }
                                style={{
                                    ...styles.authInput,
                                    minHeight: 84,
                                    resize: "vertical",
                                }}
                            />
                        </div>

                        {userProfile.role === "admin" ? (
                            <div style={styles.systemBox}>
                                <div style={styles.systemTitle}>
                                    Tùy chỉnh hệ thống (Admin)
                                </div>
                                <div style={styles.systemLinks}>
                                    <Link
                                        href="/admin"
                                        style={styles.registerBtn}
                                    >
                                        Mở Admin Dashboard
                                    </Link>
                                    <Link
                                        href="/admin/frontend"
                                        style={styles.loginBtn}
                                    >
                                        Mở Admin Frontend
                                    </Link>
                                </div>
                            </div>
                        ) : null}

                        {profileMessage ? (
                            <p style={styles.authMessage}>{profileMessage}</p>
                        ) : null}

                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <button type="submit" style={styles.loginBtn}>
                                Lưu profile
                            </button>
                            <button
                                type="button"
                                style={styles.registerBtn}
                                onClick={closeProfileModal}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}
        </main>
    );
}

const styles: Record<string, CSSProperties> = {
    topbar: {
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "rgba(255, 252, 247, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(185, 111, 54, 0.15)",
    },
    container: {
        width: "min(1120px, calc(100% - 32px))",
        margin: "0 auto",
    },
    topbarRow: {
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
    },
    brandBlock: {
        display: "flex",
        alignItems: "center",
        justifySelf: "start",
        minWidth: 0,
    },
    brandRow: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 10px",
        borderRadius: 14,
        background: "rgba(185, 111, 54, 0.06)",
    },
    brandIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        display: "grid",
        placeItems: "center",
        color: "#fff",
        background: "linear-gradient(135deg, #b96f36, #d8a06d)",
        fontWeight: 800,
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: 800,
    },
    brandSub: {
        fontSize: 12,
        color: "#667085",
    },
    navBlock: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 12px",
        borderRadius: 999,
        background: "rgba(255, 255, 255, 0.74)",
        border: "1px solid rgba(185, 111, 54, 0.16)",
    },
    menu: {
        display: "flex",
        gap: 18,
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: 800,
        fontSize: 15,
    },
    hotline: {
        color: "#8d4f1f",
        fontWeight: 900,
        fontSize: 14,
        textAlign: "right",
    },
    accountBlock: {
        justifySelf: "end",
        display: "grid",
        gap: 8,
        justifyItems: "end",
    },
    authActions: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "flex-end",
    },
    registerBtn: {
        border: "1px solid #d6a173",
        background: "#fffaf2",
        color: "#8d4f1f",
        borderRadius: 999,
        padding: "8px 14px",
        fontWeight: 700,
        cursor: "pointer",
    },
    loginBtn: {
        border: "none",
        background: "#b96f36",
        color: "#fff",
        borderRadius: 999,
        padding: "8px 14px",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 8px 18px rgba(185,111,54,0.24)",
    },
    userBadge: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "3px 8px 3px 3px",
        borderRadius: 999,
        border: "1px solid #eadbc6",
        background: "#fff",
        cursor: "pointer",
        textAlign: "left",
        appearance: "none",
    },
    avatarWrap: {
        position: "relative",
        width: 34,
        height: 34,
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: 12,
        color: "#fff",
        background: "linear-gradient(135deg, #7b4b27, #c38346)",
    },
    avatarImage: {
        width: 34,
        height: 34,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid #e6d5bf",
        display: "block",
    },
    onlineDot: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "#16a34a",
        border: "2px solid #fff",
        boxShadow: "0 0 0 3px rgba(22,163,74,0.18)",
    },
    userLabel: {
        fontWeight: 700,
        color: "#59422f",
        fontSize: 13,
    },
    authModal: {
        position: "relative",
        width: "min(460px, 100%)",
        background: "#fffdf9",
        borderRadius: 20,
        padding: 20,
        boxShadow: "0 18px 48px rgba(0,0,0,0.3)",
        border: "1px solid #eadbc6",
    },
    authSubtext: {
        margin: "0 0 14px",
        color: "#6b5a46",
        fontSize: 14,
    },
    authGrid: {
        display: "grid",
        gap: 10,
    },
    avatarUploadRow: {
        display: "grid",
        gap: 10,
    },
    hiddenFileInput: {
        display: "none",
    },
    uploadAvatarBtn: {
        border: "1px solid #d6a173",
        background: "#fffaf2",
        color: "#8d4f1f",
        borderRadius: 12,
        padding: "11px 12px",
        fontWeight: 700,
        cursor: "pointer",
        textAlign: "left",
    },
    avatarPreviewInForm: {
        width: 72,
        height: 72,
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid #e6d5bf",
    },
    authInput: {
        width: "100%",
        border: "1px solid #eadbc6",
        borderRadius: 12,
        padding: "11px 12px",
        fontSize: 14,
    },
    captchaRow: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
    },
    captchaBox: {
        padding: "8px 10px",
        borderRadius: 10,
        background: "#f6ede2",
        border: "1px dashed #d6b48b",
        fontWeight: 700,
        color: "#6e4b2e",
        fontSize: 13,
    },
    captchaRefreshBtn: {
        border: "1px solid #d6a173",
        background: "#fffaf2",
        color: "#8d4f1f",
        borderRadius: 10,
        padding: "8px 10px",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 13,
    },
    authMessage: {
        margin: "10px 0 0",
        color: "#8d4f1f",
        fontWeight: 700,
        fontSize: 14,
    },
    systemBox: {
        marginTop: 14,
        padding: 12,
        borderRadius: 12,
        border: "1px solid #e7d4ba",
        background: "#fff8ee",
    },
    systemTitle: {
        fontWeight: 800,
        color: "#6f4b2b",
        marginBottom: 8,
    },
    systemLinks: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
    },
    hero: {
        padding: "60px 0 32px",
    },
    heroGrid: {
        display: "grid",
        gridTemplateColumns: "1.15fr 0.85fr",
        gap: 24,
        alignItems: "center",
    },
    eyebrow: {
        display: "inline-block",
        borderRadius: 999,
        padding: "6px 10px",
        background: "#f7e9dc",
        color: "#8d4f1f",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 12,
    },
    heroTitle: {
        margin: "0 0 12px",
        fontSize: "clamp(2rem, 4vw, 3.4rem)",
        lineHeight: 1.15,
    },
    heroDesc: {
        margin: 0,
        color: "#667085",
        lineHeight: 1.7,
    },
    actions: {
        display: "flex",
        gap: 12,
        marginTop: 20,
        flexWrap: "wrap",
    },
    primaryBtn: {
        background: "#b96f36",
        color: "#fff",
        borderRadius: 999,
        padding: "12px 18px",
        fontWeight: 700,
        boxShadow: "0 10px 25px rgba(185,111,54,0.24)",
    },
    secondaryBtn: {
        color: "#8d4f1f",
        border: "1px solid #b96f36",
        borderRadius: 999,
        padding: "12px 18px",
        fontWeight: 700,
    },
    heroCard: {
        display: "grid",
        gap: 14,
    },
    statBox: {
        background: "#fffdf9",
        border: "1px solid #eadbc6",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 16px 40px rgba(67, 40, 20, 0.12)",
        fontWeight: 800,
    },
    featureBox: {
        background: "#fffdf9",
        border: "1px solid #eadbc6",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 16px 40px rgba(67, 40, 20, 0.12)",
    },
    filters: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
    },
    chip: {
        border: "1px solid #eadbc6",
        background: "#fff",
        color: "#1f2937",
        borderRadius: 999,
        padding: "10px 14px",
        cursor: "pointer",
        fontWeight: 700,
    },
    chipActive: {
        background: "#b96f36",
        color: "#fff",
        borderColor: "#b96f36",
    },
    section: {
        padding: "42px 0",
    },
    sectionHead: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 20,
        flexWrap: "wrap",
    },
    sectionTitle: {
        margin: "0 0 4px",
        fontSize: "2rem",
    },
    searchInput: {
        minWidth: 280,
        padding: "12px 16px",
        borderRadius: 999,
        border: "1px solid #eadbc6",
    },
    productGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 20,
    },
    card: {
        background: "#fffdf9",
        border: "1px solid #eadbc6",
        borderRadius: 22,
        padding: 16,
        boxShadow: "0 16px 40px rgba(67, 40, 20, 0.12)",
    },
    productImage: {
        height: 190,
        borderRadius: 16,
        backgroundSize: "cover",
        backgroundPosition: "center",
        marginBottom: 14,
    },
    cardHead: {
        display: "grid",
        gap: 6,
    },
    productName: {
        margin: 0,
        fontSize: 18,
        textAlign: "center",
        lineHeight: 1.4,
        minHeight: "2.8em",
        maxHeight: "2.8em",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
    },
    price: {
        display: "block",
        color: "#8d4f1f",
        fontWeight: 800,
        textAlign: "right",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    desc: {
        color: "#667085",
        textAlign: "left",
        lineHeight: 1.55,
        minHeight: "7.75em",
        maxHeight: "7.75em",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 5,
        WebkitBoxOrient: "vertical",
    },
    metaRow: {
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
        color: "#667085",
        fontSize: 14,
        margin: "4px 0 12px",
    },
    actionsMini: {
        display: "grid",
        gap: 8,
    },
    buyBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        background: "#b96f36",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 12,
        cursor: "pointer",
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    detailBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        background: "#f3ebe0",
        color: "#8d4f1f",
        padding: "10px 14px",
        borderRadius: 12,
        cursor: "pointer",
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    cartWrap: {
        display: "grid",
        gridTemplateColumns: "1fr 0.9fr",
        gap: 24,
    },
    checkoutCard: {
        background: "#fffdf9",
        border: "1px solid #eadbc6",
        borderRadius: 22,
        padding: 20,
        boxShadow: "0 16px 40px rgba(67, 40, 20, 0.12)",
    },
    cartItem: {
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: 12,
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #f2e7d9",
    },
    qtyWrap: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        border: "none",
        background: "#f5e9db",
        cursor: "pointer",
        fontWeight: 700,
    },
    totalRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
        paddingTop: 12,
        borderTop: "1px solid #f2e7d9",
        fontWeight: 700,
    },
    checkoutFormCard: {
        marginTop: 24,
        background: "#fffdf9",
        border: "1px solid #eadbc6",
        borderRadius: 22,
        padding: 24,
        boxShadow: "0 16px 40px rgba(67, 40, 20, 0.12)",
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 14,
    },
    input: {
        width: "100%",
        border: "1px solid #eadbc6",
        borderRadius: 14,
        padding: "12px 14px",
    },
    formActions: {
        marginTop: 16,
    },
    successBlock: {
        marginTop: 12,
        padding: 12,
        borderRadius: 14,
        background: "#f6fbf7",
        border: "1px solid #cce9d6",
    },
    successText: {
        margin: 0,
        color: "#1d7a4b",
        fontWeight: 700,
    },
    paymentLink: {
        display: "inline-block",
        marginTop: 10,
        color: "#8d4f1f",
        fontWeight: 700,
        textDecoration: "underline",
    },
    contactBox: {
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        alignItems: "center",
        background: "#fffdf9",
        border: "1px solid #eadbc6",
        borderRadius: 22,
        padding: 24,
        boxShadow: "0 16px 40px rgba(67, 40, 20, 0.12)",
    },
    modalOverlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 50,
    },
    modal: {
        position: "relative",
        width: "min(600px, 100%)",
        background: "#fffdf9",
        borderRadius: 20,
        padding: 20,
        boxShadow: "0 18px 48px rgba(0,0,0,0.3)",
    },
    closeBtn: {
        position: "absolute",
        right: 12,
        top: 10,
        border: "none",
        background: "transparent",
        fontSize: 28,
        cursor: "pointer",
    },
};
