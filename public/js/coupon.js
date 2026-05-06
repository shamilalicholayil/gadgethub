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

function validateCouponFields({ code, discountType, discountValue, minOrderValue, expiryDate, usageLimit }, errorId) {
    if(!code) { showError(errorId, "Coupon code is required."); return false; }
    if(!/^[A-Z0-9]{3,20}$/.test(code)) { showError(errorId, "Code must be 3–20 uppercase letters/numbers only."); return false; }
    if(!discountType) { showError(errorId, "Discount type is required."); return false; }
    if(!discountValue || isNaN(discountValue) || Number(discountValue) <= 0) { showError(errorId, "Discount value must be a positive number."); return false; }
    if(discountType === "percent" && Number(discountValue) > 100) { showError(errorId, "Percentage discount cannot exceed 100."); return false; }
    if(minOrderValue === "" || isNaN(minOrderValue) || Number(minOrderValue) < 0) { showError(errorId, "Minimum order value must be 0 or more."); return false; }
    if(!expiryDate) { showError(errorId, "Expiry date is required."); return false; }
    if(new Date(expiryDate) <= new Date()) { showError(errorId, "Expiry date must be in the future."); return false; }
    if(!usageLimit || isNaN(usageLimit) || Number(usageLimit) < 1) { showError(errorId, "Usage limit must be at least 1."); return false; }
    hideError(errorId);
    return true;
}

// Real-time Validation - Add Coupon
document.getElementById("couponCodeInput").addEventListener("input", function () {
    const value = this.value.trim().toUpperCase();
    if (!value) { showError("couponError", "Coupon code is required."); return; }
    if (!/^[A-Z0-9]{1,20}$/.test(value)) { showError("couponError", "Only uppercase letters and numbers allowed (max 20)."); return; }
    hideError("couponError");
});

document.getElementById("couponValue").addEventListener("input", function () {
    const value = Number(this.value);
    const type = document.getElementById("couponType").value;
    if (!this.value || value <= 0) { showError("couponError", "Discount value must be a positive number."); return; }
    if (type === "percent" && value > 100) { showError("couponError", "Percentage discount cannot exceed 100."); return; }
    hideError("couponError");
});

document.getElementById("couponType").addEventListener("change", function () {
    const value = Number(document.getElementById("couponValue").value);
    if (this.value === "percent" && value > 100) {
        showError("couponError", "Percentage discount cannot exceed 100.");
    } else {
        hideError("couponError");
    }
});

document.getElementById("couponMinOrder").addEventListener("input", function () {
    if (this.value === "" || Number(this.value) < 0) { showError("couponError", "Minimum order value must be 0 or more."); return; }
    hideError("couponError");
});

document.getElementById("couponExpiry").addEventListener("change", function () {
    if (!this.value) { showError("couponError", "Expiry date is required."); return; }
    if (new Date(this.value) <= new Date()) { showError("couponError", "Expiry date must be in the future."); return; }
    hideError("couponError");
});

document.getElementById("couponUsageLimit").addEventListener("input", function () {
    if (!this.value || Number(this.value) < 1) { showError("couponError", "Usage limit must be at least 1."); return; }
    hideError("couponError");
});

// Real-time Validation - Edit Coupon
document.getElementById("editCouponCode").addEventListener("input", function () {
    const value = this.value.trim().toUpperCase();
    if (!value) { showError("editCouponError", "Coupon code is required."); return; }
    if (!/^[A-Z0-9]{1,20}$/.test(value)) { showError("editCouponError", "Only uppercase letters and numbers allowed (max 20)."); return; }
    hideError("editCouponError");
});

document.getElementById("editCouponValue").addEventListener("input", function () {
    const value = Number(this.value);
    const type = document.getElementById("editCouponType").value;
    if (!this.value || value <= 0) { showError("editCouponError", "Discount value must be a positive number."); return; }
    if (type === "percent" && value > 100) { showError("editCouponError", "Percentage discount cannot exceed 100."); return; }
    hideError("editCouponError");
});

document.getElementById("editCouponType").addEventListener("change", function () {
    const value = Number(document.getElementById("editCouponValue").value);
    if (this.value === "percent" && value > 100) {
        showError("editCouponError", "Percentage discount cannot exceed 100.");
    } else {
        hideError("editCouponError");
    }
});

document.getElementById("editCouponMinOrder").addEventListener("input", function () {
    if (this.value === "" || Number(this.value) < 0) { showError("editCouponError", "Minimum order value must be 0 or more."); return; }
    hideError("editCouponError");
});

document.getElementById("editCouponExpiry").addEventListener("change", function () {
    if (!this.value) { showError("editCouponError", "Expiry date is required."); return; }
    if (new Date(this.value) <= new Date()) { showError("editCouponError", "Expiry date must be in the future."); return; }
    hideError("editCouponError");
});

document.getElementById("editCouponUsageLimit").addEventListener("input", function () {
    if (!this.value || Number(this.value) < 1) { showError("editCouponError", "Usage limit must be at least 1."); return; }
    hideError("editCouponError");
});

// Clear modals on close
document.getElementById("addCouponModal").addEventListener("hidden.bs.modal", () => {
    ["couponCodeInput", "couponValue", "couponMinOrder", "couponExpiry", "couponUsageLimit"].forEach(id => {
        document.getElementById(id).value = "";
    });
    document.getElementById("couponType").value = "percent";
    hideError("couponError");
});

