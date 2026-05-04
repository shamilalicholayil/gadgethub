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