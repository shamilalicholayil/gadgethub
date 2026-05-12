let slots = [];

// Toast

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

function showError(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.classList.remove("d-none");
}

function hideError(id) {
    const el = document.getElementById(id);
    el.textContent = "";
    el.classList.add("d-none");
}

// Real-time Validation - Add Product

document.getElementById("productName").addEventListener("input", function () {
    const value = this.value.trim();
    if (!value) { showError("productError", "Product name is required."); return; }
    if (value.length < 2) { showError("productError", "Name must be at least 2 characters."); return; }
    hideError("productError");
});

document.getElementById("productDesc").addEventListener("input", function () {
    const value = this.value.trim();
    if (!value) { showError("productError", "Description is required."); return; }
    if (value.length < 5) { showError("productError", "Description must be at least 5 characters."); return; }
    hideError("productError");
});

document.getElementById("productPrice").addEventListener("input", function () {
    const value = parseFloat(this.value);
    if (!this.value || isNaN(value) || value <= 0) { showError("productError", "Price must be a positive number."); return; }
    hideError("productError");
});

document.getElementById("productStock").addEventListener("input", function () {
    const value = parseInt(this.value);
    if (this.value === "" || isNaN(value) || value < 0) { showError("productError", "Stock must be 0 or more."); return; }
    hideError("productError");
});

document.getElementById("productBrand").addEventListener("change", function () {
    if (!this.value) { showError("productError", "Please select a brand."); return; }
    hideError("productError");
});

document.getElementById("productCategory").addEventListener("change", function () {
    if (!this.value) { showError("productError", "Please select a category."); return; }
    hideError("productError");
});

// Real-time Validation - Edit Product

document.getElementById("editProductName").addEventListener("input", function () {
    const value = this.value.trim();
    if (!value) { showError("editProductError", "Product name is required."); return; }
    if (value.length < 2) { showError("editProductError", "Name must be at least 2 characters."); return; }
    hideError("editProductError");
});

document.getElementById("editProductDesc").addEventListener("input", function () {
    const value = this.value.trim();
    if (!value) { showError("editProductError", "Description is required."); return; }
    if (value.length < 5) { showError("editProductError", "Description must be at least 5 characters."); return; }
    hideError("editProductError");
});

document.getElementById("editProductPrice").addEventListener("input", function () {
    const value = parseFloat(this.value);
    if (!this.value || isNaN(value) || value <= 0) { showError("editProductError", "Price must be a positive number."); return; }
    hideError("editProductError");
});

document.getElementById("editProductStock").addEventListener("input", function () {
    const value = parseInt(this.value);
    if (this.value === "" || isNaN(value) || value < 0) { showError("editProductError", "Stock must be 0 or more."); return; }
    hideError("editProductError");
});

document.getElementById("editProductBrand").addEventListener("change", function () {
    if (!this.value) { showError("editProductError", "Please select a brand."); return; }
    hideError("editProductError");
});

document.getElementById("editProductCategory").addEventListener("change", function () {
    if (!this.value) { showError("editProductError", "Please select a category."); return; }
    hideError("editProductError");
});

document.getElementById("editHasOffer").addEventListener("change", function () {
    const offerPercent = parseFloat(document.getElementById("editOfferPercent").value);
    if (this.checked && (!offerPercent || offerPercent <= 0 || offerPercent > 100)) {
        showError("editProductError", "Offer percentage must be between 1 and 100.");
    } else {
        hideError("editProductError");
    }
});

document.getElementById("editOfferPercent").addEventListener("input", function () {
    const hasOffer = document.getElementById("editHasOffer").checked;
    if (!hasOffer) return;
    const value = parseFloat(this.value);
    if (!this.value || isNaN(value) || value <= 0) { showError("editProductError", "Offer percentage must be a positive number."); return; }
    if (value > 100) { showError("editProductError", "Offer percentage cannot exceed 100."); return; }
    hideError("editProductError");
});

// Clear modals on close

document.getElementById("addProductModal").addEventListener("hidden.bs.modal", () => {
    ["productName", "productDesc", "productPrice", "productStock"].forEach(id => {
        document.getElementById(id).value = "";
    });
    document.getElementById("productBrand").value = "";
    document.getElementById("productCategory").value = "";
    for (let i = 0; i <= 4; i++) document.getElementById(`addImage_${i}`).value = "";
    document.getElementById("productImagePreview").innerHTML = "";
    hideError("productError");
});

document.getElementById("editProductModal").addEventListener("hidden.bs.modal", () => {
    hideError("editProductError");
});

// Pagination

function renderPagination(currentPage, totalPages) {
    const container = document.getElementById("paginationContainer");
    container.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        container.innerHTML += `
            <li class="page-item ${i === currentPage ? "active" : ""}">
                <button class="page-link" data-page="${i}">${i}</button>
            </li>`;
    }
}

