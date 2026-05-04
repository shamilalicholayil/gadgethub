
// Block Users
document.querySelectorAll(".blockBtn").forEach(btn => {
    btn.addEventListener("click", async () => {

        const id = btn.dataset.id;
        const isBlocked = btn.dataset.blocked === "true";

        try {
            const result = await Swal.fire({
                title: isBlocked ? "Unblock User?" : "Block User?",
                text: isBlocked ? "User can access shop again." : "User will be banned from shop.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                confirmButtonText: isBlocked ? "Yes, unblock user." : "Yes, block user."
            });

            if(!result.isConfirmed) return;

            const response = await fetch(`/admin/users/${id}/block`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
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