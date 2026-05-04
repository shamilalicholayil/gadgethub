function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

// Edit Profile
document.getElementById("saveProfileBtn").addEventListener("click", async () => {
    const name = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const res = await fetch("/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
    });
    const data = await res.json();
    showToast(data.message, data.success ? "success" : "danger");
    if(data.success) setTimeout(() => location.reload(), 500);
});

// Change Password
document.getElementById("savePasswordBtn").addEventListener("click", async () => {
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if(newPassword !== confirmPassword) return showToast("Passwords don't match.", "danger");
    const res = await fetch("/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    showToast(data.message, data.success ? "success" : "danger");
    if(data.success) setTimeout(() => location.reload(), 500);
});

// Add Address
document.getElementById("saveAddressBtn").addEventListener("click", async () => {
    const body = {
        fullName: document.getElementById("addrFullName").value.trim(),
        phone: document.getElementById("addrPhone").value.trim(),
        address: document.getElementById("addrLine").value.trim(),
        city: document.getElementById("addrCity").value.trim(),
        state: document.getElementById("addrState").value.trim(),
        pincode: document.getElementById("addrPincode").value.trim()
    };
    const res = await fetch("/profile/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    showToast(data.message, data.success ? "success" : "danger");
    if(data.success) setTimeout(() => location.reload(), 1000);
});

// Edit Address pre-fill value
document.querySelectorAll(".editAddressBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.getElementById("editAddrId").value = btn.dataset.id;
        document.getElementById("editAddrFullName").value = btn.dataset.fullname;
        document.getElementById("editAddrPhone").value = btn.dataset.phone;
        document.getElementById("editAddrLine").value = btn.dataset.address;
        document.getElementById("editAddrCity").value = btn.dataset.city;
        document.getElementById("editAddrState").value = btn.dataset.state;
        document.getElementById("editAddrPincode").value = btn.dataset.pincode;
        new bootstrap.Modal(document.getElementById("editAddressModal")).show();
    });
});

// Update Address
document.getElementById("updateAddressBtn").addEventListener("click", async () => {
    const id = document.getElementById("editAddrId").value;
    const body = {
        fullName: document.getElementById("editAddrFullName").value.trim(),
        phone: document.getElementById("editAddrPhone").value.trim(),
        address: document.getElementById("editAddrLine").value.trim(),
        city: document.getElementById("editAddrCity").value.trim(),
        state: document.getElementById("editAddrState").value.trim(),
        pincode: document.getElementById("editAddrPincode").value.trim()
    };
    const res = await fetch(`/profile/address/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    showToast(data.message, data.success ? "success" : "danger");
    if(data.success) setTimeout(() => location.reload(), 1000);
});

// Delete Address
document.querySelectorAll(".deleteAddressBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const res = await fetch(`/profile/address/${btn.dataset.id}`, { method: "DELETE" });
        const data = await res.json();
        showToast(data.message, data.success ? "success" : "danger");
        if(data.success) setTimeout(() => location.reload(), 1000);
    });
});

// Set Default
document.querySelectorAll(".setDefaultBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const res = await fetch(`/profile/address/${btn.dataset.id}/default`, { method: "PATCH" });
        const data = await res.json();
        showToast(data.message, data.success ? "success" : "danger");
        if(data.success) setTimeout(() => location.reload(), 1000);
    });
});