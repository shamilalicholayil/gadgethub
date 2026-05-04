let slots = [];

// Render Pagination
function renderPagination(currentPage, totalPages) {
    const container = document.getElementById("paginationContainer");
    container.innerHTML = "";

    for(let i = 1; i <= totalPages; i++) {
        container.innerHTML += `
            <li class="page-item ${i === currentPage ? "active" : ""}">
                <button class="page-link" data-page="${i}">${i}</button>
            </li>
        `;
    }
}
function fetchProducts(page = 1) {
    const search = document.getElementById("searchInput").value;
    const url = `/admin/products?search=${search}&page=${page}`;

    fetch(url, { headers: { "Accept": "application/json" }})
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                renderProducts(data.products);
                renderPagination(data.currentPage, data.totalPages)
            }
        })
        .catch(() => showToast("Failed to load products", "danger"))

}

document.getElementById("paginationContainer")
    .addEventListener("click", (e) => {
        const btn = e.target.closest(".page-link");
        if(!btn) return;
        fetchProducts(parseInt(btn.dataset.page));
    });


// Toast
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

// Render Products
function renderProducts(products) {
    const tbody = document.getElementById("productTableBody");
    if(products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-3">
                    No products found.
                </td>
            </tr>`;
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
                : `<span class="badge bg-secondary">Disabled</span>`
            }</td>
            <td>
                <button class="btn btn-sm btn-outline-info editBtn"
                        data-id="${product._id}"
                        data-name="${product.name}"
                        data-description="${product.description}"
                        data-price="${product.price}"
                        data-stock="${product.stock}"
                        data-brand="${product.brand ? product.brand._id : ''}"
                        data-category="${product.category ? product.category._id : '' }"
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

for(let i = 0; i <= 4; i++) {
    document.getElementById(`editImage_${i}`)
        .addEventListener("change", function() {
            if(this.files[0]) {
                slots[i] = { type: "new", file: this.files[0] };
                renderEditPreviews();
            }
        });
}

// Render Edit Preview
function renderEditPreviews() {
    const preview = document.getElementById("editProductImagePreview");
    preview.innerHTML = "";

    slots.forEach((slot, i) => {
        const wrapper = document.createElement("div");
        wrapper.style.cssText = "position:relative;width:80px;height:80px;";

        if(slot.type === "existing" || slot.type === "new") {
            const src = slot.type === "existing" 
                ? slot.url 
                : URL.createObjectURL(slot.file);

            wrapper.innerHTML = `
                <img src="${src}" 
                    style="width:80px;height:80px;object-fit:cover;" 
                    class="rounded">
                <button onclick="removeSlot(${i})" 
                        style="position:absolute;top:-6px;right:-6px;
                            width:20px;height:20px;border-radius:50%;
                            background:red;color:white;border:none;
                            font-size:12px;cursor:pointer;">✕</button>
            `;
        } else {
            // empty slot
            wrapper.innerHTML = `
                <label for="editImage_${i}" 
                    style="width:80px;height:80px;border:2px dashed #555;
                            border-radius:8px;display:flex;align-items:center;
                            justify-content:center;cursor:pointer;color:#888;">
                    +
                </label>
            `;
        }
        preview.appendChild(wrapper);
    });
}

// Remove Slot
function removeSlot(i) {
    slots[i] = { type: "empty" };
    document.getElementById(`editImage_${i}`).value = "";
    renderEditPreviews();
}

// Search Product
let timer;
document.getElementById("searchInput")
    .addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fetchProducts(1);
        }, 400);
    });


// Add Product
document.getElementById("saveProductBtn")
    .addEventListener("click", async () => {

    const name = document.getElementById("productName").value.trim();
    const description = document.getElementById("productDesc").value.trim();
    const price = document.getElementById("productPrice").value.trim();
    const stock = document.getElementById("productStock").value.trim();
    const brand = document.getElementById("productBrand").value;
    const category = document.getElementById("productCategory").value;
    const errorEl = document.getElementById("productError");

    if(!name || !description || !price || !stock || !brand || !category) {
        errorEl.classList.remove("d-none");
        errorEl.textContent = "All fields are required.";
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("brand", brand);
    formData.append("category", category);

    for(let i = 0; i <= 4; i++) {
        const file = document.getElementById(`addImage_${i}`).files[0];
        if(!file) {
            errorEl.classList.remove("d-none");
            errorEl.textContent = `Image ${i + 1} is required.`;
            return;
        }
        formData.append(`image_${i}`, file);
    }

    try {
        const response = await fetch("/admin/products", {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        if(data.success) {
            Swal.fire("Success!", data.message, "success")
                .then(() => window.location.reload());
        } else {
            Swal.fire("Error!", data.message, "error");
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});

// Edit Product


// Event Delegation
document.getElementById("productTableBody")
    .addEventListener("click", async (e) => {
        const editBtn = e.target.closest(".editBtn");
        const deleteBtn = e.target.closest(".deleteBtn");

        if(editBtn) {
            const id = editBtn.dataset.id;

            document.getElementById("editProductName").value = editBtn.dataset.name;
            document.getElementById("editProductDesc").value = editBtn.dataset.description;
            document.getElementById("editProductPrice").value = editBtn.dataset.price;
            document.getElementById("editProductStock").value = editBtn.dataset.stock;
            document.getElementById("editProductBrand").value = editBtn.dataset.brand;
            document.getElementById("editProductCategory").value = editBtn.dataset.category;
            document.getElementById("editHasOffer").checked = editBtn.dataset.hasOffer === "true";
            document.getElementById("editOfferPercent").value = editBtn.dataset.offerPercent || 0;
            
            const images = JSON.parse(editBtn.dataset.images || "[]");

            // Build slots from existing images
            slots = Array(5).fill(null).map((_, i) => {
                const img = images[i];
                if(img) return { type: "existing", url: img.url, public_id: img.public_id };
                return { type: "empty" };
            });

            renderEditPreviews();

            // clear previous file inputs
            for(let i = 0; i <= 4; i++) {
                document.getElementById(`editImage_${i}`).value = "";
            }

            document.getElementById("saveEditProductBtn").dataset.id = id;
            new bootstrap.Modal(document.getElementById("editProductModal")).show();
            return;
        }
        if(deleteBtn) {
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

                if(!result.isConfirmed) return;

                const response = await fetch(`/admin/products/${id}`, {
                    method: "DELETE"
                });
                const data = await response.json();

                if(data.success) {
                    Swal.fire("Success!", data.message, "success")
                        .then(() => window.location.reload());
                } else {
                    Swal.fire("Error!", data.message, "error");
                }
            } catch (error) {
                Swal.fire("Error!", "Something went wrong. Try again.", "error");
            }
        }
    });



// Edit Save
document.getElementById("saveEditProductBtn")
    .addEventListener("click", async () => {

    const id = document.getElementById("saveEditProductBtn").dataset.id;
    const name = document.getElementById("editProductName").value.trim();
    const description = document.getElementById("editProductDesc").value.trim();
    const price = document.getElementById("editProductPrice").value.trim();
    const stock = document.getElementById("editProductStock").value.trim();
    const brand = document.getElementById("editProductBrand").value;
    const category = document.getElementById("editProductCategory").value;
    const hasOffer = document.getElementById("editHasOffer").checked;
    const offerPercent = document.getElementById("editOfferPercent").value;
    const errorEl = document.getElementById("editProductError");

    if(!name || !description || !price || !stock || !brand || !category) {
        errorEl.classList.remove("d-none");
        errorEl.textContent = "All fields are required.";
        return;
    }

    const emptySlots = slots.filter(s => s.type === "empty");
    if(emptySlots.length > 0) {
        errorEl.classList.remove("d-none");
        errorEl.textContent = "All 5 image slots must be filled.";
        return;
    }

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
        if(slot.type === "new") {
            formData.append(`image_${i}`, slot.file);
        } else if(slot.type === "existing") {
            formData.append(`existing_${i}`, slot.public_id);
        }
    });

    try {
        const response = await fetch(`/admin/products/${id}`, {
            method: "PATCH",
            body: formData
        });
        const data = await response.json();
        if(data.success) {
            Swal.fire("Updated!", data.message, "success")
                .then(() => window.location.reload());
        } else {
            Swal.fire("Error!", data.message, "error");
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts(1);
});