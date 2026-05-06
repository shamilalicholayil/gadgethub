// Real-time validation — Add Category
document.getElementById("categoryNameInput").addEventListener("input", function () {
    const value = this.value.trim();
    const error = document.getElementById("categoryError");
    if (!value) {
        error.textContent = "Category name is required.";
        error.classList.remove("d-none");
    } else if (value.length < 2) {
        error.textContent = "Category name must be at least 2 characters.";
        error.classList.remove("d-none");
    } else if (!/^[a-zA-Z0-9\s\-&.]+$/.test(value)) {
        error.textContent = "Category name contains invalid characters.";
        error.classList.remove("d-none");
    } else {
        error.textContent = "";
        error.classList.add("d-none");
    }
});

document.getElementById("categoryDescInput").addEventListener("input", function () {
    const value = this.value.trim();
    const error = document.getElementById("categoryError");
    if (!value) {
        error.textContent = "Description is required.";
        error.classList.remove("d-none");
    } else if (value.length < 5) {
        error.textContent = "Description must be at least 5 characters.";
        error.classList.remove("d-none");
    } else {
        error.textContent = "";
        error.classList.add("d-none");
    }
});

// Real-time validation — Edit Category
document.getElementById("editCategoryInput").addEventListener("input", function () {
    const value = this.value.trim();
    const error = document.getElementById("editCategoryError");
    if (!value) {
        error.textContent = "Category name is required.";
        error.classList.remove("d-none");
    } else if (value.length < 2) {
        error.textContent = "Category name must be at least 2 characters.";
        error.classList.remove("d-none");
    } else if (!/^[a-zA-Z0-9\s\-&.]+$/.test(value)) {
        error.textContent = "Category name contains invalid characters.";
        error.classList.remove("d-none");
    } else {
        error.textContent = "";
        error.classList.add("d-none");
    }
});

document.getElementById("editCategoryDescInput").addEventListener("input", function () {
    const value = this.value.trim();
    const error = document.getElementById("editCategoryError");
    if (!value) {
        error.textContent = "Description is required.";
        error.classList.remove("d-none");
    } else if (value.length < 5) {
        error.textContent = "Description must be at least 5 characters.";
        error.classList.remove("d-none");
    } else {
        error.textContent = "";
        error.classList.add("d-none");
    }
});

// Clear errors
document.getElementById("addCategoryModal").addEventListener("hidden.bs.modal", () => {
    document.getElementById("categoryNameInput").value = "";
    document.getElementById("categoryDescInput").value = "";
    document.getElementById("categoryError").classList.add("d-none");
    document.getElementById("categoryError").textContent = "";
});

document.getElementById("editCategoryModal").addEventListener("hidden.bs.modal", () => {
    document.getElementById("editCategoryError").classList.add("d-none");
    document.getElementById("editCategoryError").textContent = "";
});

// Add Category
document.getElementById("saveCategoryBtn").addEventListener("click", async () => {
    const name = document.getElementById("categoryNameInput").value.trim();
    const description = document.getElementById("categoryDescInput").value.trim();
    const error = document.getElementById("categoryError");

    if (!name) {
        error.classList.remove("d-none");
        error.textContent = "Category name is required.";
        return;
    }
    if (name.length < 2) {
        error.classList.remove("d-none");
        error.textContent = "Category name must be at least 2 characters.";
        return;
    }
    if (!/^[a-zA-Z0-9\s\-&.]+$/.test(name)) {
        error.classList.remove("d-none");
        error.textContent = "Category name contains invalid characters.";
        return;
    }
    if (!description) {
        error.classList.remove("d-none");
        error.textContent = "Description is required.";
        return;
    }
    if (description.length < 5) {
        error.classList.remove("d-none");
        error.textContent = "Description must be at least 5 characters.";
        return;
    }

    try {
        const response = await fetch("/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description })
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

// Edit Category
document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const description = btn.dataset.description;

        document.getElementById("editCategoryInput").value = name;
        document.getElementById("editCategoryDescInput").value = description;
        document.getElementById("saveEditCategoryBtn").dataset.id = id;

        const modal = new bootstrap.Modal(document.getElementById("editCategoryModal"));
        modal.show();
    });
});

// Edit Category — save
document.getElementById("saveEditCategoryBtn").addEventListener("click", async () => {
    const id = document.getElementById("saveEditCategoryBtn").dataset.id;
    const name = document.getElementById("editCategoryInput").value.trim();
    const description = document.getElementById("editCategoryDescInput").value.trim();
    const error = document.getElementById("editCategoryError");

    if (!name) {
        error.classList.remove("d-none");
        error.textContent = "Category name is required.";
        return;
    }
    if (name.length < 2) {
        error.classList.remove("d-none");
        error.textContent = "Category name must be at least 2 characters.";
        return;
    }
    if (!/^[a-zA-Z0-9\s\-&.]+$/.test(name)) {
        error.classList.remove("d-none");
        error.textContent = "Category name contains invalid characters.";
        return;
    }
    if (!description) {
        error.classList.remove("d-none");
        error.textContent = "Description is required.";
        return;
    }
    if (description.length < 5) {
        error.classList.remove("d-none");
        error.textContent = "Description must be at least 5 characters.";
        return;
    }

    try {
        const response = await fetch(`/admin/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description })
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

// Disable / Enable Category
document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const isActive = btn.dataset.active === "true";

        try {
            const result = await Swal.fire({
                title: isActive ? "Disable Category?" : "Enable Category?",
                text: isActive ? "Category will be hidden from shop." : "Category will be visible again.",
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
                    text: "Do you want to enable all products in this category too?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Yes, enable all",
                    cancelButtonText: "No, keep them disabled"
                });
                enableProducts = productResult.isConfirmed;
            }

            const response = await fetch(`/admin/categories/${id}`, {
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