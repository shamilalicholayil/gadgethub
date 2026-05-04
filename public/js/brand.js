// Add Brand

document.getElementById("saveBrandBtn")
    .addEventListener("click", async () => {


    const name = document.getElementById("brandNameInput").value.trim();


    if(!name) {
        document.getElementById("brandError").classList.remove("d-none");
        document.getElementById("brandError").textContent = "Brand name is required.";
        return;
    }

    try {
        const response = await fetch("/admin/brands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });


        const data = await response.json();


        if(data.success) {
            Swal.fire("New Brand Added Successfully.", data.message, "success")
                .then(() => window.location.reload());
        } else {
            Swal.fire("Error!", data.message, "error");
            document.getElementById("brandError").classList.remove("d-none");
            document.getElementById("brandError").textContent = data.message;
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});


// Delete Brand

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

            if(!result.isConfirmed) return;

            let enableProducts = false;
            if(!isActive) {
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


// Edit Brand

document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", () => {

        const id = btn.dataset.id;
        const name = btn.dataset.name;

        document.getElementById("editBrandInput").value = name;

        document.getElementById("saveEditBrandBtn").dataset.id = id;

        const modal = new bootstrap.Modal(
            document.getElementById("editBrandModal")
        );
        modal.show();

    });
});

document.getElementById("saveEditBrandBtn").addEventListener("click", async () => {

    const id = document.getElementById("saveEditBrandBtn").dataset.id;
    const name = document.getElementById("editBrandInput").value.trim();

    if(!name) {
        document.getElementById("editBrandError").classList.remove("d-none");
        document.getElementById("editBrandError").textContent = "Name is required.";
        return;
    }

    const response = await fetch(`/admin/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });
    const data =await response.json();

    if(data.success) {
        Swal.fire("Updated!", data.message, "success")
            .then(() => window.location.reload());
    } else {
        Swal.fire("Error!", data.message, "error");
    }

});