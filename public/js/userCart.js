const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");

function showToast(message) {
    const toast = document.getElementById("cartToast");
    const toastMessage = document.getElementById("cartToastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-danger`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

if(stockWarning) {
    showToast("Some item quantities were adjusted to match available stock.");
}

function checkCartEmpty() {
    const remaining = document.querySelectorAll("#cartItems .card").length;
    if(remaining === 0) emptyCart.classList.remove("d-none");
}

function clearCouponUI() {
    document.getElementById("couponInput").value = "";
    const msgEl = document.getElementById("couponMessage");
    msgEl.className = "small d-none";
    msgEl.textContent = "";
}

function updateCouponUI(data) {
    const msgEl = document.getElementById("couponMessage");
    if(data.couponCleared) {
        clearCouponUI();
        document.getElementById("cartSubtotal").textContent = data.total;
        document.getElementById("cartTotal").textContent = `₹${data.total}`;
        showToast("Coupon removed — cart total fell below minimum order value.");
    } else if(data.discountAmount > 0) {
        document.getElementById("cartSubtotal").textContent = data.total;
        document.getElementById("cartTotal").textContent = `₹${data.finalTotal}`;
        msgEl.className = "small text-success";
        msgEl.classList.remove("d-none");
        msgEl.textContent = `🎉 Coupon applied! You saved ₹${data.discountAmount}`;
    } else {
        document.getElementById("cartSubtotal").textContent = data.total;
        document.getElementById("cartTotal").textContent = `₹${data.total}`;
    }
}

// Quantity Update
document.querySelectorAll(".btn-qty").forEach(btn => {
    btn.addEventListener("click", async () => {
        const productId = btn.dataset.id;
        const action = btn.dataset.action;
        try {
            const response = await fetch(`/cart/${productId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });
            const data = await response.json();
            if(data.success) {
                if(data.removed) {
                    btn.closest(".card").remove();
                    checkCartEmpty();
                } else {
                    btn.parentElement.querySelector("span").textContent = data.newQuantity;
                }
                const counter = document.getElementById("navCartCount");
                if(counter) counter.textContent = data.cartCount;
                updateCouponUI(data);
            } else {
                showToast(data.message);
            }
        } catch(error) {
            showToast("Something went wrong.");
        }
    });
});

// Remove Item
document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const productId = btn.dataset.id;
        try {
            const response = await fetch(`/cart/${productId}`, { method: "DELETE" });
            const data = await response.json();
            if(data.success) {
                btn.closest(".card").remove();
                checkCartEmpty();
                const counter = document.getElementById("navCartCount");
                if(counter) counter.textContent = data.cartCount;
                updateCouponUI(data);
            } else {
                showToast(data.message);
            }
        } catch(error) {
            showToast("Something went wrong.");
        }
    });
});

// Apply Coupon
document.getElementById("applyCouponBtn").addEventListener("click", async () => {
    const code = document.getElementById("couponInput").value.trim();
    const orderTotal = document.getElementById("cartSubtotal").textContent.replace("₹", "");
    const msgEl = document.getElementById("couponMessage");

    if(!code) {
        msgEl.className = "small text-danger";
        msgEl.classList.remove("d-none");
        msgEl.textContent = "Please enter a coupon code.";
        return;
    }

    try {
        const response = await fetch("/apply-coupon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, orderTotal })
        });
        const data = await response.json();

        if(data.success) {
            document.getElementById("cartTotal").textContent = `₹${data.finalTotal}`;
            msgEl.className = "small text-success";
            msgEl.classList.remove("d-none");
            msgEl.textContent = `🎉 Coupon applied! You saved ₹${data.discountAmount}`;
        } else {
            msgEl.className = "small text-danger";
            msgEl.classList.remove("d-none");
            msgEl.textContent = data.message;
        }
    } catch(error) {
        msgEl.className = "small text-danger";
        msgEl.classList.remove("d-none");
        msgEl.textContent = "Something went wrong.";
    }
});

// Fetch Coupons
document.getElementById("couponModal").addEventListener("show.bs.modal", async () => {
    const res = await fetch("/coupons");
    const data = await res.json();
    const list = document.getElementById("couponList");

    if(!data.success || data.coupons.length === 0) {
        list.innerHTML = `<p class="text-secondary text-center">No coupons available.</p>`;
        return;
    }

    list.innerHTML = data.coupons.map(coupon => `
        <div class="d-flex justify-content-between align-items-center border border-secondary rounded p-3 mb-2">
            <div>
                <h6 class="text-info mb-1">${coupon.code}</h6>
                <small class="text-secondary">
                    ${coupon.discountType === "percent"
                        ? `${coupon.discountValue}% off`
                        : `₹${coupon.discountValue} off`}
                    · Min order ₹${coupon.minOrderValue}
                    · Expires ${new Date(coupon.expiryDate).toLocaleDateString()}
                </small>
            </div>
            <button class="btn btn-outline-info btn-sm copy-btn" data-code="${coupon.code}">Copy</button>
        </div>
    `).join("");
});

// Copy Button
document.getElementById("couponList").addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-btn");
    if(!btn) return;
    navigator.clipboard.writeText(btn.dataset.code);
    document.getElementById("couponInput").value = btn.dataset.code;
    btn.textContent = "Copied!";
    setTimeout(() => btn.textContent = "Copy", 2000);
});