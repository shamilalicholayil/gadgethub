        /* ── Mobile sidebar toggle ──────────────────────── */
        const filterSidebar    = document.getElementById('filterSidebar');
        const sidebarBackdrop  = document.getElementById('sidebarBackdrop');
        const filterToggleBtn  = document.getElementById('filterToggleBtn');
        const sidebarCloseBtn  = document.getElementById('sidebarCloseBtn');

        function openSidebar() {
            filterSidebar.classList.add('open');
            sidebarBackdrop.classList.add('open');
            filterToggleBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }
        function closeSidebar() {
            filterSidebar.classList.remove('open');
            sidebarBackdrop.classList.remove('open');
            filterToggleBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        filterToggleBtn.addEventListener('click', openSidebar);
        sidebarCloseBtn.addEventListener('click', closeSidebar);
        sidebarBackdrop.addEventListener('click', closeSidebar);

        // Close sidebar on filter change (mobile UX)
        document.querySelectorAll('.filter-category, .filter-brand').forEach(input => {
            input.addEventListener('change', () => {
                if (window.innerWidth < 992) closeSidebar();
            });
        });

// Render Products
        function renderProducts(products) {
            const container = document.getElementById("shopTableBody");
            if (products.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" role="listitem">
                        <i class="fa fa-box-open" aria-hidden="true"></i>
                        <p>No products found.<br>Try adjusting your filters.</p>
                    </div>`;
                return;
            }
            container.innerHTML = products.map(product => `
                <div class="product-card" role="listitem">
                    <div class="product-img-wrap">
                        <img src="${product.images[0].url}"
                             alt="${product.name}"
                             loading="lazy">
                    </div>
                    <p class="product-name">${product.name}</p>
                    <p class="product-price">₹${product.finalPrice.toLocaleString('en-IN')}</p>
                    <div class="product-actions">
                        <a href="/product/${product._id}" class="btn-buy">Buy Now</a>
                        <button class="btn-cart addToCartBtn" data-id="${product._id}" aria-label="Add ${product.name} to cart">
                            <i class="fa fa-cart-shopping" aria-hidden="true"></i>
                            <span>Cart</span>
                        </button>
                        <button class="btn-wish addToWishlistBtn" data-id="${product._id}" aria-label="Add ${product.name} to wishlist">
                            <i class="fa fa-heart" aria-hidden="true"></i>
                        </button>
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