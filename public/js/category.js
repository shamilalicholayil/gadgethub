// Add Category

document.getElementById("saveCategoryBtn")
    .addEventListener("click", async () => {

    // Step 1: get value from input
    const name = document.getElementById("categoryNameInput").value.trim();
    const description = document.getElementById("categoryDescInput").value.trim();

    // Step 2: validate — if empty show error and stop
    if(!name) {
        document.getElementById("categoryError").classList.remove("d-none");
        document.getElementById("categoryError").textContent = "Category name is required.";
        return;
    }

    // Step 3: send fetch request — fill in the blanks
    try {
        const response = await fetch("/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description })
        });

        // Step 4: read response
        const data = await response.json();

        // Step 5: check result
        if(data.success) {
            Swal.fire("New Category Added Successfully.", data.message, "success")
            .then(() => window.location.reload());
        } else {
            Swal.fire("Error!", data.message, "error");
            document.getElementById("categoryError").classList.remove("d-none");
            document.getElementById("categoryError").textContent = data.message;
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});


// Delete Category

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

            if(!result.isConfirmed) return;

            let enableProducts = false;
            if(!isActive) {
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

            if(data.success) {
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


// Edit Category

document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", () => {

        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const description = btn.dataset.description;

        document.getElementById("editCategoryInput").value = name;
        document.getElementById("editCategoryDescInput").value = description;

        document.getElementById("saveEditCategoryBtn").dataset.id = id;

        const modal = new bootstrap.Modal(
            document.getElementById("editCategoryModal")
        );
        modal.show();

    });
});

document.getElementById("saveEditCategoryBtn").addEventListener("click", async () => {

    const id = document.getElementById("saveEditCategoryBtn").dataset.id;
    const name = document.getElementById("editCategoryInput").value.trim();
    const description = document.getElementById("editCategoryDescInput").value.trim();
    

    if(!name) {
        document.getElementById("editCategoryError").classList.remove("d-none");
        document.getElementById("editCategoryError").textContent = "Name is required.";
        return;
    }

    try {
        const response = await fetch(`/admin/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description })
        });
        const data =await response.json();

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