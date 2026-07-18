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

type Language = "vi" | "en";

type FrontendSettings = {
    brandName: string;
    heroTitle: string;
    heroDescription: string;
    hotline: string;
    primaryColor: string;
    accentColor: string;
    paymentQrUrl: string;
    bankQrUrl: string;
    momoQrUrl: string;
    showHotline: boolean;
    showHeroStats: boolean;
};

type AuthMode = "login" | "register";
type UserRole = "admin" | "user";

const USD_EXCHANGE_RATE = 25000;

const formatPrice = (value: number, language: Language, usdRate: number) =>
    language === "en"
        ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }).format(value / usdRate)
        : `${value.toLocaleString("vi-VN")}đ`;

const categoryLabelsByLanguage = {
    vi: {
        all: "Tất cả",
        tem: "Tem thư Việt Nam",
        "buu-anh": "Bưu ảnh Indochine",
        niem: "Niêm - Giấy tờ xưa",
    },
    en: {
        all: "All",
        tem: "Vietnam stamps",
        "buu-anh": "Indochine postcards",
        niem: "Vintage papers",
    },
} as const;

const defaultFrontendSettings: FrontendSettings = {
    brandName: "SuutapSG",
    heroTitle: "Storefront chuyên nghiệp cho tem thư, bưu ảnh và niêm giấy xưa",
    heroDescription:
        "Trang này được nâng cấp thành storefront hoàn chỉnh với dữ liệu thực, giỏ hàng và form thanh toán mẫu, áp dụng mô hình Next.js hiện đại.",
    hotline: "0900 123 456",
    primaryColor: "#b96f36",
    accentColor: "#84512b",
    paymentQrUrl: "",
    bankQrUrl: "",
    momoQrUrl: "",
    showHotline: true,
    showHeroStats: true,
};

const authStorageKey = "storefront_auth_email";
const SURVEY_FORM_ENDPOINT =
    process.env.NEXT_PUBLIC_SURVEY_FORM_ENDPOINT || "";

