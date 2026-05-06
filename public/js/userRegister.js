const nameInput           = document.getElementById("name");
const emailInput          = document.getElementById("email");
const passwordInput       = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

function validateName() {
    const value = nameInput.value.trim();
    if (!value) {
        return setError("nameError", "Username is required.");
    }
    if (value.length < 3) {
        return setError("nameError", "Username must be at least 3 characters.");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return setError("nameError", "Only letters, numbers, and underscores allowed.");
    }
    return clearError("nameError");
}

function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
        return setError("emailError", "Email is required.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return setError("emailError", "Enter a valid email address.");
    }
    return clearError("emailError");
}

function validatePassword() {
    const value = passwordInput.value;
    if (!value) {
        return setError("passwordError", "Password is required.");
    }
    if (value.length < 8) {
        return setError("passwordError", "Password must be at least 8 characters.");
    }
    if (!/[A-Z]/.test(value)) {
        return setError("passwordError", "Include at least one uppercase letter.");
    }
    if (!/[0-9]/.test(value)) {
        return setError("passwordError", "Include at least one number.");
    }
    return clearError("passwordError");
}

function validateConfirmPassword() {
    const value = confirmPasswordInput.value;
    if (!value) {
        return setError("confirmPasswordError", "Please confirm your password.");
    }
    if (value !== passwordInput.value) {
        return setError("confirmPasswordError", "Passwords do not match.");
    }
    return clearError("confirmPasswordError");
}

function setError(id, message) {
    document.getElementById(id).textContent = message;
    return false;
}

function clearError(id) {
    document.getElementById(id).textContent = "";
    return true;
}

nameInput.addEventListener("input", validateName);
emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", () => {
    validatePassword();
    if (confirmPasswordInput.value) validateConfirmPassword();
});
confirmPasswordInput.addEventListener("input", validateConfirmPassword);

document.getElementById("registerForm").addEventListener("submit", function (e) {
    const isValid = [
        validateName(),
        validateEmail(),
        validatePassword(),
        validateConfirmPassword()
    ].every(Boolean);

    if (!isValid) e.preventDefault();
});