document.getElementById("editCouponModal").addEventListener("hidden.bs.modal", () => {
    hideError("editCouponError");
});

// Render Coupons
function renderCoupons(coupons) {
    const tbody = document.getElementById("couponTableBody");
    if (coupons.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-3">No coupons found.</td></tr>`;
        return;
    }
    tbody.innerHTML = coupons.map(coupon => `
        <tr>
            <td>${coupon.code}</td>
            <td>${coupon.discountType}</td>
            <td>${coupon.discountValue}</td>
            <td>${coupon.minOrderValue}</td>
            <td>${new Date(coupon.expiryDate).toLocaleDateString("en-IN")}</td>
            <td>${coupon.usageLimit}</td>
            <td>${coupon.usedCount}</td>
            <td>${coupon.isActive
                ? `<span class="badge bg-success">Active</span>`
                : `<span class="badge bg-secondary">Inactive</span>`}
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-info editBtn"
                    data-id="${coupon._id}" data-code="${coupon.code}"
                    data-type="${coupon.discountType}" data-value="${coupon.discountValue}"
                    data-min-order="${coupon.minOrderValue}" data-expiry="${coupon.expiryDate}"
                    data-usage-limit="${coupon.usageLimit}" data-used-count="${coupon.usedCount}">
                    <i class="fa fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger deleteBtn"
                    data-id="${coupon._id}" data-active="${coupon.isActive}">
                    <i class="fa fa-power-off"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

// Search
let timer;
document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        fetch(`/admin/coupons?search=${e.target.value}`, {
            headers: { "Accept": "application/json" }
        })
        .then(res => res.json())
        .then(data => { if (data.success) renderCoupons(data.coupons); })
        .catch(() => showToast("Search failed", "danger"));
    }, 400);
});

// Add Coupon
document.getElementById("saveCouponBtn").addEventListener("click", async () => {
    const code = document.getElementById("couponCodeInput").value.trim().toUpperCase();
    const discountType = document.getElementById("couponType").value;
    const discountValue = document.getElementById("couponValue").value.trim();
    const minOrderValue = document.getElementById("couponMinOrder").value.trim();
    const expiryDate = document.getElementById("couponExpiry").value.trim();
    const usageLimit = document.getElementById("couponUsageLimit").value.trim();

    if (!validateCouponFields({ code, discountType, discountValue, minOrderValue, expiryDate, usageLimit }, "couponError")) return;

    try {
        const response = await fetch("/admin/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, discountType, discountValue, minOrderValue, expiryDate, usageLimit })
        });
        const data = await response.json();
        if (data.success) {
            Swal.fire("Success!", data.message, "success").then(() => window.location.reload());
        } else {
            showError("couponError", data.message);
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});

// Event Delegation
document.getElementById("couponTableBody").addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".editBtn");
    const deleteBtn = e.target.closest(".deleteBtn");

    if (editBtn) {
        document.getElementById("editCouponCode").value = editBtn.dataset.code;
        document.getElementById("editCouponType").value = editBtn.dataset.type;
        document.getElementById("editCouponValue").value = editBtn.dataset.value;
        document.getElementById("editCouponMinOrder").value = editBtn.dataset.minOrder;
        document.getElementById("editCouponExpiry").value = new Date(editBtn.dataset.expiry).toISOString().split("T")[0];
        document.getElementById("editCouponUsageLimit").value = editBtn.dataset.usageLimit;
        document.getElementById("saveEditCouponBtn").dataset.id = editBtn.dataset.id;
        new bootstrap.Modal(document.getElementById("editCouponModal")).show();
    }

    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const isActive = deleteBtn.dataset.active === "true";
        try {
            const result = await Swal.fire({
                title: isActive ? "Disable Coupon?" : "Enable Coupon?",
                text: isActive ? "Coupon will be hidden from shop." : "Coupon will be visible again.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                confirmButtonText: isActive ? "Yes, disable it." : "Yes, enable it."
            });
            if (!result.isConfirmed) return;

            const response = await fetch(`/admin/coupons/${id}`, { method: "DELETE" });
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

// Edit Coupon — Save
document.getElementById("saveEditCouponBtn").addEventListener("click", async () => {
    const id = document.getElementById("saveEditCouponBtn").dataset.id;
    const code = document.getElementById("editCouponCode").value.trim().toUpperCase();
    const discountType = document.getElementById("editCouponType").value;
    const discountValue = document.getElementById("editCouponValue").value.trim();
    const minOrderValue = document.getElementById("editCouponMinOrder").value.trim();
    const expiryDate = document.getElementById("editCouponExpiry").value.trim();
    const usageLimit = document.getElementById("editCouponUsageLimit").value.trim();

    if (!validateCouponFields({ code, discountType, discountValue, minOrderValue, expiryDate, usageLimit }, "editCouponError")) return;

    try {
        const response = await fetch(`/admin/coupons/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, discountType, discountValue, minOrderValue, expiryDate, usageLimit })
        });
        const data = await response.json();
        if (data.success) {
            Swal.fire("Updated!", data.message, "success").then(() => window.location.reload());
        } else {
            showError("editCouponError", data.message);
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});