function fetchProducts(page = 1) {
    const search = document.getElementById("searchInput").value;
    fetch(`/admin/products?search=${search}&page=${page}`, {
        headers: { "Accept": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            renderProducts(data.products);
            renderPagination(data.currentPage, data.totalPages);
        }
    })
    .catch(() => showToast("Failed to load products", "danger"));
}

document.getElementById("paginationContainer").addEventListener("click", (e) => {
    const btn = e.target.closest(".page-link");
    if (!btn) return;
    fetchProducts(parseInt(btn.dataset.page));
});

// Render Products

function renderProducts(products) {
    const tbody = document.getElementById("productTableBody");
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-3">No products found.</td></tr>`;
        return;
    }
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.images[0].url}"
                    width="55" height="55"
                    style="object-fit:cover;border-radius:10px">
            </td>
            <td>${product.name}</td>
            <td>${product.brand ? product.brand.name : ""}</td>
            <td>${product.category ? product.category.name : ""}</td>
            <td>₹${product.price}</td>
            <td>${product.stock}</td>
            <td>${product.isActive
                ? `<span class="badge bg-success">Active</span>`
                : `<span class="badge bg-secondary">Disabled</span>`}
            </td>
            <td>
                <button class="btn btn-sm btn-outline-info editBtn"
                    data-id="${product._id}"
                    data-name="${product.name}"
                    data-description="${product.description}"
                    data-price="${product.price}"
                    data-stock="${product.stock}"
                    data-brand="${product.brand ? product.brand._id : ''}"
                    data-category="${product.category ? product.category._id : ''}"
                    data-images='${JSON.stringify(product.images)}'
                    data-has-offer="${product.hasOffer}"
                    data-offer-percent="${product.offerPercent}">
                    <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger deleteBtn"
                    data-id="${product._id}"
                    data-active="${product.isActive}">
                    <i class="fa fa-power-off"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

// Edit Image Slots

for (let i = 0; i <= 4; i++) {
    document.getElementById(`editImage_${i}`).addEventListener("change", function () {
        if (this.files[0]) {
            slots[i] = { type: "new", file: this.files[0] };
            renderEditPreviews();
        }
    });
}

function renderEditPreviews() {
    const preview = document.getElementById("editProductImagePreview");
    preview.innerHTML = "";
    slots.forEach((slot, i) => {
        const wrapper = document.createElement("div");
        wrapper.style.cssText = "position:relative;width:80px;height:80px;";
        if (slot.type === "existing" || slot.type === "new") {
            const src = slot.type === "existing" ? slot.url : URL.createObjectURL(slot.file);
            wrapper.innerHTML = `
                <img src="${src}" style="width:80px;height:80px;object-fit:cover;" class="rounded">
                <button onclick="removeSlot(${i})"
                    style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;
                           border-radius:50%;background:red;color:white;border:none;
                           font-size:12px;cursor:pointer;">✕</button>`;
        } else {
            wrapper.innerHTML = `
                <label for="editImage_${i}"
                    style="width:80px;height:80px;border:2px dashed #555;border-radius:8px;
                           display:flex;align-items:center;justify-content:center;
                           cursor:pointer;color:#888;">+</label>`;
        }
        preview.appendChild(wrapper);
    });
}

function removeSlot(i) {
    slots[i] = { type: "empty" };
    document.getElementById(`editImage_${i}`).value = "";
    renderEditPreviews();
}

// Search

let timer;
document.getElementById("searchInput").addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => fetchProducts(1), 400);
});

// Add Product

