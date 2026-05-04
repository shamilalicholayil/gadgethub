// Toast
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

// Render Coupon
function renderCoupons(coupons) {
    const tbody = document.getElementById("couponTableBody");
    if(coupons.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-3">
                    No products found.
                </td>
            </tr>`;
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
            <td>
                ${coupon.isActive
                    ? `<span class="badge bg-success">Active</span>`
                    : `<span class="badge bg-secondary">Inactive</span>`}
            </td>
            <td>
                <button type="button" 
                        class="btn btn-sm btn-outline-info editBtn"
                        data-id="${coupon._id}"
                        data-code="${coupon.code}"
                        data-type="${coupon.discountType}"
                        data-value="${coupon.discountValue}"
                        data-min-order="${coupon.minOrderValue}"
                        data-expiry="${coupon.expiryDate}"
                        data-usage-limit="${coupon.usageLimit}"
                        data-used-count="${coupon.usedCount}">
                    <i class="fa fa-edit"></i>
                </button>
                <button type="button" 
                        class="btn btn-sm btn-outline-danger deleteBtn"
                        data-id="${coupon._id}"
                        data-active="${coupon.isActive}">
                    <i class="fa fa-power-off"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

// Search
let timer;
document.getElementById("searchInput")
    .addEventListener("input", (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fetch(`/admin/coupons?search=${e.target.value}`, {
                headers: { "Accept": "application/json"}
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) renderCoupons(data.coupons)
            })
            .catch(() => showToast("Search failed", "danger"));
        }, 400);
    });


// Add Coupon
document.getElementById("saveCouponBtn")
    .addEventListener("click", async () => {

        const code = document.getElementById("couponCodeInput").value.trim();
        const discountType = document.getElementById("couponType").value.trim();
        const discountValue = document.getElementById("couponValue").value.trim();
        const minOrderValue = document.getElementById("couponMinOrder").value.trim();
        const expiryDate = document.getElementById("couponExpiry").value.trim();
        const usageLimit = document.getElementById("couponUsageLimit").value.trim();

        if(!code || !discountType || !discountValue || !minOrderValue || !expiryDate || !usageLimit) {
            document.getElementById("couponError").classList.remove("d-none");
            document.getElementById("couponError").textContent = "All fields are required.";
            return;
        }
        try {
            const response = await fetch("/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, discountType, discountValue, minOrderValue, expiryDate, usageLimit })
            });

            const data = await response.json();

            if(data.success) {
                Swal.fire("New Coupon Added Successfully.", data.message, "success")
                    .then(() => window.location.reload());
            } else {
                Swal.fire("Error!", data.message, "error");
                document.getElementById("couponError").classList.remove("d-none");
                document.getElementById("couponError").textContent = data.message;
            }
        } catch (error) {
            Swal.fire("Error!", "Something went wrong. Try again.", "error");
        }
    });


// Event Delegation
document.getElementById("couponTableBody")
    .addEventListener("click", async (e) => {
        const editBtn = e.target.closest(".editBtn");
        const deleteBtn = e.target.closest(".deleteBtn");

        if(editBtn) {
            const id = editBtn.dataset.id;
            const code = editBtn.dataset.code;
            const discountType = editBtn.dataset.type;
            const discountValue = editBtn.dataset.value;
            const minOrderValue = editBtn.dataset.minOrder;
            const expiryDate = new Date(editBtn.dataset.expiry).toISOString().split("T")[0];
            const usageLimit = editBtn.dataset.usageLimit;

            document.getElementById("editCouponCode").value = code;
            document.getElementById("editCouponType").value = discountType;
            document.getElementById("editCouponValue").value = discountValue;
            document.getElementById("editCouponMinOrder").value = minOrderValue;
            document.getElementById("editCouponExpiry").value = expiryDate;
            document.getElementById("editCouponUsageLimit").value = usageLimit;

            document.getElementById("saveEditCouponBtn").dataset.id = id;

            new bootstrap.Modal(document.getElementById("editCouponModal")).show();
        }

        if(deleteBtn) {
            const id = deleteBtn.dataset.id;
            const isActive = deleteBtn.dataset.active === "true";

            try{
                const result = await Swal.fire({
                    title: isActive ? "Disable Coupon?" : "Enable Coupon?",
                    text: isActive ? "Coupon will be hidden from shop." : "Coupon will be visible again.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    confirmButtonText: isActive ? "Yes, disable it." : "Yes, enable it."
                });

                if(!result.isConfirmed) return;

                const response = await fetch(`/admin/coupons/${id}`, {
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


// Edit Coupon


document.getElementById("saveEditCouponBtn")
    .addEventListener("click", async () => {
        const id = document.getElementById("saveEditCouponBtn").dataset.id;

        const code = document.getElementById("editCouponCode").value.trim();
        const discountType = document.getElementById("editCouponType").value.trim();
        const discountValue = document.getElementById("editCouponValue").value.trim();
        const minOrderValue = document.getElementById("editCouponMinOrder").value.trim();
        const expiryDate  = document.getElementById("editCouponExpiry").value.trim();
        const usageLimit = document.getElementById("editCouponUsageLimit").value.trim();

        if(!code || !discountType || !discountValue || !minOrderValue || !expiryDate || !usageLimit) {
            document.getElementById("editCouponError").classList.remove("d-none");
            document.getElementById("editCouponError").textContent = "All fields are required.";
            return;
        }

        try {
            const response = await fetch(`/admin/coupons/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, discountType, discountValue, minOrderValue, expiryDate, usageLimit })
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

//Delete Coupon

