const emailInput = document.getElementById("email");

function validateEmail() {
    const value = emailInput.value.trim();
    if(!value) return setError("emailError", "Email is required.");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setError("emailError", "Enter a valid email address.");
    return clearError("emailError");
}

function setError(id, message) {
    document.getElementById(id).textContent = message;
    return false;
}

function clearError(id) {
    document.getElementById(id).textContent = "";
    return true;
}

emailInput.addEventListener("input", validateEmail);

document.getElementById("forgotForm").addEventListener("submit", function (e) {
    if (!validateEmail()) e.preventDefault();
});