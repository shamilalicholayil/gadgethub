// Toast
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

// --- Validators --- //
function validateName(name) {
    if(!name) return "Full name is required.";
    if(name.length < 3) return "Name must be at least 3 characters.";
    if(!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces.";
    return null;
}

function validateEmail(email) {
    if(!email) return "Email is required.";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    return null;
}

function validatePhone(phone) {
    if(!phone) return "Phone number is required.";
    if(!/^\d{10}$/.test(phone)) return "Enter a valid 10-digit phone number.";
    return null;
}

function validatePincode(pincode) {
    if(!pincode) return "Pincode is required.";
    if(!/^\d{6}$/.test(pincode)) return "Enter a valid 6-digit pincode.";
    return null;
}

function validatePassword(password) {
    if(!password) return "Password is required.";
    if(password.length < 8) return "Password must be at least 8 characters.";
    if(!/[A-Z]/.test(password)) return "Include at least one uppercase letter.";
    if(!/[0-9]/.test(password)) return "Include at least one number.";
    return null;
}

function validateAddressFields(fields) {
    if(!fields.fullName) return "Full name is required.";
    if(fields.fullName.length < 3) return "Name must be at least 3 characters.";
    const phoneErr = validatePhone(fields.phone);
    if(phoneErr) return phoneErr;
    if(!fields.address) return "Address is required.";
    if(!fields.city) return "City is required.";
    if(!fields.state) return "State is required.";
    const pincodeErr = validatePincode(fields.pincode);
    if (pincodeErr) return pincodeErr;
    return null;
}

// Edit Profile
document.getElementById("saveProfileBtn").addEventListener("click", async () => {
    const name = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();

    const nameErr = validateName(name);
    if(nameErr) return showToast(nameErr, "danger");
    const emailErr = validateEmail(email);
    if(emailErr) return showToast(emailErr, "danger");

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

    if(!currentPassword) return showToast("Current password is required.", "danger");
    const newPassErr = validatePassword(newPassword);
    if(newPassErr) return showToast(newPassErr, "danger");
    if(newPassword !== confirmPassword) return showToast("Passwords don't match.", "danger");
    if(newPassword === currentPassword) return showToast("New password must be different from current.", "danger");

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

    const err = validateAddressFields(body);
    if(err) return showToast(err, "danger");

    const res = await fetch("/profile/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    showToast(data.message, data.success ? "success" : "danger");
    if(data.success) setTimeout(() => location.reload(), 1000);
});

// Edit Address Pre-fill
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
    const id   = document.getElementById("editAddrId").value;
    const body = {
        fullName: document.getElementById("editAddrFullName").value.trim(),
        phone: document.getElementById("editAddrPhone").value.trim(),
        address: document.getElementById("editAddrLine").value.trim(),
        city: document.getElementById("editAddrCity").value.trim(),
        state: document.getElementById("editAddrState").value.trim(),
        pincode: document.getElementById("editAddrPincode").value.trim()
    };

    const err = validateAddressFields(body);
    if(err) return showToast(err, "danger");

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