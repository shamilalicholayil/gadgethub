const passwordInput        = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

function validatePassword() {
    const value = passwordInput.value;
    if(!value) return setError("passwordError", "Password is required.");
    if(value.length < 8) return setError("passwordError", "Password must be at least 8 characters.");
    if(!/[A-Z]/.test(value)) return setError("passwordError", "Include at least one uppercase letter.");
    if(!/[0-9]/.test(value)) return setError("passwordError", "Include at least one number.");
    return clearError("passwordError");
}

function validateConfirmPassword() {
    const value = confirmPasswordInput.value;
    if(!value) return setError("confirmPasswordError", "Please confirm your password.");
    if(value !== passwordInput.value) return setError("confirmPasswordError", "Passwords do not match.");
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

passwordInput.addEventListener("input", () => {
    validatePassword();
    if(confirmPasswordInput.value) validateConfirmPassword();
});
confirmPasswordInput.addEventListener("input", validateConfirmPassword);

document.getElementById("resetForm").addEventListener("submit", function (e) {
    const isValid = [validatePassword(), validateConfirmPassword()].every(Boolean);
    if(!isValid) e.preventDefault();
});