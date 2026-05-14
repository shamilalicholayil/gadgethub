// Toast
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

    document.querySelectorAll(".statusSelect").forEach(select => {
        select.addEventListener("change", async () => {
            const orderId     = select.dataset.id;
            const orderStatus = select.value;
            const res = await fetch(`/admin/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderStatus })
            });
            const data = await res.json();
            showToast(data.message, data.success ? "success" : "danger");
        });
    });

// Filter
document.getElementById("orderStatus").addEventListener("change", (e) => {
    fetch(`/admin/orders?status=${e.target.value}`, {
            headers: { "Accept": "application/json" }
        })
        .then(res => res.json())
        .then(data => { if (data.success) renderOrders(data.orders); })
        .catch((error) => showToast("Filter failed", "danger"));
});

// Render Orders
function renderOrders(orders) {
    const tbody = document.getElementById("orderTableBody");
    if(orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary py-4">No orders yet.</td></tr>`
    } else {
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td class="text-secondary small">${order._id.toString().slice(-6).toUpperCase()}</td>
                <td>
                    <p class="mb-0 small">${order.user.name}</p>
                    <small class="text-secondary">${order.user.email}</small>
                </td>
                <td class="text-secondary small">${new Date(order.createdAt).toDateString()}</td>
                <td class="text-info">₹${order.totalAmount}</td>
                <td>
                    <span class="badge ${order.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning text-dark'}">
                        ${order.paymentMethod.toUpperCase()}
                    </span>
                </td>
                <td>
                    <span class="badge
                        ${order.orderStatus === 'delivered' ? 'bg-success'
                        : order.orderStatus === 'cancelled' ? 'bg-danger'
                        : order.orderStatus === 'returned' ? 'bg-secondary'
                        : 'bg-warning text-dark'}">
                        ${order.orderStatus.toUpperCase()}
                    </span>
                </td>
                <td>
                    <a href="/admin/orders/${order._id}">details</a>
                </td>
            </tr>
        `).join("");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("/admin/orders", { headers: { "Accept": "application/json" } })
        .then(res => res.json())
        .then(data => { if (data.success) renderOrders(data.orders); })
        .catch(() => showToast("Failed to load orders", "danger"));
});