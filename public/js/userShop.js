

// Render Products
function renderProducts(products) {
    const container = document.getElementById("shopTableBody");
    if(products.length === 0) {
        container.innerHTML = `<div class="text-center py-5 text-secondary">No products found.</div>`;
        return;
    }
    container.innerHTML = products.map(product => `
        <div class="col-6 col-md-4 col-lg-4">
            <div class="card glass p-4 h-100">
                <img src="${product.images[0].url}" class="mb-3"
                    width="auto" height="200" style="object-fit:cover;border-radius:10px">
                <h5 class="fw-bold text-info mb-3">${product.name}</h5>
                <p class="text-secondary">₹${product.finalPrice}</p>
                <div class="d-flex gap-2 mt-auto">
                    <a href="/product/${product._id}" class="btn btn-sm btn-info w-75">Buy Now</a>
                    <button class="btn btn-sm btn-outline-info w-100 addToCartBtn"
                        data-id="${product._id}">
                        <i class="fa fa-cart-shopping"></i> Add to Cart
                    </button>
                    <button class="btn btn-sm btn-outline-danger addToWishlistBtn"
                        data-id="${product._id}">
                        <i class="fa fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// Pagination
function renderPagination(currentPageNumber, totalPages) {
    const container = document.getElementById("paginationContainer");
    container.innerHTML = "";

    for(let i = 1; i <= totalPages; i++) {
        container.innerHTML += `
            <li class="page-item ${i === currentPageNumber ? "active" : ""}">
                <button class="page-link" data-page="${i}">${i}</button>
            </li>
        `;
    }
}

// Wishlist
document.getElementById("shopTableBody").addEventListener("click", async (e) => {
    const btn = e.target.closest(".addToWishlistBtn");
    if(!btn) return;
    const res = await fetch(`/wishlist/${btn.dataset.id}`, { method: "POST" });
    const data = await res.json();
    showToast(data.message, data.success ? "success" : "danger");
});

// Toast
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

document.getElementById("paginationContainer")
    .addEventListener("click", (e) => {
        const btn = e.target.closest(".page-link");
        if(!btn) return;
        fetchProducts(parseInt(btn.dataset.page));
    });

function fetchProducts(page = 1) {
    const search   = document.getElementById("searchInput").value.trim();
    const category = document.querySelector('input[name="categoryFilter"]:checked')?.value || "";
    const brand    = document.querySelector('input[name="brandFilter"]:checked')?.value || "";
    const minPrice = document.getElementById("minPrice").value;
    const maxPrice = document.getElementById("maxPrice").value;
    const sort     = document.getElementById("sortSelect").value;

    const params = new URLSearchParams({ page, search, category, brand, sort });
    if(minPrice) params.append("minPrice", minPrice);
    if(maxPrice) params.append("maxPrice", maxPrice);

    fetch(`/shop?${params}`, { headers: { "Accept": "application/json" }})
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                renderProducts(data.products);
                renderPagination(data.currentPageNumber, data.totalPages);
            }
        })
        .catch(() => showToast("Something went wrong.", "danger"));
}

// Filter
document.querySelectorAll(".filter-category, .filter-brand").forEach(input => {
    input.addEventListener("change", () => fetchProducts(1));
});
document.getElementById("sortSelect").addEventListener("change", () => fetchProducts(1));
document.getElementById("clearFilters").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";
    document.getElementById("sortSelect").value = "newest";
    document.querySelector('input[name="categoryFilter"][value=""]').checked = true;
    document.querySelector('input[name="brandFilter"][value=""]').checked = true;
    fetchProducts(1);
});

let priceTimer;
["minPrice", "maxPrice"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
        clearTimeout(priceTimer);
        priceTimer = setTimeout(() => fetchProducts(1), 600);
    });
});

document.getElementById("shopTableBody")
    .addEventListener("click", async (e) => {
        const btn = e.target.closest(".addToCartBtn");
        if(!btn) return;
        const productId = btn.dataset.id;
        const response = await fetch(`/cart/${productId}`, { method: "POST" });
        const data = await response.json();
        if(data.success) {
            showToast("Added to cart!", "success");
            const counter = document.getElementById("navCartCount");
            if(counter) counter.textContent = data.cartCount;
        } else {
            showToast(data.message, "danger");
        }
    });

let timer;
document.getElementById("searchInput")
    .addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => fetchProducts(1), 400);
    });

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const categoryFromURL = params.get("category");

    if (categoryFromURL) {
        const radio = document.querySelector(`input[name="categoryFilter"][value="${categoryFromURL}"]`);
        if(radio) radio.checked = true;
    }

    fetchProducts(1);
});