document.getElementById("saveProductBtn").addEventListener("click", async () => {
    const name = document.getElementById("productName").value.trim();
    const description = document.getElementById("productDesc").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value);
    const brand = document.getElementById("productBrand").value;
    const category = document.getElementById("productCategory").value;
    const errorEl = document.getElementById("productError");

    if (!name) { showError("productError", "Product name is required."); return; }
    if (name.length < 2) { showError("productError", "Name must be at least 2 characters."); return; }
    if (!description) { showError("productError", "Description is required."); return; }
    if (description.length < 5) { showError("productError", "Description must be at least 5 characters."); return; }
    if (!price || isNaN(price) || price <= 0) { showError("productError", "Price must be a positive number."); return; }
    if (isNaN(stock) || stock < 0) { showError("productError", "Stock must be 0 or more."); return; }
    if (!brand) { showError("productError", "Please select a brand."); return; }
    if (!category) { showError("productError", "Please select a category."); return; }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("brand", brand);
    formData.append("category", category);

    for (let i = 0; i <= 4; i++) {
        const file = document.getElementById(`addImage_${i}`).files[0];
        if (!file) {
            showError("productError", `Image ${i + 1} is required.`);
            return;
        }
        formData.append(`image_${i}`, file);
    }

    hideError("productError");

    try {
        const response = await fetch("/admin/products", { method: "POST", body: formData });
        const data = await response.json();
        if (data.success) {
            Swal.fire("Success!", data.message, "success").then(() => window.location.reload());
        } else {
            showError("productError", data.message);
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});

// Event Delegation

document.getElementById("productTableBody").addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".editBtn");
    const deleteBtn = e.target.closest(".deleteBtn");

    if (editBtn) {
        document.getElementById("editProductName").value = editBtn.dataset.name;
        document.getElementById("editProductDesc").value = editBtn.dataset.description;
        document.getElementById("editProductPrice").value = editBtn.dataset.price;
        document.getElementById("editProductStock").value = editBtn.dataset.stock;
        document.getElementById("editProductBrand").value = editBtn.dataset.brand;
        document.getElementById("editProductCategory").value = editBtn.dataset.category;
        document.getElementById("editHasOffer").checked = editBtn.dataset.hasOffer === "true";
        document.getElementById("editOfferPercent").value = editBtn.dataset.offerPercent || 0;

        const images = JSON.parse(editBtn.dataset.images || "[]");
        slots = Array(5).fill(null).map((_, i) => {
            const img = images[i];
            if (img) return { type: "existing", url: img.url, public_id: img.public_id };
            return { type: "empty" };
        });

        renderEditPreviews();
        for (let i = 0; i <= 4; i++) document.getElementById(`editImage_${i}`).value = "";
        document.getElementById("saveEditProductBtn").dataset.id = editBtn.dataset.id;
        hideError("editProductError");
        new bootstrap.Modal(document.getElementById("editProductModal")).show();
        return;
    }

    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const isActive = deleteBtn.dataset.active === "true";
        try {
            const result = await Swal.fire({
                title: isActive ? "Disable Product?" : "Enable Product?",
                text: isActive ? "Product will be hidden from shop." : "Product will be visible again.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                confirmButtonText: isActive ? "Yes, disable it." : "Yes, enable it."
            });
            if (!result.isConfirmed) return;

            const response = await fetch(`/admin/products/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (data.success) {
                Swal.fire("Success!", data.message, "success").then(() => window.location.reload());
            } else {
                Swal.fire("Error!", data.message, "error");
            }
        } catch (error) {
            Swal.fire("Error!", "Something went wrong. Try again.", "error");
        }
    }
});

// Edit Product - Save

document.getElementById("saveEditProductBtn").addEventListener("click", async () => {
    const id = document.getElementById("saveEditProductBtn").dataset.id;
    const name = document.getElementById("editProductName").value.trim();
    const description = document.getElementById("editProductDesc").value.trim();
    const price = parseFloat(document.getElementById("editProductPrice").value);
    const stock = parseInt(document.getElementById("editProductStock").value);
    const brand = document.getElementById("editProductBrand").value;
    const category = document.getElementById("editProductCategory").value;
    const hasOffer = document.getElementById("editHasOffer").checked;
    const offerPercent = document.getElementById("editOfferPercent").value;

    if (!name) { showError("editProductError", "Product name is required."); return; }
    if (name.length < 2) { showError("editProductError", "Name must be at least 2 characters."); return; }
    if (!description) { showError("editProductError", "Description is required."); return; }
    if (description.length < 5) { showError("editProductError", "Description must be at least 5 characters."); return; }
    if (!price || isNaN(price) || price <= 0) { showError("editProductError", "Price must be a positive number."); return; }
    if (isNaN(stock) || stock < 0) { showError("editProductError", "Stock must be 0 or more."); return; }
    if (!brand) { showError("editProductError", "Please select a brand."); return; }
    if (!category) { showError("editProductError", "Please select a category."); return; }
    if (hasOffer) {
        const op = parseFloat(offerPercent);
        if (!offerPercent || isNaN(op) || op <= 0) { showError("editProductError", "Offer percentage must be a positive number."); return; }
        if (op > 100) { showError("editProductError", "Offer percentage cannot exceed 100."); return; }
    }
    if (slots.some(s => s.type === "empty")) {
        showError("editProductError", "All 5 image slots must be filled.");
        return;
    }

    hideError("editProductError");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("brand", brand);
    formData.append("category", category);
    formData.append("hasOffer", hasOffer ? "on" : "off");
    formData.append("offerPercent", offerPercent);

    slots.forEach((slot, i) => {
        if (slot.type === "new") {
            formData.append(`image_${i}`, slot.file);
        } else if (slot.type === "existing") {
            formData.append(`existing_${i}`, slot.public_id);
        }
    });

    try {
        const response = await fetch(`/admin/products/${id}`, { method: "PATCH", body: formData });
        const data = await response.json();
        if (data.success) {
            Swal.fire("Updated!", data.message, "success").then(() => window.location.reload());
        } else {
            showError("editProductError", data.message);
        }
    } catch (error) {
        console.log(error)
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});


document.addEventListener("DOMContentLoaded", () => fetchProducts(1));