export default function HomePage() {
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const [language, setLanguage] = useState<Language>("vi");
    const [isMobile, setIsMobile] = useState(false);
    const [usdRate, setUsdRate] = useState(USD_EXCHANGE_RATE);
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<"all" | Product["category"]>(
        "all",
    );
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<Record<number, number>>({});
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [checkout, setCheckout] = useState({
        name: "",
        phone: "",
        address: "",
        paymentMethod: "cod",
    });
    const [showCheckout, setShowCheckout] = useState(false);
    const [showContactPage, setShowContactPage] = useState(false);
    const [showStorePage, setShowStorePage] = useState(false);
    const [contactForm, setContactForm] = useState({
        email: "",
        content: "",
    });
    const [contactFormError, setContactFormError] = useState("");
    const [surveyForm, setSurveyForm] = useState({
        name: "",
        phone: "",
        category: "",
        era: "",
        budget: "",
        other: "",
    });
    const [surveyError, setSurveyError] = useState("");
    const [surveySubmitting, setSurveySubmitting] = useState(false);
    const [surveySubmitted, setSurveySubmitted] = useState(false);
    const [orderMessage, setOrderMessage] = useState("");
    const [paymentLink, setPaymentLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [cartNotice, setCartNotice] = useState("");
    const [frontendSettings, setFrontendSettings] = useState<FrontendSettings>(
        defaultFrontendSettings,
    );
    const [authMode, setAuthMode] = useState<AuthMode | null>(null);
    const uiTexts = {
        vi: {
            navHome: "Trang chủ",
            navCollection: "Cửa hàng",
            navContact: "Liên hệ",
            cartAria: (count: number) => `Giỏ hàng có ${count} sản phẩm`,
            switchLanguage: "EN",
            heroEyebrow: "Tem thư Việt Nam & đồ sưu tầm cổ",
            heroTitle:
                "Storefront chuyên nghiệp cho tem thư, bưu ảnh và niêm giấy xưa",
            heroDescription:
                "Trang này được nâng cấp thành storefront hoàn chỉnh với dữ liệu thực, giỏ hàng và form thanh toán mẫu, áp dụng mô hình Next.js hiện đại.",
            heroPrimary: "Xem bộ sưu tập",
            heroSecondary: "Chốt đơn ngay",
            heroFeatures: [
                "Danh mục có giá trị thật và dễ mở rộng",
                "Giỏ hàng và thanh toán mẫu hoàn chỉnh",
                "Modal chi tiết sản phẩm hiện đại",
            ],
            collectionEyebrow: "Bộ sưu tập nổi bật",
            collectionTitle: "Danh sách vật phẩm",
            searchPlaceholder: "Tìm tên sản phẩm...",
            addToCart: "Thêm vào giỏ",
            cartSectionEyebrow: "Giỏ hàng mẫu",
            cartSectionTitle: "Thanh toán",
            cartSectionDescription:
                "Bạn có thể thêm sản phẩm, điều chỉnh số lượng và điền form thanh toán để gửi đơn mẫu.",
            cartEmpty: "Giỏ hàng đang trống.",
            backHome: "Quay về Trang chủ",
            totalLabel: "Tổng tiền",
            checkoutSubmit: "Xác nhận thanh toán mẫu",
            checkoutTitle: "Form thanh toán đầy đủ",
            checkoutNamePlaceholder: "Họ tên",
            checkoutPhonePlaceholder: "Số điện thoại",
            checkoutAddressPlaceholder: "Địa chỉ giao hàng",
            paymentCod: "Thanh toán đơn hàng",
            paymentBank: "Chuyển khoản ngân hàng",
            paymentMomo: "Ví MoMo",
            paymentProcessing: "Đang xử lý...",
            paymentLink: "Đi tới cổng thanh toán mẫu",
            contactEyebrow: "Liên hệ",
            contactTitle: "Bạn cần tôi tư vấn về vật phẩm nào?",
            contactPageHint: "Vui lòng nhập email và nội dung cần tư vấn.",
            contactEmailPlaceholder: "Email của bạn",
            contactContentPlaceholder: "Nội dung cần tư vấn...",
            contactSend: "Gửi email",
            contactEmailInvalid: "Vui lòng nhập email hợp lệ.",
            contactContentRequired: "Vui lòng nhập nội dung cần tư vấn.",
            surveyCta: "Khảo sát nhu cầu sưu tập",
            surveyTitle: "Khảo sát nhu cầu sưu tập",
            surveyHint:
                "Vui lòng cho mình biết một chút thông tin để tư vấn đúng vật phẩm bạn cần.",
            surveyNameLabel: "Họ và tên của bạn là gì thế ạ?",
            surveyPhoneLabel:
                "Messenger hoặc Zalo nào tiện nhất để mình gửi thông tin cho bạn?",
            surveyCategoryLabel:
                "Bạn đang quan tâm hoặc sưu tập chính dòng sản phẩm nào? (Gợi ý: Tem thư, Bưu ảnh, Niêm - giấy tờ xưa, Xu cổ...)",
            surveyEraLabel:
                "Bạn thường tìm kiếm những món đồ thuộc giai đoạn lịch sử nào, hoặc có tiêu chí đặc biệt nào không (ví dụ: độ hiếm, tình trạng nguyên vẹn...)?",
            surveyBudgetLabel:
                "Khoảng giá hoặc ngân sách trung bình bạn sẵn sàng đầu tư cho một món đồ sưu tập ưng ý là bao nhiêu?",
            surveyOtherLabel: "Bạn có ý kiến hoặc yêu cầu nào khác không?",
            surveySubmit: "Gửi khảo sát",
            surveyNameRequired: "Vui lòng cho mình biết tên của bạn.",
            surveyPhoneRequired: "Vui lòng nhập số điện thoại hoặc Zalo.",
            surveySubmitFail:
                "Không gửi được khảo sát. Vui lòng thử lại sau.",
            surveySuccess: "Cảm ơn bạn! Mình đã nhận được thông tin.",
            surveyNotConfigured:
                "Form khảo sát chưa được cấu hình. Vui lòng liên hệ quản trị viên.",
            detailLabel: "Mô tả sản phẩm",
            typeLabel: "Loại",
            yearLabel: "Năm",
            originLabel: "Xuất xứ",
            qualityLabel: "Chất lượng",
            priceLabel: "Giá",
            featuredLabel: "Sản phẩm nổi bật",
            regularLabel: "Bộ sưu tập thường",
            authLoginTitle: "Đăng nhập",
            authRegisterTitle: "Đăng ký tài khoản",
            authInstruction: "Vui lòng điền thông tin và xác thực CAPTCHA.",
            authLoginSubmit: "Đăng nhập",
            authRegisterSubmit: "Hoàn tất đăng ký",
            authCancel: "Hủy",
            authNameLabel: "Họ tên",
            authNamePlaceholder: "Nhập họ tên của bạn",
            authEmailLabel: "Email",
            authEmailPlaceholder: "Nhập địa chỉ email",
            authPasswordLabel: "Mật khẩu",
            authPasswordPlaceholder: "Nhập mật khẩu",
            authConfirmPasswordLabel: "Xác nhận mật khẩu",
            authConfirmPasswordPlaceholder: "Nhập lại mật khẩu",
            authCaptchaPlaceholder: "Nhập kết quả phép tính",
            authPromptPrefix: "Bạn vui lòng",
            authPromptLink: "Đăng ký",
            authPromptSuffix: "nếu chưa có Tài khoản",
            captchaLabel: "CAPTCHA",
            captchaChange: "Đổi mã",
            registerSuccess: "Đăng ký thành công. Bạn đã được đăng nhập.",
            loginSuccess: "Đăng nhập thành công.",
            emailInvalid: "Email không hợp lệ.",
            passwordTooShort: "Mật khẩu cần tối thiểu 6 ký tự.",
            enterNameToRegister: "Vui lòng nhập họ tên để đăng ký.",
            confirmPasswordMismatch: "Mật khẩu xác nhận chưa khớp.",
            captchaIncorrect: "CAPTCHA chưa đúng. Vui lòng thử lại.",
            saveProfileFail: "Không thể lưu profile đăng nhập lên hệ thống.",
            profileSaveFail: "Không lưu được profile lên hệ thống.",
            profileSaved: "Đã cập nhật profile và lưu vào hệ thống.",
            profileEmailInvalid: "Email profile không hợp lệ.",
            profileEmailRequired: "Vui lòng nhập email để lưu profile.",
            profileAvatarInvalid: "Vui lòng chọn tệp ảnh hợp lệ.",
            profileAvatarLoadFail: "Không đọc được tệp ảnh. Vui lòng thử lại.",
            profileAvatarLoaded:
                "Đã tải ảnh avatar. Bấm Lưu profile để áp dụng.",
            cartNotice: "Đã cập nhật sản phẩm vào Giỏ hàng",
            profileTitle: "Tùy chỉnh profile",
            profileDescription:
                "Cập nhật avatar, email, địa chỉ và số điện thoại.",
            profileDisplayNameLabel: "Tên hiển thị",
            profileDisplayNamePlaceholder: "Nhập tên hiển thị",
            profileInitialsLabel: "Chữ viết tắt",
            profileInitialsPlaceholder: "Ví dụ: SG (2-3 ký tự)",
            profileAvatarLabel: "Ảnh đại diện",
            profileAvatarButton: "Tải ảnh đại diện",
            profileAvatarAlt: "Ảnh đại diện người dùng",
            profileEmailLabel: "Email",
            profileEmailPlaceholder: "Nhập địa chỉ email",
            profilePhoneLabel: "Số điện thoại",
            profilePhonePlaceholder: "Nhập số điện thoại",
            profileAddressLabel: "Địa chỉ",
            profileAddressPlaceholder: "Nhập địa chỉ giao hàng",
            profileCurrentPasswordLabel: "Mật khẩu hiện tại",
            profileCurrentPasswordPlaceholder: "Nhập mật khẩu hiện tại",
            profileNewPasswordLabel: "Mật khẩu mới",
            profileNewPasswordPlaceholder: "Nhập mật khẩu mới",
            profileConfirmNewPasswordLabel: "Xác nhận mật khẩu mới",
            profileConfirmNewPasswordPlaceholder: "Nhập lại mật khẩu mới",
            profileChangePasswordTitle: "Đổi mật khẩu",
            profileCurrentPasswordRequired:
                "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu.",
            profilePasswordChanged: "Đổi mật khẩu thành công.",
            loginPasswordIncorrect: "Email hoặc mật khẩu không đúng.",
            passwordSaveFail: "Không thể lưu mật khẩu cho tài khoản.",
            profileAdminTitle: "Tùy chỉnh hệ thống (Admin)",
            profileDashboard: "Mở Admin Dashboard",
            profileFrontend: "Mở Admin Frontend",
            profileSave: "Lưu profile",
            avatarMenuEditProfile: "Tuỳ chỉnh Thông tin",
            avatarMenuChangePassword: "Thay đổi Mật khẩu",
            avatarMenuLogout: "Đăng xuất",
            orderCreated: "Đơn hàng đã được tạo.",
            orderNext: "Bước tiếp theo: thanh toán online mẫu.",
            orderComplete: "Đặt hàng thành công!",
            orderClickLink:
                "Vui lòng bấm vào liên kết thanh toán mẫu để hoàn tất.",
            orderError: "Có lỗi xảy ra",
        },
        en: {
            navHome: "Home",
            navCollection: "Store",
            navContact: "Contact",
            cartAria: (count: number) => `Cart has ${count} products`,
            switchLanguage: "VI",
            heroEyebrow: "Vietnam postage & vintage collectibles",
            heroTitle:
                "Professional storefront for Vietnamese stamps, Indochine postcards and vintage paper goods",
            heroDescription:
                "This page has been upgraded into a complete storefront with real data, cart and sample checkout form, built with a modern Next.js setup.",
            heroPrimary: "View collection",
            heroSecondary: "Checkout now",
            heroFeatures: [
                "Catalog with real value and easy to expand",
                "Full cart and sample checkout",
                "Modern product detail modal",
            ],
            collectionEyebrow: "Featured collection",
            collectionTitle: "A catalog of collectible value",
            searchPlaceholder: "Search products...",
            addToCart: "Add to cart",
            cartSectionEyebrow: "Sample cart",
            cartSectionTitle: "Checkout",
            cartSectionDescription:
                "You can add products, adjust quantities and fill the checkout form to submit a demo order.",
            cartEmpty: "Your cart is empty.",
            backHome: "Back to Home",
            totalLabel: "Total",
            checkoutSubmit: "Confirm demo checkout",
            checkoutTitle: "Complete checkout form",
            checkoutNamePlaceholder: "Full name",
            checkoutPhonePlaceholder: "Phone number",
            checkoutAddressPlaceholder: "Shipping address",
            paymentCod: "Order payment",
            paymentBank: "Bank transfer",
            paymentMomo: "MoMo wallet",
            paymentProcessing: "Processing...",
            paymentLink: "Go to sample payment gateway",
            contactEyebrow: "Contact",
            contactTitle:
                "Looking for a truly professional collectibles storefront?",
            contactPageHint: "Please provide your email and your request.",
            contactEmailPlaceholder: "Your email",
            contactContentPlaceholder: "Your message...",
            contactSend: "Send email",
            contactEmailInvalid: "Please enter a valid email.",
            contactContentRequired: "Please enter your message.",
            surveyCta: "Collector interest survey",
            surveyTitle: "Collector interest survey",
            surveyHint:
                "Tell us a bit about what you're looking for so we can help you find the right piece.",
            surveyNameLabel: "What's your full name?",
            surveyPhoneLabel:
                "What Messenger or Zalo contact is best for sending you information?",
            surveyCategoryLabel:
                "Which product line are you mainly collecting or interested in? (e.g. Stamps, Postcards, Old documents, Coins...)",
            surveyEraLabel:
                "Which historical period do you usually look for, or do you have special criteria (e.g. rarity, mint condition...)?",
            surveyBudgetLabel:
                "What's your typical price range or budget for a piece you'd be happy to buy?",
            surveyOtherLabel: "Anything else you'd like to share or ask?",
            surveySubmit: "Submit survey",
            surveyNameRequired: "Please tell us your name.",
            surveyPhoneRequired: "Please enter a phone number or Zalo.",
            surveySubmitFail: "Couldn't submit the survey. Please try again.",
            surveySuccess: "Thank you! We've received your information.",
            surveyNotConfigured:
                "The survey form isn't configured yet. Please contact the site admin.",
            detailLabel: "Product description",
            typeLabel: "Type",
            yearLabel: "Year",
            originLabel: "Origin",
            qualityLabel: "Quality",
            priceLabel: "Price",
            featuredLabel: "Featured item",
            regularLabel: "Standard collection",
            authLoginTitle: "Sign in",
            authRegisterTitle: "Create account",
            authInstruction:
                "Please fill in the details and complete the CAPTCHA.",
            authLoginSubmit: "Sign in",
            authRegisterSubmit: "Complete registration",
            authCancel: "Cancel",
            authNameLabel: "Full name",
            authNamePlaceholder: "Enter your full name",
            authEmailLabel: "Email",
            authEmailPlaceholder: "Enter your email address",
            authPasswordLabel: "Password",
            authPasswordPlaceholder: "Enter your password",
            authConfirmPasswordLabel: "Confirm password",
            authConfirmPasswordPlaceholder: "Re-enter your password",
            authCaptchaPlaceholder: "Enter the answer",
            authPromptPrefix: "Please",
            authPromptLink: "Register",
            authPromptSuffix: "if you don't have an account",
            captchaLabel: "CAPTCHA",
            captchaChange: "Refresh",
            registerSuccess: "Registration successful. You are now signed in.",
            loginSuccess: "Sign in successful.",
            emailInvalid: "Invalid email.",
            passwordTooShort: "Password must be at least 6 characters.",
            enterNameToRegister: "Please enter your name to register.",
            confirmPasswordMismatch: "Confirmation password does not match.",
            captchaIncorrect: "CAPTCHA is incorrect. Please try again.",
            saveProfileFail: "Unable to save login profile.",
            profileSaveFail: "Unable to save profile to the system.",
            profileSaved: "Profile updated and saved.",
            profileEmailInvalid: "Invalid profile email.",
            profileEmailRequired: "Please enter an email to save the profile.",
            profileAvatarInvalid: "Please choose a valid image file.",
            profileAvatarLoadFail:
                "Unable to read the image file. Please try again.",
            profileAvatarLoaded:
                "Avatar uploaded. Press Save profile to apply it.",
            cartNotice: "Product updated in cart",
            profileTitle: "Profile settings",
            profileDescription:
                "Update avatar, email, address and phone number.",
            profileDisplayNameLabel: "Display name",
            profileDisplayNamePlaceholder: "Enter your display name",
            profileInitialsLabel: "Initials",
            profileInitialsPlaceholder: "E.g. SG (2-3 characters)",
            profileAvatarLabel: "Avatar",
            profileAvatarButton: "Upload avatar",
            profileAvatarAlt: "User avatar",
            profileEmailLabel: "Email",
            profileEmailPlaceholder: "Enter your email address",
            profilePhoneLabel: "Phone number",
            profilePhonePlaceholder: "Enter your phone number",
            profileAddressLabel: "Address",
            profileAddressPlaceholder: "Enter your shipping address",
            profileCurrentPasswordLabel: "Current password",
            profileCurrentPasswordPlaceholder: "Enter your current password",
            profileNewPasswordLabel: "New password",
            profileNewPasswordPlaceholder: "Enter a new password",
            profileConfirmNewPasswordLabel: "Confirm new password",
            profileConfirmNewPasswordPlaceholder: "Re-enter the new password",
            profileChangePasswordTitle: "Change password",
            profileCurrentPasswordRequired:
                "Please enter your current password to change password.",
            profilePasswordChanged: "Password changed successfully.",
            loginPasswordIncorrect: "Email or password is incorrect.",
            passwordSaveFail: "Unable to save password for this account.",
            profileAdminTitle: "System settings (Admin)",
            profileDashboard: "Open Admin Dashboard",
            profileFrontend: "Open Admin Frontend",
            profileSave: "Save profile",
            avatarMenuEditProfile: "Edit profile",
            avatarMenuChangePassword: "Change password",
            avatarMenuLogout: "Logout",
            orderCreated: "Order created.",
            orderNext: "Next step: sample online payment.",
            orderComplete: "Order placed successfully!",
            orderClickLink:
                "Please click the sample payment link to complete the order.",
            orderError: "Something went wrong",
        },
    } as const;

    const categoryLabelsByLanguage = {
        vi: {
            all: "Tất cả",
            tem: "Tem thư Việt Nam",
            "buu-anh": "Bưu ảnh Indochine",
            niem: "Niêm - Giấy tờ xưa",
        },
        en: {
            all: "All",
            tem: "Vietnam stamps",
            "buu-anh": "Indochine postcards",
            niem: "Vintage papers",
        },
    } as const;
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
    const [profileMode, setProfileMode] = useState<"info" | "password">("info");
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [profileForm, setProfileForm] = useState({
        displayName: "",
        initials: "",
        avatarUrl: "",
        email: "",
        phone: "",
        address: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const ui = uiTexts[language];
    const categoryLabels = categoryLabelsByLanguage[language];
    const formatLocalizedPrice = (value: number) =>
        formatPrice(value, language, usdRate);

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

    const verifyProfilePassword = async (email: string, password: string) => {
        const res = await fetch("/api/profile/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            return { valid: false, hasCredential: true };
        }

        const result = await res.json();
        return {
            valid: Boolean(result.valid),
            hasCredential: Boolean(result.hasCredential),
        };
    };

    const saveProfilePassword = async (email: string, newPassword: string) => {
        const res = await fetch("/api/profile/password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword }),
        });

        if (!res.ok) {
            throw new Error(ui.passwordSaveFail);
        }
    };

    const changeProfilePassword = async (
        email: string,
        currentPassword: string,
        newPassword: string,
    ) => {
        const res = await fetch("/api/profile/password", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, currentPassword, newPassword }),
        });

        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(result.message || ui.orderError);
        }

        return result.message as string;
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
        setActiveImageIndex(0);
    }, [selectedProduct?.id]);

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

    useEffect(() => {
        let cancelled = false;

        const loadExchangeRate = async () => {
            try {
                const res = await fetch(
                    "https://open.er-api.com/v6/latest/USD",
                );
                if (!res.ok) {
                    return;
                }

                const data = await res.json();
                const rate = Number(data?.rates?.VND);

                if (!cancelled && Number.isFinite(rate) && rate > 0) {
                    setUsdRate(rate);
                }
            } catch {
                // Keep the fallback exchange rate when the API is unavailable.
            }
        };

        loadExchangeRate();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const syncPageVisibility = () => {
            const hash = window.location.hash;
            setShowCheckout(hash === "#cart");
            setShowContactPage(hash === "#contact");
            setShowStorePage(
                hash === "#store" && userProfile.role === "admin",
            );
        };

        syncPageVisibility();
        window.addEventListener("hashchange", syncPageVisibility);

        return () => {
            window.removeEventListener("hashchange", syncPageVisibility);
        };
    }, [userProfile.role]);

    const openCheckoutSection = () => {
        setShowCheckout(true);
        setShowContactPage(false);

        if (typeof window !== "undefined") {
            window.location.hash = "cart";
            requestAnimationFrame(() => {
                document
                    .getElementById("cart")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
    };

    const openContactPage = () => {
        setShowContactPage(true);
        setShowCheckout(false);
        setShowStorePage(false);
        setContactFormError("");

        if (typeof window !== "undefined") {
            window.location.hash = "contact";
            requestAnimationFrame(() => {
                document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
    };

    const openStorePage = () => {
        if (userProfile.role !== "admin") {
            return;
        }

        setShowStorePage(true);
        setShowCheckout(false);
        setShowContactPage(false);

        if (typeof window !== "undefined") {
            window.location.hash = "store";
            requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    };

    const submitContactForm = (event: FormEvent) => {
        event.preventDefault();

        const email = contactForm.email.trim();
        const content = contactForm.content.trim();

        if (!/\S+@\S+\.\S+/.test(email)) {
            setContactFormError(ui.contactEmailInvalid);
            return;
        }

        if (!content) {
            setContactFormError(ui.contactContentRequired);
            return;
        }

        const subject =
            language === "en"
                ? "Contact request from website"
                : "Yeu cau tu van vat pham";
        const body =
            language === "en"
                ? `Email: ${email}\n\nRequest:\n${content}`
                : `Email: ${email}\n\nNoi dung can tu van:\n${content}`;

        if (typeof window !== "undefined") {
            window.location.href = `mailto:hello@suutapsg.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }

        setContactForm({ email: "", content: "" });
        setContactFormError("");
        goBackToHome();
    };

    const submitSurveyForm = async (event: FormEvent) => {
        event.preventDefault();
        setSurveyError("");

        const name = surveyForm.name.trim();
        const phone = surveyForm.phone.trim();

        if (!name) {
            setSurveyError(ui.surveyNameRequired);
            return;
        }

        if (!phone) {
            setSurveyError(ui.surveyPhoneRequired);
            return;
        }

        if (!SURVEY_FORM_ENDPOINT) {
            setSurveyError(ui.surveyNotConfigured);
            return;
        }

        setSurveySubmitting(true);

        try {
            // Google Apps Script Web Apps don't handle CORS preflight
            // requests. Using "text/plain" keeps this a CORS-safelisted
            // simple request (no preflight), and "no-cors" mode avoids
            // failing on Apps Script's inconsistent CORS response headers.
            // The response is opaque either way, so success is inferred
            // from the request completing without a network error.
            await fetch(SURVEY_FORM_ENDPOINT, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify({
                    name,
                    phone,
                    category: surveyForm.category.trim(),
                    era: surveyForm.era.trim(),
                    budget: surveyForm.budget.trim(),
                    other: surveyForm.other.trim(),
                }),
            });

            setSurveyForm({
                name: "",
                phone: "",
                category: "",
                era: "",
                budget: "",
                other: "",
            });
            setSurveySubmitted(true);
        } catch {
            setSurveyError(ui.surveySubmitFail);
        } finally {
            setSurveySubmitting(false);
        }
    };

    const goBackToHome = () => {
        setShowCheckout(false);
        setShowContactPage(false);
        setShowStorePage(false);
        setCategory("all");
        setSearch("");

        if (typeof window !== "undefined") {
            const nextUrl = `${window.location.pathname}${window.location.search}`;
            window.history.pushState({}, "", nextUrl);
            requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    };

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
    const cartCount = useMemo(
        () => Object.values(cart).reduce((sum, quantity) => sum + quantity, 0),
        [cart],
    );
    const total = cartItems.reduce(
        (sum, item) => sum + item.price * (cart[item.id] ?? 0),
        0,
    );
    const shouldShowPaymentQr =
        checkout.paymentMethod === "bank" || checkout.paymentMethod === "momo";
    const paymentQrContent =
        language === "en"
            ? `Pay order on SuutapSG - Method: ${checkout.paymentMethod.toUpperCase()} - Amount: ${formatLocalizedPrice(total)}`
            : `Thanh toan don hang SuutapSG - Phuong thuc: ${checkout.paymentMethod === "bank" ? "Chuyen khoan" : "MoMo"} - So tien: ${formatLocalizedPrice(total)}`;
    const generatedPaymentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(paymentQrContent)}`;
    const configuredQrUrl =
        checkout.paymentMethod === "momo"
            ? frontendSettings.momoQrUrl
            : frontendSettings.bankQrUrl;
    const paymentQrUrl = configuredQrUrl?.trim() || generatedPaymentQrUrl;

    const addToCart = (product: Product) => {
        setCart((prev) => ({
            ...prev,
            [product.id]: (prev[product.id] ?? 0) + 1,
        }));
        setCartNotice(ui.cartNotice);
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
                throw new Error(result.message || ui.orderError);
            }

            const paymentLabel =
                result.paymentStatus === "pending"
                    ? `${ui.orderCreated} ${ui.orderNext}`
                    : ui.orderComplete;

            setOrderMessage(
                `${paymentLabel} Mã đơn: ${result.orderId}. ${result.paymentStatus === "pending" ? ui.orderClickLink : ""}`,
            );
            setPaymentLink(result.paymentUrl || "");
            setCart({});
            setCheckout({
                name: "",
                phone: "",
                address: "",
                paymentMethod: "cod",
            });
            goBackToHome();
        } catch (error) {
            setOrderMessage(
                error instanceof Error ? error.message : ui.orderError,
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

    const openProfileModal = (mode: "info" | "password" = "info") => {
        setProfileMessage("");
        setProfileMode(mode);
        setAvatarMenuOpen(false);
        setProfileForm({
            displayName: userProfile.displayName,
            initials: userProfile.initials,
            avatarUrl: userProfile.avatarUrl,
            email: userProfile.email,
            phone: userProfile.phone,
            address: userProfile.address,
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        });
        setProfileModalOpen(true);
    };

    const closeProfileModal = () => {
        setProfileModalOpen(false);
        setProfileMessage("");
    };

    const handleAvatarLogout = () => {
        setUserProfile({
            displayName: language === "en" ? "You" : "Bạn",
            initials: "SG",
            isOnline: false,
            role: "user",
            avatarUrl: "",
            email: "",
            phone: "",
            address: "",
        });
        setAvatarMenuOpen(false);
        setProfileModalOpen(false);
        setProfileMessage("");
        localStorage.removeItem(authStorageKey);
    };

    const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            setProfileMessage(ui.profileAvatarInvalid);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result =
                typeof reader.result === "string" ? reader.result : "";
            setProfileForm((prev) => ({ ...prev, avatarUrl: result }));
            setProfileMessage(ui.profileAvatarLoaded);
        };
        reader.onerror = () => {
            setProfileMessage(ui.profileAvatarLoadFail);
        };
        reader.readAsDataURL(file);
    };

    const saveProfile = async (event: FormEvent) => {
        event.preventDefault();

        if (profileForm.email && !/\S+@\S+\.\S+/.test(profileForm.email)) {
            setProfileMessage(ui.profileEmailInvalid);
            return;
        }

        const nextEmail =
            profileForm.email.trim().toLowerCase() || userProfile.email;

        if (!nextEmail) {
            setProfileMessage(ui.profileEmailRequired);
            return;
        }

        const nextDisplayName =
            profileForm.displayName.trim() || userProfile.displayName;
        const nextInitials =
            profileForm.initials.trim().toUpperCase().slice(0, 3) ||
            getInitials(nextDisplayName);

        const nextProfile = {
            ...userProfile,
            displayName: nextDisplayName,
            initials: nextInitials,
            avatarUrl: profileForm.avatarUrl.trim(),
            email: nextEmail,
            phone: profileForm.phone.trim(),
            address: profileForm.address.trim(),
        };

        const wantsChangePassword = Boolean(profileForm.newPassword.trim());

        if (wantsChangePassword) {
            if (!profileForm.currentPassword) {
                setProfileMessage(ui.profileCurrentPasswordRequired);
                return;
            }

            if (profileForm.newPassword.length < 6) {
                setProfileMessage(ui.passwordTooShort);
                return;
            }

            if (profileForm.newPassword !== profileForm.confirmNewPassword) {
                setProfileMessage(ui.confirmPasswordMismatch);
                return;
            }
        }

        setUserProfile(nextProfile);
        localStorage.setItem(authStorageKey, nextProfile.email);

        try {
            await saveProfileToApi(nextProfile);

            if (wantsChangePassword) {
                await changeProfilePassword(
                    nextProfile.email,
                    profileForm.currentPassword,
                    profileForm.newPassword,
                );
            }
        } catch (error) {
            setProfileMessage(
                error instanceof Error ? error.message : ui.profileSaveFail,
            );
            return;
        }

        setProfileMessage(
            wantsChangePassword
                ? `${ui.profileSaved} ${ui.profilePasswordChanged}`
                : ui.profileSaved,
        );
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
            setAuthMessage(ui.emailInvalid);
            return;
        }

        if (authForm.password.length < 6) {
            setAuthMessage(ui.passwordTooShort);
            return;
        }

        if (authMode === "register") {
            if (!authForm.name.trim()) {
                setAuthMessage(ui.enterNameToRegister);
                return;
            }

            if (authForm.password !== authForm.confirmPassword) {
                setAuthMessage(ui.confirmPasswordMismatch);
                return;
            }
        }

        if (authForm.captchaInput.trim() !== captchaAnswer) {
            setAuthMessage(ui.captchaIncorrect);
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

        if (authMode === "login") {
            const passwordState = await verifyProfilePassword(
                normalizedEmail,
                authForm.password,
            );

            if (passwordState.hasCredential && !passwordState.valid) {
                setAuthMessage(ui.loginPasswordIncorrect);
                return;
            }
        }

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

            if (authMode === "register") {
                await saveProfilePassword(normalizedEmail, authForm.password);
            } else {
                const passwordState = await verifyProfilePassword(
                    normalizedEmail,
                    authForm.password,
                );

                if (!passwordState.hasCredential) {
                    await saveProfilePassword(
                        normalizedEmail,
                        authForm.password,
                    );
                }
            }
        } catch {
            setAuthMessage(
                authMode === "register"
                    ? ui.passwordSaveFail
                    : ui.saveProfileFail,
            );
            return;
        }

        setAuthMessage(
            authMode === "register" ? ui.registerSuccess : ui.loginSuccess,
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
                        <button
                            type="button"
                            style={styles.brandHomeBtn}
                            onClick={goBackToHome}
                        >
                            <div style={styles.brandRow}>
                                <div style={styles.brandIcon}>ST</div>
                                <div>
                                    <div style={styles.brandTitle}>
                                        {frontendSettings.brandName}
                                    </div>
                                    <div style={styles.brandSub}>
                                        GiangBobo
                                    </div>
                                </div>
                            </div>
                        </button>
                        <nav style={styles.topNav}>
                            <button
                                type="button"
                                style={{
                                    ...styles.navLink,
                                    ...(!showStorePage &&
                                    !showCheckout &&
                                    !showContactPage
                                        ? styles.navLinkActive
                                        : {}),
                                }}
                                onClick={goBackToHome}
                            >
                                {ui.navHome}
                            </button>
                            {userProfile.role === "admin" ? (
                                <button
                                    type="button"
                                    style={{
                                        ...styles.navLink,
                                        ...(showStorePage
                                            ? styles.navLinkActive
                                            : {}),
                                    }}
                                    onClick={openStorePage}
                                >
                                    {ui.navCollection}
                                </button>
                            ) : null}
                        </nav>
                    </div>
                    <div style={styles.accountBlock}>
                        <div style={styles.authActions}>
                            <button
                                type="button"
                                style={styles.languageBtn}
                                onClick={() =>
                                    setLanguage((prev) =>
                                        prev === "vi" ? "en" : "vi",
                                    )
                                }
                            >
                                {ui.switchLanguage}
                            </button>
                            {!userProfile.email ? (
                                <button
                                    style={styles.registerBtn}
                                    onClick={() => openAuthModal("login")}
                                >
                                    {ui.authLoginTitle}
                                </button>
                            ) : null}
                            <div style={styles.avatarMenuWrap}>
                                <button
                                    style={styles.userBadge}
                                    onClick={() =>
                                        setAvatarMenuOpen((prev) => !prev)
                                    }
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
                                {avatarMenuOpen ? (
                                    <div style={styles.avatarMenuPanel}>
                                        <button
                                            type="button"
                                            style={styles.avatarMenuItem}
                                            onClick={() =>
                                                openProfileModal("info")
                                            }
                                        >
                                            {ui.avatarMenuEditProfile}
                                        </button>
                                        <button
                                            type="button"
                                            style={styles.avatarMenuItem}
                                            onClick={() =>
                                                openProfileModal("password")
                                            }
                                        >
                                            {ui.avatarMenuChangePassword}
                                        </button>
                                        <button
                                            type="button"
                                            style={{
                                                ...styles.avatarMenuItem,
                                                ...styles.avatarMenuDanger,
                                            }}
                                            onClick={handleAvatarLogout}
                                        >
                                            {ui.avatarMenuLogout}
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {showStorePage &&
            userProfile.role === "admin" &&
            !showCheckout &&
            !showContactPage ? (
                <>
                    <section style={styles.hero}>
                        <div style={styles.container}>
                            <div style={styles.heroGrid}>
                                <div>
                                    <span style={styles.eyebrow}>
                                        {ui.heroEyebrow}
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
                                            style={styles.primaryBtn}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                document
                                                    .getElementById(
                                                        "products",
                                                    )
                                                    ?.scrollIntoView({
                                                        behavior: "smooth",
                                                        block: "start",
                                                    });
                                            }}
                                        >
                                            {ui.heroPrimary}
                                        </a>
                                        <a
                                            href="#contact"
                                            style={styles.secondaryBtn}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                openContactPage();
                                            }}
                                        >
                                            {ui.heroSecondary}
                                        </a>
                                    </div>
                                </div>
                                <div style={styles.heroCard}>
                                    {frontendSettings.showHeroStats ? (
                                        <div style={styles.statBox}>
                                            500+ phiên bản · 98% khách quay
                                            lại
                                        </div>
                                    ) : null}
                                    {ui.heroFeatures.map((feature) => (
                                        <div
                                            key={feature}
                                            style={styles.featureBox}
                                        >
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section style={{ padding: "10px 0 16px" }}>
                        <div style={styles.container}>
                            <div style={styles.filters}>
                                {["all", "tem", "buu-anh", "niem"].map(
                                    (item) => (
                                        <button
                                            key={item}
                                            onClick={() =>
                                                setCategory(
                                                    item as
                                                        | "all"
                                                        | Product["category"],
                                                )
                                            }
                                            style={{
                                                ...styles.chip,
                                                ...(category === item
                                                    ? styles.chipActive
                                                    : {}),
                                            }}
                                        >
                                            {categoryLabels[item as keyof typeof categoryLabels]}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    </section>

                    <section id="products" style={styles.section}>
                        <div style={styles.container}>
                            <div style={styles.sectionHead}>
                                <div>
                                    <h2 style={styles.sectionTitle}>
                                        {ui.collectionTitle}
                                    </h2>
                                </div>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={ui.searchPlaceholder}
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
                                    <article
                                        key={product.id}
                                        style={styles.card}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedProduct(product)
                                            }
                                            style={{
                                                ...styles.cardMediaButton,
                                                ...styles.productImage,
                                                backgroundImage: `url(${product.image})`,
                                            }}
                                        />
                                        <div style={styles.cardHead}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedProduct(product)
                                                }
                                                style={styles.productNameButton}
                                            >
                                                <h3 style={styles.productName}>
                                                    {product.name}
                                                </h3>
                                            </button>
                                            <span style={styles.price}>
                                                {formatLocalizedPrice(
                                                    product.price,
                                                )}
                                            </span>
                                        </div>
                                        <div style={styles.actionsMini}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addToCart(product)
                                                }
                                                style={styles.buyBtn}
                                            >
                                                {ui.addToCart}
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            ) : null}

            {false && showCheckout ? (
                <section id="cart" style={styles.section}>
                    <div style={styles.container}>
                        <div style={styles.cartWrap}>
                            <div>
                                <h2 style={styles.sectionTitle}>
                                    {ui.cartSectionTitle}
                                    <span style={styles.cartCountBadge}>
                                        {cartCount} món
                                    </span>
                                </h2>
                                <p style={styles.heroDesc}>
                                    {ui.cartSectionDescription}
                                </p>
                                {cartNotice ? (
                                    <p style={styles.cartNotice}>
                                        {cartNotice}
                                    </p>
                                ) : null}
                            </div>

                            <div style={styles.checkoutCard}>
                                {cartItems.length === 0 ? (
                                    <p style={{ color: "#667085", margin: 0 }}>
                                        {ui.cartEmpty}
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
                                                        Số lượng:{" "}
                                                        {cart[item.id]}
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
                                                    {formatLocalizedPrice(
                                                        item.price *
                                                            (cart[item.id] ??
                                                                0),
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div style={styles.totalRow}>
                                            <span>{ui.totalLabel}</span>
                                            <strong>
                                                {formatLocalizedPrice(total)}
                                            </strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={styles.checkoutFormCard}>
                            <h3>{ui.checkoutTitle}</h3>
                            <div style={styles.formGrid}>
                                <input
                                    placeholder={ui.checkoutNamePlaceholder}
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
                                    placeholder={ui.checkoutPhonePlaceholder}
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
                                    placeholder={ui.checkoutAddressPlaceholder}
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
                                    <option value="cod">{ui.paymentCod}</option>
                                    <option value="bank">
                                        {ui.paymentBank}
                                    </option>
                                    <option value="momo">
                                        {ui.paymentMomo}
                                    </option>
                                </select>
                            </div>
                            {shouldShowPaymentQr ? (
                                <div style={styles.qrPaymentBox}>
                                    <img
                                        src={paymentQrUrl}
                                        alt="QR thanh toan"
                                        style={styles.qrPaymentImage}
                                    />
                                    <p style={styles.qrPaymentNote}>
                                        {language === "en"
                                            ? "Scan this QR code to complete payment for your order."
                                            : "Quet ma QR nay de thanh toan don hang."}
                                    </p>
                                </div>
                            ) : null}
                            <div style={styles.formActions}>
                                <button
                                    onClick={submitOrder}
                                    style={styles.buyBtn}
                                    disabled={loading || cartItems.length === 0}
                                >
                                    {loading
                                        ? ui.paymentProcessing
                                        : ui.checkoutSubmit}
                                </button>
                            </div>
                            {orderMessage ? (
                                <div style={styles.successBlock}>
                                    <p style={styles.successText}>
                                        {orderMessage}
                                    </p>
                                    {paymentLink ? (
                                        <a
                                            href={paymentLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={styles.paymentLink}
                                        >
                                            {ui.paymentLink}
                                        </a>
                                    ) : null}
                                </div>
                            ) : null}
                            <div style={styles.formBackHomeRow}>
                                <button
                                    type="button"
                                    style={styles.backHomeTextBtn}
                                    onClick={goBackToHome}
                                >
                                    {ui.backHome}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            ) : null}

            {showStorePage &&
            userProfile.role === "admin" &&
            !showCheckout &&
            !showContactPage ? (
                <section id="contact" style={styles.section}>
                    <div style={styles.container}>
                        <div style={styles.contactBox}>
                            <div>
                                <h2 style={styles.sectionTitle}>
                                    {ui.contactTitle}
                                </h2>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    flexWrap: "wrap",
                                }}
                            >
                                <button
                                    type="button"
                                    style={styles.secondaryBtn}
                                    onClick={goBackToHome}
                                >
                                    {ui.surveyCta}
                                </button>
                                <button
                                    type="button"
                                    style={styles.primaryBtn}
                                    onClick={openContactPage}
                                >
                                    Liên hệ
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            ) : null}

            {showContactPage ? (
                <section id="contact" style={styles.section}>
                    <div style={styles.container}>
                        <form
                            style={styles.checkoutFormCard}
                            onSubmit={submitContactForm}
                        >
                            <h2 style={styles.sectionTitle}>
                                {ui.contactTitle}
                            </h2>
                            <p style={styles.heroDesc}>{ui.contactPageHint}</p>
                            <div style={styles.formGrid}>
                                <input
                                    value={contactForm.email}
                                    onChange={(e) =>
                                        setContactForm((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    placeholder={ui.contactEmailPlaceholder}
                                    style={styles.input}
                                />
                                <textarea
                                    value={contactForm.content}
                                    onChange={(e) =>
                                        setContactForm((prev) => ({
                                            ...prev,
                                            content: e.target.value,
                                        }))
                                    }
                                    placeholder={ui.contactContentPlaceholder}
                                    style={{
                                        ...styles.input,
                                        minHeight: 130,
                                        resize: "vertical",
                                    }}
                                />
                            </div>
                            {contactFormError ? (
                                <p style={styles.authMessage}>
                                    {contactFormError}
                                </p>
                            ) : null}
                            <div style={styles.formActions}>
                                <button type="submit" style={styles.buyBtn}>
                                    {ui.contactSend}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            ) : null}

            {!showStorePage && !showCheckout && !showContactPage ? (
                <section id="survey" style={styles.section}>
                    <div style={styles.container}>
                        <form
                            style={styles.checkoutFormCard}
                            onSubmit={submitSurveyForm}
                        >
                            <h2 style={styles.sectionTitle}>
                                {ui.surveyTitle}
                            </h2>
                            <p style={styles.heroDesc}>{ui.surveyHint}</p>
                            <div
                                style={{
                                    ...styles.formGrid,
                                    alignItems: "end",
                                }}
                            >
                                <label style={styles.formField}>
                                    <span style={styles.fieldLabel}>
                                        {ui.surveyNameLabel}
                                    </span>
                                    <textarea
                                        rows={1}
                                        value={surveyForm.name}
                                        onChange={(e) =>
                                            setSurveyForm((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        style={{
                                            ...styles.input,
                                            resize: "vertical",
                                        }}
                                    />
                                </label>
                                <label style={styles.formField}>
                                    <span style={styles.fieldLabel}>
                                        {ui.surveyPhoneLabel}
                                    </span>
                                    <textarea
                                        rows={1}
                                        value={surveyForm.phone}
                                        onChange={(e) =>
                                            setSurveyForm((prev) => ({
                                                ...prev,
                                                phone: e.target.value,
                                            }))
                                        }
                                        style={{
                                            ...styles.input,
                                            resize: "vertical",
                                        }}
                                    />
                                </label>
                                <label style={styles.formField}>
                                    <span style={styles.fieldLabel}>
                                        {ui.surveyCategoryLabel}
                                    </span>
                                    <textarea
                                        rows={1}
                                        value={surveyForm.category}
                                        onChange={(e) =>
                                            setSurveyForm((prev) => ({
                                                ...prev,
                                                category: e.target.value,
                                            }))
                                        }
                                        style={{
                                            ...styles.input,
                                            resize: "vertical",
                                        }}
                                    />
                                </label>
                                <label style={styles.formField}>
                                    <span style={styles.fieldLabel}>
                                        {ui.surveyBudgetLabel}
                                    </span>
                                    <textarea
                                        rows={1}
                                        value={surveyForm.budget}
                                        onChange={(e) =>
                                            setSurveyForm((prev) => ({
                                                ...prev,
                                                budget: e.target.value,
                                            }))
                                        }
                                        style={{
                                            ...styles.input,
                                            resize: "vertical",
                                        }}
                                    />
                                </label>
                                <label style={styles.formField}>
                                    <span style={styles.fieldLabel}>
                                        {ui.surveyEraLabel}
                                    </span>
                                    <textarea
                                        rows={8}
                                        value={surveyForm.era}
                                        onChange={(e) =>
                                            setSurveyForm((prev) => ({
                                                ...prev,
                                                era: e.target.value,
                                            }))
                                        }
                                        style={{
                                            ...styles.input,
                                            resize: "vertical",
                                        }}
                                    />
                                </label>
                                <label style={styles.formField}>
                                    <span style={styles.fieldLabel}>
                                        {ui.surveyOtherLabel}
                                    </span>
                                    <textarea
                                        rows={8}
                                        value={surveyForm.other}
                                        onChange={(e) =>
                                            setSurveyForm((prev) => ({
                                                ...prev,
                                                other: e.target.value,
                                            }))
                                        }
                                        style={{
                                            ...styles.input,
                                            resize: "vertical",
                                        }}
                                    />
                                </label>
                            </div>
                            {surveyError ? (
                                <p style={styles.authMessage}>
                                    {surveyError}
                                </p>
                            ) : null}
                            {surveySubmitted ? (
                                <p style={styles.cartNotice}>
                                    {ui.surveySuccess}
                                </p>
                            ) : null}
                            <div style={styles.formActions}>
                                <button
                                    type="submit"
                                    style={styles.buyBtn}
                                    disabled={surveySubmitting}
                                >
                                    {surveySubmitting
                                        ? ui.paymentProcessing
                                        : ui.surveySubmit}
                                </button>
                            </div>
                            <div style={styles.formBackHomeRow}>
                                {userProfile.role === "admin" ? (
                                    <button
                                        type="button"
                                        style={styles.backHomeTextBtn}
                                        onClick={openStorePage}
                                    >
                                        {ui.navCollection}
                                    </button>
                                ) : null}
                            </div>
                        </form>
                    </div>
                </section>
            ) : null}

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
                                backgroundImage: `url(${
                                    selectedProduct.images?.[
                                        activeImageIndex
                                    ] || selectedProduct.image
                                })`,
                            }}
                        />
                        {selectedProduct.images &&
                        selectedProduct.images.length > 1 ? (
                            <div style={styles.thumbnailRow}>
                                {selectedProduct.images.map((src, index) => (
                                    <button
                                        key={`${index}-${src.slice(0, 24)}`}
                                        type="button"
                                        onClick={() =>
                                            setActiveImageIndex(index)
                                        }
                                        style={{
                                            ...styles.thumbnailButton,
                                            backgroundImage: `url(${src})`,
                                            ...(index === activeImageIndex
                                                ? styles.thumbnailButtonActive
                                                : {}),
                                        }}
                                        aria-label={`Ảnh ${index + 1}`}
                                    />
                                ))}
                            </div>
                        ) : null}
                        <h3>{selectedProduct.name}</h3>
                        <div style={styles.detailNoteBox}>
                            <div style={styles.detailNoteLabel}>
                                {ui.detailLabel}
                            </div>
                            <p
                                style={{
                                    ...styles.desc,
                                    minHeight: "auto",
                                    maxHeight: "none",
                                    WebkitLineClamp: "unset" as any,
                                }}
                            >
                                {selectedProduct.description}
                            </p>
                        </div>
                        <div style={styles.metaRow}>
                            <span>
                                {ui.typeLabel}:{" "}
                                {categoryLabels[selectedProduct.category]}
                            </span>
                            <span>
                                {ui.yearLabel}: {selectedProduct.year}
                            </span>
                        </div>
                        <div style={styles.metaRow}>
                            <span>
                                {ui.originLabel}: {selectedProduct.origin}
                            </span>
                            <span>
                                {ui.qualityLabel}: {selectedProduct.quality}
                            </span>
                        </div>
                        <div style={styles.metaRow}>
                            <span>
                                {selectedProduct.featured
                                    ? ui.featuredLabel
                                    : ui.regularLabel}
                            </span>
                            <span>
                                {ui.priceLabel}:{" "}
                                {formatLocalizedPrice(selectedProduct.price)}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                addToCart(selectedProduct);
                                setSelectedProduct(null);
                            }}
                            style={styles.buyBtn}
                        >
                            {ui.addToCart}
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
                                ? ui.authRegisterTitle
                                : ui.authLoginTitle}
                        </h3>
                        <p style={styles.authSubtext}>{ui.authInstruction}</p>

                        <div style={styles.authGrid}>
                            {authMode === "register" ? (
                                <label style={styles.formField}>
                                    <span style={styles.fieldLabel}>
                                        {ui.authNameLabel}
                                    </span>
                                    <input
                                        placeholder={ui.authNamePlaceholder}
                                        value={authForm.name}
                                        onChange={(e) =>
                                            setAuthForm((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        style={styles.authInput}
                                    />
                                </label>
                            ) : null}
                            <label style={styles.formField}>
                                <span style={styles.fieldLabel}>
                                    {ui.authEmailLabel}
                                </span>
                                <input
                                    placeholder={ui.authEmailPlaceholder}
                                    value={authForm.email}
                                    onChange={(e) =>
                                        setAuthForm((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    style={styles.authInput}
                                />
                            </label>
                            <label style={styles.formField}>
                                <span style={styles.fieldLabel}>
                                    {ui.authPasswordLabel}
                                </span>
                                <input
                                    type="password"
                                    placeholder={ui.authPasswordPlaceholder}
                                    value={authForm.password}
                                    onChange={(e) =>
                                        setAuthForm((prev) => ({
                                            ...prev,
                                            password: e.target.value,
                                        }))
                                    }
                                    style={styles.authInput}
                                />
                            </label>
                            {authMode === "register" ? (
                                <label style={styles.formField}>
                                    <span style={styles.fieldLabel}>
                                        {ui.authConfirmPasswordLabel}
                                    </span>
                                    <input
                                        type="password"
                                        placeholder={
                                            ui.authConfirmPasswordPlaceholder
                                        }
                                        value={authForm.confirmPassword}
                                        onChange={(e) =>
                                            setAuthForm((prev) => ({
                                                ...prev,
                                                confirmPassword:
                                                    e.target.value,
                                            }))
                                        }
                                        style={styles.authInput}
                                    />
                                </label>
                            ) : null}
                            <div style={styles.captchaRow}>
                                <span style={styles.captchaBox}>
                                    {ui.captchaLabel}: {captchaQuestion}
                                </span>
                                <button
                                    type="button"
                                    style={styles.captchaRefreshBtn}
                                    onClick={createCaptcha}
                                >
                                    {ui.captchaChange}
                                </button>
                            </div>
                            <input
                                placeholder={ui.authCaptchaPlaceholder}
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
                                    ? ui.authRegisterSubmit
                                    : ui.authLoginSubmit}
                            </button>
                            <button
                                type="button"
                                style={styles.registerBtn}
                                onClick={closeAuthModal}
                            >
                                {ui.authCancel}
                            </button>
                        </div>

                        {authMode === "login" ? (
                            <p style={styles.signupPrompt}>
                                {ui.authPromptPrefix}{" "}
                                <button
                                    type="button"
                                    style={styles.signupLink}
                                    onClick={() => openAuthModal("register")}
                                >
                                    {ui.authPromptLink}
                                </button>{" "}
                                {ui.authPromptSuffix}
                            </p>
                        ) : null}
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
                        <h3 style={{ margin: "0 0 4px" }}>{ui.profileTitle}</h3>
                        <p style={styles.authSubtext}>
                            {ui.profileDescription}
                        </p>

                        <div style={styles.authGrid}>
                            {profileMode === "info" ? (
                                <>
                                    <label style={styles.formField}>
                                        <span style={styles.fieldLabel}>
                                            {ui.profileDisplayNameLabel}
                                        </span>
                                        <input
                                            placeholder={
                                                ui.profileDisplayNamePlaceholder
                                            }
                                            value={profileForm.displayName}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({
                                                    ...prev,
                                                    displayName:
                                                        e.target.value,
                                                }))
                                            }
                                            style={styles.authInput}
                                        />
                                    </label>
                                    <label style={styles.formField}>
                                        <span style={styles.fieldLabel}>
                                            {ui.profileInitialsLabel}
                                        </span>
                                        <input
                                            placeholder={
                                                ui.profileInitialsPlaceholder
                                            }
                                            value={profileForm.initials}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({
                                                    ...prev,
                                                    initials: e.target.value,
                                                }))
                                            }
                                            style={styles.authInput}
                                        />
                                    </label>
                                    <div style={styles.formField}>
                                        <span style={styles.fieldLabel}>
                                            {ui.profileAvatarLabel}
                                        </span>
                                        <div style={styles.avatarUploadRow}>
                                            <input
                                                ref={avatarInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={
                                                    handleAvatarFileChange
                                                }
                                                style={styles.hiddenFileInput}
                                            />
                                            <button
                                                type="button"
                                                style={styles.uploadAvatarBtn}
                                                onClick={() =>
                                                    avatarInputRef.current?.click()
                                                }
                                            >
                                                {ui.profileAvatarButton}
                                            </button>
                                            {profileForm.avatarUrl ? (
                                                <img
                                                    src={profileForm.avatarUrl}
                                                    alt={ui.profileAvatarAlt}
                                                    style={
                                                        styles.avatarPreviewInForm
                                                    }
                                                />
                                            ) : null}
                                        </div>
                                    </div>
                                    <label style={styles.formField}>
                                        <span style={styles.fieldLabel}>
                                            {ui.profileEmailLabel}
                                        </span>
                                        <input
                                            placeholder={
                                                ui.profileEmailPlaceholder
                                            }
                                            value={profileForm.email}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            style={styles.authInput}
                                        />
                                    </label>
                                    <label style={styles.formField}>
                                        <span style={styles.fieldLabel}>
                                            {ui.profilePhoneLabel}
                                        </span>
                                        <input
                                            placeholder={
                                                ui.profilePhonePlaceholder
                                            }
                                            value={profileForm.phone}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({
                                                    ...prev,
                                                    phone: e.target.value,
                                                }))
                                            }
                                            style={styles.authInput}
                                        />
                                    </label>
                                    <label style={styles.formField}>
                                        <span style={styles.fieldLabel}>
                                            {ui.profileAddressLabel}
                                        </span>
                                        <textarea
                                            placeholder={
                                                ui.profileAddressPlaceholder
                                            }
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
                                    </label>
                                </>
                            ) : (
                                <div style={styles.systemBox}>
                                    <div style={styles.systemTitle}>
                                        {ui.profileChangePasswordTitle}
                                    </div>
                                    <div style={styles.systemLinks}>
                                        <label style={styles.formField}>
                                            <span style={styles.fieldLabel}>
                                                {
                                                    ui.profileCurrentPasswordLabel
                                                }
                                            </span>
                                            <input
                                                type="password"
                                                placeholder={
                                                    ui.profileCurrentPasswordPlaceholder
                                                }
                                                value={
                                                    profileForm.currentPassword
                                                }
                                                onChange={(e) =>
                                                    setProfileForm((prev) => ({
                                                        ...prev,
                                                        currentPassword:
                                                            e.target.value,
                                                    }))
                                                }
                                                style={styles.authInput}
                                            />
                                        </label>
                                        <label style={styles.formField}>
                                            <span style={styles.fieldLabel}>
                                                {ui.profileNewPasswordLabel}
                                            </span>
                                            <input
                                                type="password"
                                                placeholder={
                                                    ui.profileNewPasswordPlaceholder
                                                }
                                                value={profileForm.newPassword}
                                                onChange={(e) =>
                                                    setProfileForm((prev) => ({
                                                        ...prev,
                                                        newPassword:
                                                            e.target.value,
                                                    }))
                                                }
                                                style={styles.authInput}
                                            />
                                        </label>
                                        <label style={styles.formField}>
                                            <span style={styles.fieldLabel}>
                                                {
                                                    ui.profileConfirmNewPasswordLabel
                                                }
                                            </span>
                                            <input
                                                type="password"
                                                placeholder={
                                                    ui.profileConfirmNewPasswordPlaceholder
                                                }
                                                value={
                                                    profileForm.confirmNewPassword
                                                }
                                                onChange={(e) =>
                                                    setProfileForm((prev) => ({
                                                        ...prev,
                                                        confirmNewPassword:
                                                            e.target.value,
                                                    }))
                                                }
                                                style={styles.authInput}
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {userProfile.role === "admin" ? (
                            <div style={styles.systemBox}>
                                <div style={styles.systemTitle}>
                                    {ui.profileAdminTitle}
                                </div>
                                <div style={styles.systemLinks}>
                                    <Link
                                        href="/admin"
                                        style={styles.registerBtn}
                                    >
                                        {ui.profileDashboard}
                                    </Link>
                                    <Link
                                        href="/admin/frontend"
                                        style={styles.loginBtn}
                                    >
                                        {ui.profileFrontend}
                                    </Link>
                                </div>
                            </div>
                        ) : null}

                        {profileMessage ? (
                            <p style={styles.authMessage}>{profileMessage}</p>
                        ) : null}

                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <button type="submit" style={styles.loginBtn}>
                                {ui.profileSave}
                            </button>
                            <button
                                type="button"
                                style={styles.registerBtn}
                                onClick={closeProfileModal}
                            >
                                {ui.authCancel}
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
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: 12,
        padding: "12px 0",
    },
    brandBlock: {
        display: "flex",
        alignItems: "center",
        gap: 20,
        justifySelf: "start",
        minWidth: 0,
    },
    topNav: {
        display: "flex",
        alignItems: "center",
        gap: 4,
    },
    navLink: {
        border: "none",
        background: "transparent",
        padding: "8px 12px",
        borderRadius: 999,
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 14,
        color: "#7a6044",
    },
    navLinkActive: {
        background: "#f7e9dc",
        color: "#8d4f1f",
    },
    brandHomeBtn: {
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: "pointer",
        textAlign: "left",
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
    cartNavButton: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 44,
        height: 38,
        padding: "0 10px",
        borderRadius: 999,
        background: "#fff3e7",
        color: "#8d4f1f",
        border: "1px solid #e8c9a8",
        textDecoration: "none",
    },
    cartNavIcon: {
        fontSize: 18,
        lineHeight: 1,
    },
    cartNavBadge: {
        position: "absolute",
        top: -6,
        right: -6,
        minWidth: 20,
        height: 20,
        padding: "0 5px",
        borderRadius: 999,
        background: "#b96f36",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        fontSize: 12,
        fontWeight: 800,
        boxShadow: "0 8px 18px rgba(185,111,54,0.28)",
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
        height: 38,
        padding: "0 14px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        cursor: "pointer",
    },
    languageBtn: {
        border: "1px solid #d6a173",
        background: "#fff",
        color: "#8d4f1f",
        borderRadius: 999,
        height: 38,
        padding: "0 12px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        cursor: "pointer",
    },
    loginBtn: {
        border: "none",
        background: "#b96f36",
        color: "#fff",
        borderRadius: 999,
        height: 38,
        padding: "0 14px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
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
    avatarMenuWrap: {
        position: "relative",
    },
    avatarMenuPanel: {
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        display: "flex",
        flexDirection: "column",
        minWidth: 200,
        background: "#fffdf9",
        border: "1px solid #eadbc6",
        borderRadius: 14,
        boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
        padding: 6,
        zIndex: 20,
    },
    avatarMenuItem: {
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 10,
        border: "none",
        background: "transparent",
        color: "#59422f",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
    },
    avatarMenuDanger: {
        color: "#b91c1c",
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
    formField: {
        display: "grid",
        gap: 4,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: 700,
        color: "#59422f",
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
    signupPrompt: {
        display: "block",
        margin: "20px 0 0",
        color: "#6b5a46",
        fontSize: 14,
        lineHeight: 1.6,
    },
    signupLink: {
        border: "none",
        background: "transparent",
        padding: 0,
        margin: 0,
        cursor: "pointer",
        color: "#b96f36",
        fontSize: 17,
        fontWeight: 800,
        textDecoration: "underline",
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
    cartNotice: {
        margin: "10px 0 0",
        color: "#1d7a4b",
        fontWeight: 700,
        fontSize: 14,
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
    cartCountBadge: {
        display: "inline-flex",
        alignItems: "center",
        marginLeft: 10,
        padding: "4px 10px",
        borderRadius: 999,
        background: "#f7e9dc",
        color: "#8d4f1f",
        fontSize: 14,
        fontWeight: 800,
        verticalAlign: "middle",
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
    cardMediaButton: {
        width: "100%",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
    },
    productImage: {
        width: "100%",
        aspectRatio: "4 / 3",
        borderRadius: 16,
        backgroundSize: "cover",
        backgroundPosition: "center",
        marginBottom: 14,
    },
    thumbnailRow: {
        display: "flex",
        gap: 8,
        marginBottom: 14,
        flexWrap: "wrap",
    },
    thumbnailButton: {
        width: 56,
        height: 56,
        borderRadius: 10,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: "2px solid transparent",
        cursor: "pointer",
        padding: 0,
    },
    thumbnailButtonActive: {
        border: "2px solid #b96f36",
    },
    productNameButton: {
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        textAlign: "inherit",
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
        fontSize: 22,
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
    detailNoteBox: {
        margin: "12px 0 14px",
        padding: 14,
        borderRadius: 14,
        background: "#f8f3ea",
        border: "1px solid #eadbc6",
    },
    detailNoteLabel: {
        fontSize: 13,
        fontWeight: 800,
        color: "#8d4f1f",
        marginBottom: 8,
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
        gap: 12,
        marginTop: 6,
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
    qrPaymentBox: {
        marginTop: 14,
        border: "1px solid #eadbc6",
        borderRadius: 14,
        padding: 14,
        display: "grid",
        justifyItems: "center",
        gap: 10,
        background: "#fff9f1",
    },
    qrPaymentImage: {
        width: 220,
        height: 220,
        borderRadius: 10,
        border: "1px solid #e6d5bf",
        background: "#fff",
    },
    qrPaymentNote: {
        margin: 0,
        textAlign: "center",
        fontSize: 13,
        color: "#694a31",
    },
    successBlock: {
        marginTop: 12,
        padding: 12,
        borderRadius: 14,
        background: "#f6fbf7",
        border: "1px solid #cce9d6",
    },
    formBackHomeRow: {
        marginTop: 12,
        display: "flex",
        justifyContent: "flex-end",
    },
    backHomeTextBtn: {
        border: "none",
        background: "transparent",
        color: "#8d4f1f",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        textDecoration: "underline",
        padding: 0,
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
