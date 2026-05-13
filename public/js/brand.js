// Toast
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

// Render Brands
function renderBrands(brands) {
    const tbody = document.getElementById("brandTableBody");
    if (brands.length === 0) {
        tbody.innerHTML = `<div class="text-center py-5 text-secondary">Brand not found.</div>`;
        return;
    }
    tbody.innerHTML = brands.map(brand => `
        <div class="col-md-4">
            <div class="card glass p-4 h-100">
                <h5 class="fw-bold text-info mb-3">${brand.name}</h5>
                ${brand.isActive
                    ?`<span class="badge bg-success mb-3">Active</span>`
                    :`<span class="badge bg-secondary mb-3">Inactive</span>`
                }
                <div class="d-flex gap-2 mt-auto">
                    <button type="button"
                            class="btn btn-sm btn-outline-info w-100 editBtn"
                            data-id="${brand._id}"
                            data-name="${brand.name}">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button type="button"
                            class="btn btn-sm btn-outline-danger w-100 deleteBtn"
                            data-id="${brand._id}"
                            data-active="${brand.isActive}">
                        <i class="fa fa-power-off"></i>
                        ${brand.isActive
                            ?`Disable`
                            :`Enable`
                        }
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// Real-time validation — Add Brand
document.getElementById("brandNameInput").addEventListener("input", function () {
    const value = this.value.trim();
    const error = document.getElementById("brandError");
    if (!value) {
        error.textContent = "Brand name is required.";
        error.classList.remove("d-none");
    } else if (value.length < 2) {
        error.textContent = "Brand name must be at least 2 characters.";
        error.classList.remove("d-none");
    } else if (!/^[a-zA-Z0-9\s\-&.]+$/.test(value)) {
        error.textContent = "Brand name contains invalid characters.";
        error.classList.remove("d-none");
    } else {
        error.textContent = "";
        error.classList.add("d-none");
    }
});

// Real-time validation — Edit Brand
document.getElementById("editBrandInput").addEventListener("input", function () {
    const value = this.value.trim();
    const error = document.getElementById("editBrandError");
    if (!value) {
        error.textContent = "Brand name is required.";
        error.classList.remove("d-none");
    } else if (value.length < 2) {
        error.textContent = "Brand name must be at least 2 characters.";
        error.classList.remove("d-none");
    } else if (!/^[a-zA-Z0-9\s\-&.]+$/.test(value)) {
        error.textContent = "Brand name contains invalid characters.";
        error.classList.remove("d-none");
    } else {
        error.textContent = "";
        error.classList.add("d-none");
    }
});

// Clear errors
document.getElementById("addBrandModal").addEventListener("hidden.bs.modal", () => {
    document.getElementById("brandNameInput").value = "";
    document.getElementById("brandError").classList.add("d-none");
    document.getElementById("brandError").textContent = "";
});

document.getElementById("editBrandModal").addEventListener("hidden.bs.modal", () => {
    document.getElementById("editBrandError").classList.add("d-none");
    document.getElementById("editBrandError").textContent = "";
});

// Add Brand
document.getElementById("saveBrandBtn").addEventListener("click", async () => {
    const name = document.getElementById("brandNameInput").value.trim();
    const error = document.getElementById("brandError");

    if (!name) {
        error.classList.remove("d-none");
        error.textContent = "Brand name is required.";
        return;
    }
    if (name.length < 2) {
        error.classList.remove("d-none");
        error.textContent = "Brand name must be at least 2 characters.";
        return;
    }
    if (!/^[a-zA-Z0-9\s\-&.]+$/.test(name)) {
        error.classList.remove("d-none");
        error.textContent = "Brand name contains invalid characters.";
        return;
    }

    try {
        const response = await fetch("/admin/brands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        const data = await response.json();
        if (data.success) {
            Swal.fire("Success!", data.message, "success")
                .then(() => window.location.reload());
        } else {
            error.classList.remove("d-none");
            error.textContent = data.message;
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});

// Edit Brand — save
document.getElementById("saveEditBrandBtn").addEventListener("click", async () => {
    const id = document.getElementById("saveEditBrandBtn").dataset.id;
    const name = document.getElementById("editBrandInput").value.trim();
    const error = document.getElementById("editBrandError");

    if (!name) {
        error.classList.remove("d-none");
        error.textContent = "Brand name is required.";
        return;
    }
    if (name.length < 2) {
        error.classList.remove("d-none");
        error.textContent = "Brand name must be at least 2 characters.";
        return;
    }
    if (!/^[a-zA-Z0-9\s\-&.]+$/.test(name)) {
        error.classList.remove("d-none");
        error.textContent = "Brand name contains invalid characters.";
        return;
    }

    try {
        const response = await fetch(`/admin/brands/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        const data = await response.json();
        if (data.success) {
            Swal.fire("Updated!", data.message, "success")
                .then(() => window.location.reload());
        } else {
            error.classList.remove("d-none");
            error.textContent = data.message;
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});

// Search
let timer;
document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        fetch(`/admin/brands?search=${e.target.value}`, {
            headers: { "Accept": "application/json" }
        })
        .then(res => res.json())
        .then(data => { if (data.success) renderBrands(data.brands); })
        .catch((error) => showToast("Search failed", "danger"));
    }, 400);
});

// Event Delegation
document.getElementById("brandTableBody").addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".editBtn");
    const deleteBtn = e.target.closest(".deleteBtn");

    if (editBtn) {
        const id = editBtn.dataset.id;
        const name = editBtn.dataset.name;

        document.getElementById("editBrandInput").value = name;
        document.getElementById("saveEditBrandBtn").dataset.id = id;

        const modal = new bootstrap.Modal(document.getElementById("editBrandModal"));
        modal.show();
    }

    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const isActive = deleteBtn.dataset.active === "true";

        try {
            const result = await Swal.fire({
                title: isActive ? "Disable Brand?" : "Enable Brand?",
                text: isActive ? "Brand will be hidden from shop." : "Brand will be visible again.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                confirmButtonText: isActive ? "Yes, disable it." : "Yes, enable it."
            });

            if (!result.isConfirmed) return;

            let enableProducts = false;
            if (!isActive) {
                const productResult = await Swal.fire({
                    title: "Enable related products?",
                    text: "Do you want to enable all products in this brand too?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Yes, enable all",
                    cancelButtonText: "No, keep them disabled"
                });
                enableProducts = productResult.isConfirmed;
            }

            const response = await fetch(`/admin/brands/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enableProducts })
            });
            const data = await response.json();

            if (data.success) {
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

document.addEventListener("DOMContentLoaded", () => {
    fetch("/admin/brands", { headers: { "Accept": "application/json" } })
        .then(res => res.json())
        .then(data => { if (data.success) renderBrands(data.brands); })
        .catch(() => showToast("Failed to load brands", "danger"));
});