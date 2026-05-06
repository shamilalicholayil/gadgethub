const emailInput    = document.getElementById("email");
const passwordInput = document.getElementById("password");

function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) return setError("emailError", "Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setError("emailError", "Enter a valid email address.");
    return clearError("emailError");
}

function validatePassword() {
    const value = passwordInput.value;
    if (!value) return setError("passwordError", "Password is required.");
    return clearError("passwordError");
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
passwordInput.addEventListener("input", validatePassword);

document.getElementById("loginForm").addEventListener("submit", function (e) {
    const isValid = [validateEmail(), validatePassword()].every(Boolean);
    if (!isValid) e.preventDefault();
});