document.getElementById("cancelBtn")?.addEventListener("click", async () => {
        const id = document.getElementById("cancelBtn").dataset.id;
        const result = await Swal.fire({
            title: "Cancel Order?",
            text: "The order will be cancelled",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, Cancel"
        });
        if(!result.isConfirmed) return;

        const res = await fetch(`/orders/${id}/cancel`, { method: "PATCH" });
        const data = await res.json();
        if(data.success) location.reload();
        else alert(data.message);
    });

    document.getElementById("returnBtn")?.addEventListener("click", async () => {
        const id = document.getElementById("returnBtn").dataset.id;
        const res = await fetch(`/orders/${id}/return`, { method: "PATCH" });
        const data = await res.json();
        if(data.success) location.reload();
        else alert(data.message);
    });