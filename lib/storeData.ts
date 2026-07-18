export type ProductCategory = "tem" | "buu-anh" | "niem";

export type Product = {
    id: number;
    name: string;
    category: ProductCategory;
    price: number;
    quantity: number;
    year: string;
    origin: string;
    quality: string;
    description: string;
    image: string;
    images?: string[];
    featured: boolean;
};

export const products: Product[] = [
    {
        id: 1,
        name: "Tem thư Việt Nam 1890",
        category: "tem",
        price: 120000,
        quantity: 1,
        year: "1890",
        origin: "Hà Nội",
        quality: "Mẫu hoàn chỉnh, nguyên bản",
        description:
            "Tem thư cổ thời kỳ đầu, mệnh giá rõ ràng và tình trạng bảo quản tốt, phù hợp cho bộ sưu tập nâng cấp.",
        image: "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=900&q=80",
        featured: true,
    },
    {
        id: 2,
        name: "Bưu ảnh Indochine Sài Gòn",
        category: "buu-anh",
        price: 180000,
        quantity: 1,
        year: "1928",
        origin: "Sài Gòn",
        quality: "Bản in rõ nét, lưu giữ tốt",
        description:
            "Bưu ảnh cổ của Sài Gòn mang dấu ấn đô thị, được nhiều collector tìm mua để trang trí hoặc bảo quản trong bộ sưu tập.",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
        featured: true,
    },
    {
        id: 3,
        name: "Niêm phong nhà bưu điện",
        category: "niem",
        price: 95000,
        quantity: 1,
        year: "1935",
        origin: "Nam Bộ",
        quality: "Đã được bảo quản cẩn thận",
        description:
            "Niêm phong và giấy tờ xưa với dấu ấn bưu điện, giá trị lịch sử và thẩm mỹ cao cho người sưu tầm chuyên nghiệp.",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80",
        featured: false,
    },
    {
        id: 4,
        name: "Tem thư quân đội 1954",
        category: "tem",
        price: 140000,
        quantity: 1,
        year: "1954",
        origin: "Đà Nẵng",
        quality: "Hiếm, bền màu",
        description:
            "Tem thời kỳ chuyển giao, thiết kế độc đáo và biến thể hiếm, rất được ưu chuộng trong bộ sưu tập chuyên đề.",
        image: "https://images.unsplash.com/photo-1516979187454-437ec0c8c658?auto=format&fit=crop&w=900&q=80",
        featured: true,
    },
    {
        id: 5,
        name: "Bưu ảnh Hà Nội 1930",
        category: "buu-anh",
        price: 220000,
        quantity: 1,
        year: "1930",
        origin: "Hà Nội",
        quality: "Bản in đẹp, đủ điều kiện lưu giữ",
        description:
            "Tấm bưu ảnh cổ thể hiện cảnh Hà Nội xưa, có giá trị nghiên cứu và sưu tập cao.",
        image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80",
        featured: true,
    },
    {
        id: 6,
        name: "Hồ sơ niêm giấy tờ xưa",
        category: "niem",
        price: 110000,
        quantity: 1,
        year: "1942",
        origin: "Miền Trung",
        quality: "Nguyên bản, có dấu niêm",
        description:
            "Mẫu hồ sơ niêm giấy tờ xưa cho thấy các thao tác lưu trữ và vận chuyển thư tín thời kỳ cũ.",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
        featured: false,
    },
    {
        id: 7,
        name: "Tem thư Nam Bộ 1912",
        category: "tem",
        price: 165000,
        quantity: 1,
        year: "1912",
        origin: "Sài Gòn",
        quality: "Số lượng ít, lớp màu đẹp",
        description:
            "Mẫu tem thư Nam Bộ thời kỳ đầu, cực kỳ được ưa chuộng bởi các hội viên sưu tập tem riêng biệt.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
        featured: false,
    },
    {
        id: 8,
        name: "Bưu ảnh xe lửa cổ",
        category: "buu-anh",
        price: 150000,
        quantity: 1,
        year: "1918",
        origin: "Miền Bắc",
        quality: "Mẫu in cổ, hồng ngoại sắc nét",
        description:
            "Bưu ảnh về phương tiện vận chuyển thời phong kiến, mang sắc thái văn hóa và lịch sử đặc biệt.",
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80",
        featured: false,
    },
];
