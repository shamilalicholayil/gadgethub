document.querySelectorAll(".addToCartBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        try {
            const res = await fetch(`/cart/${id}`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                btn.innerHTML = `<i class="fa fa-check"></i>`;
                btn.disabled = true;
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Something went wrong. Try again.");
        }
    });
});

document.querySelectorAll(".removeWishlistBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const res = await fetch(`/wishlist/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) location.reload();
        else alert(data.message);
    });
});