const products = [
    {
        name: "Tem thư Việt Nam 1890",
        category: "tem",
        price: "120.000đ",
        description:
            "Bản tem phong bì thời kỳ đầu, hoàn thiện đẹp, tình trạng bảo quản tốt, phù hợp bộ sưu tập nâng cấp.",
        image: "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=900&q=80",
    },
    {
        name: "Bưu ảnh Indochine Sài Gòn",
        category: "buu-anh",
        price: "180.000đ",
        description:
            "Bưu ảnh cổ hình thành phố Sài Gòn, bản in định danh giá trị lịch sử và văn hóa thu hút người sưu tầm.",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    },
    {
        name: "Niêm phong nhà bưu điện",
        category: "niem",
        price: "95.000đ",
        description:
            "Mẫu niêm phong và giấy tờ xưa với dấu ấn thời kỳ chính quyền, cấu trúc rõ ràng và tình trạng nguyên bản.",
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80",
    },
    {
        name: "Tem thư quân đội 1954",
        category: "tem",
        price: "140.000đ",
        description:
            "Tem thời kỳ chuyển giao, độc đáo với số lượng xuất hiện ít, cực kỳ phù hợp bộ sưu tập chuyên sâu.",
        image: "https://images.unsplash.com/photo-1516979187454-437ec0c8c658?auto=format&fit=crop&w=900&q=80",
    },
    {
        name: "Bưu ảnh Hà Nội 1930",
        category: "buu-anh",
        price: "220.000đ",
        description:
            "Mẫu bưu ảnh cổ mang gợi nhớ kiến trúc và đời sống thủ đô, đủ điều kiện cho bộ sưu tập chuyên đề.",
        image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80",
    },
    {
        name: "Hồ sơ niêm - giấy tờ xưa",
        category: "niem",
        price: "110.000đ",
        description:
            "Tài liệu cũ được lưu giữ rõ nét, có giá trị nghiên cứu, minh họa tốt cho bộ sưu tập dân tộc học.",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
    },
];

const productGrid = document.getElementById("productGrid");
const chips = document.querySelectorAll(".chip");
const searchBox = document.getElementById("searchBox");

let currentCategory = "all";
let searchTerm = "";

function renderProducts() {
    const filtered = products.filter((product) => {
        const matchesCategory =
            currentCategory === "all" || product.category === currentCategory;
        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    productGrid.innerHTML = filtered
        .map(
            (product) => `
        <article class="product-card">
          <div class="product-visual" style="background-image: linear-gradient(135deg, rgba(0,0,0,0.14), rgba(0,0,0,0.02)), url('${product.image}')"></div>
          <div class="product-meta">
            <h4>${product.name}</h4>
            <span class="price-tag">${product.price}</span>
          </div>
          <p>${product.description}</p>
          <div class="product-actions">
            <button class="buy">Mua ngay</button>
            <button class="ghost">Chi tiết</button>
          </div>
        </article>
      `,
        )
        .join("");

    if (filtered.length === 0) {
        productGrid.innerHTML =
            '<div class="product-card"><p>Không tìm thấy sản phẩm phù hợp.</p></div>';
    }
}

chips.forEach((chip) => {
    chip.addEventListener("click", () => {
        chips.forEach((item) => item.classList.remove("active"));
        chip.classList.add("active");
        currentCategory = chip.dataset.category;
        renderProducts();
    });
});

searchBox.addEventListener("input", (event) => {
    searchTerm = event.target.value.trim();
    renderProducts();
});

renderProducts();
