// Toast
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

// Thumbnail Click
document.querySelectorAll(".thumbnail-row img").forEach(thumb => {
    thumb.addEventListener("click", () => {
        document.getElementById("mainImage").src = thumb.dataset.url;
        document.querySelectorAll(".thumbnail-row img").forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
        zoomBox.style.backgroundImage = `url('${thumb.dataset.url}')`;
    });
});

// Zoom
const container  = document.getElementById("imgContainer");
const lens       = document.getElementById("lens");
const zoomBox    = document.getElementById("zoomBox");
const mainImage  = document.getElementById("mainImage");
const ZOOM       = 2.5;

container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(lens.offsetWidth / 2,  Math.min(x, rect.width  - lens.offsetWidth  / 2));
    y = Math.max(lens.offsetHeight / 2, Math.min(y, rect.height - lens.offsetHeight / 2));

    lens.style.left    = (x - lens.offsetWidth  / 2) + "px";
    lens.style.top     = (y - lens.offsetHeight / 2) + "px";
    lens.style.display = "block";
    zoomBox.style.display = "block";

    const bgX = (x / rect.width)  * rect.width  * ZOOM - zoomBox.offsetWidth  / 2;
    const bgY = (y / rect.height) * rect.height * ZOOM - zoomBox.offsetHeight / 2;

    zoomBox.style.backgroundImage    = `url('${mainImage.src}')`;
    zoomBox.style.backgroundSize     = `${rect.width * ZOOM}px ${rect.height * ZOOM}px`;
    zoomBox.style.backgroundPosition = `-${bgX}px -${bgY}px`;
});

container.addEventListener("mouseleave", () => {
    lens.style.display    = "none";
    zoomBox.style.display = "none";
});

// Add to Cart
document.getElementById("addToCartBtn").addEventListener("click", async () => {
    const productId = document.getElementById("addToCartBtn").dataset.id;
    try {
        const response = await fetch(`/cart/${productId}`, { method: "POST" });
        const data = await response.json();
        if (data.success) {
            showToast("Added to cart!", "success");
            const counter = document.getElementById("navCartCount");
            if (counter) counter.textContent = data.cartCount;
        } else {
            showToast(data.message, "danger");
        }
    } catch (error) {
        showToast("Something went wrong.", "danger");
    }
});

// Wishlist
document.querySelector(".addToWishlistBtn")?.addEventListener("click", async () => {
    const productId = document.querySelector(".addToWishlistBtn").dataset.id;
    try {
        const res = await fetch(`/wishlist/${productId}`, { method: "POST" });
        const data = await res.json();
        if (data.success) showToast("Added to wishlist!", "success");
        else showToast(data.message, "danger");
    } catch (error) {
        showToast("Something went wrong.", "danger");
    }
});

// Add Review
document.getElementById("submitReview")?.addEventListener("click", async () => {
    const productId = document.getElementById("submitReview").dataset.id;
    const rating    = parseInt(document.getElementById("reviewRating").value);
    const comment   = document.getElementById("reviewComment").value.trim();

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        showToast("Rating must be between 1 and 5.", "danger");
        return;
    }
    if (!comment || comment.length < 3) {
        showToast("Please write a comment (min 3 characters).", "danger");
        return;
    }

    try {
        const response = await fetch(`/product/${productId}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating, comment })
        });
        const data = await response.json();
        if (data.success) {
            showToast("Review added!", "success");
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast(data.message, "danger");
        }
    } catch (error) {
        showToast("Something went wrong.", "danger");
    }
});