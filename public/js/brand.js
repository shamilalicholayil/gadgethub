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

// Edit Brand
document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;

        document.getElementById("editBrandInput").value = name;
        document.getElementById("saveEditBrandBtn").dataset.id = id;

        const modal = new bootstrap.Modal(document.getElementById("editBrandModal"));
        modal.show();
    });
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

// Disable / Enable Brand
document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const isActive = btn.dataset.active === "true";

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
    });
});