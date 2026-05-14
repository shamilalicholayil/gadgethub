// Toast
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

// Render users as cards
function renderUsers(users) {
    const list = document.getElementById("userList");

    if (users.length === 0) {
        list.innerHTML = `
            <div class="user-empty">
                <i class="fa fa-users-slash"></i>
                No users found.
            </div>`;
        return;
    }

    list.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-avatar ${user.isBlocked ? 'blocked' : ''}">
                ${user.name.charAt(0).toUpperCase()}
            </div>
            <div class="user-info">
                <p class="user-name">${user.name}</p>
                <p class="user-email">${user.email}</p>
            </div>
            <div class="user-actions">
                <span class="status-badge ${user.isBlocked ? 'blocked' : 'active'}">
                    ${user.isBlocked ? 'Blocked' : 'Active'}
                </span>
                <button class="btn-block blockBtn ${user.isBlocked ? 'unblock' : ''}"
                        data-id="${user._id}"
                        data-blocked="${user.isBlocked}">
                    <i class="fa fa-power-off me-1"></i>
                    ${user.isBlocked ? 'Unblock' : 'Block'}
                </button>
            </div>
        </div>
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
        .catch(() => showToast("Search failed", "danger"));
    }, 400);
});

// eEvent Delegation
document.getElementById("userList").addEventListener("click", async (e) => {
    const blockBtn = e.target.closest(".blockBtn");
    if (!blockBtn) return;

    const id        = blockBtn.dataset.id;
    const isBlocked = blockBtn.dataset.blocked === "true";

    try {
        const result = await Swal.fire({
            title: isBlocked ? "Unblock User?" : "Block User?",
            text:  isBlocked ? "User can access the shop again." : "User will be banned from the shop.",
            icon:  "warning",
            showCancelButton:    true,
            confirmButtonColor:  "#d33",
            confirmButtonText:   isBlocked ? "Yes, unblock" : "Yes, block"
        });

        if (!result.isConfirmed) return;

        const response = await fetch(`/admin/users/${id}/block`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });
        const data = await response.json();

        if (data.success) {
            Swal.fire("Done!", data.message, "success")
                .then(() => window.location.reload());
        } else {
            Swal.fire("Error!", data.message, "error");
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong. Try again.", "error");
    }
});

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    fetch("/admin/users", { headers: { "Accept": "application/json" } })
        .then(res => res.json())
        .then(data => { if (data.success) renderUsers(data.users); })
        .catch(() => showToast("Failed to load users", "danger"));
});
