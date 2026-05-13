// Toast
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

// Render Users
function renderUsers(users) {
    const tbody = document.getElementById("userTableBody");
    if (users.length === 0) {
        tbody.innerHTML = `<div class="text-center py-5 text-secondary">User not found.</div>`;
        return;
    }
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                ${user.isBlocked
                    ?`<span class="badge bg-danger">Blocked</span>`
                    :`<span class="badge bg-success">Active</span>`
                }
            </td>
            <td>
                <button type="button" class="btn btn-outline-danger blockBtn"
                        data-id="${user._id}"
                        data-blocked="${user.isBlocked }">
                    <i class="fa fa-power-off"></i>
                    ${user.isBlocked
                        ?`Unblock`
                        :`Block`
                    }
                    </button>
                </td>
            </tr>
    `).join("");
}

// Search
let timer;
document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        fetch(`/admin/users?search=${e.target.value}`, {
            headers: { "Accept": "application/json" }
        })
        .then(res => res.json())
        .then(data => { if (data.success) renderUsers(data.users); })
        .catch((error) => showToast("Search failed", "danger"));
    }, 400);
});

// Event Delegation
document.getElementById("userTableBody").addEventListener("click", async (e) => {
    const blockBtn = e.target.closest(".blockBtn");
    if(blockBtn) {
        const id = blockBtn.dataset.id;
        const isBlocked = blockBtn.dataset.blocked === "true";

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
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetch("/admin/users", { headers: { "Accept": "application/json" } })
        .then(res => res.json())
        .then(data => { if (data.success) renderUsers(data.users); })
        .catch(() => showToast("Failed to load users", "danger"));
});
