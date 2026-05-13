const nameInput            = document.getElementById("name");
const emailInput           = document.getElementById("email");
const passwordInput        = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

/* ── setError / clearError ───────────────────────────────── */
function setError(id, message) {
    document.getElementById(id).textContent = message;
    document.getElementById(id.replace('Error', 'Group'))?.classList.add('is-invalid');
    return false;
}

function clearError(id) {
    document.getElementById(id).textContent = "";
    document.getElementById(id.replace('Error', 'Group'))?.classList.remove('is-invalid');
    return true;
}

/* ── Validators ─────────────────────────────────────────── */
function validateName() {
    const value = nameInput.value.trim();
    if (!value)              return setError("nameError", "Username is required.");
    if (value.length < 3)   return setError("nameError", "Username must be at least 3 characters.");
    if (!/^[a-zA-Z0-9_]+$/.test(value))
                             return setError("nameError", "Only letters, numbers, and underscores allowed.");
    return clearError("nameError");
}

function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) return setError("emailError", "Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                return setError("emailError", "Enter a valid email address.");
    return clearError("emailError");
}

function validatePassword() {
    const value = passwordInput.value;
    if (!value)             return setError("passwordError", "Password is required.");
    if (value.length < 8)  return setError("passwordError", "Password must be at least 8 characters.");
    if (!/[A-Z]/.test(value)) return setError("passwordError", "Include at least one uppercase letter.");
    if (!/[0-9]/.test(value)) return setError("passwordError", "Include at least one number.");
    return clearError("passwordError");
}

function validateConfirmPassword() {
    const value = confirmPasswordInput.value;
    if (!value)                        return setError("confirmPasswordError", "Please confirm your password.");
    if (value !== passwordInput.value) return setError("confirmPasswordError", "Passwords do not match.");
    return clearError("confirmPasswordError");
}

/* ── Live validation listeners ───────────────────────────── */
nameInput.addEventListener("input", validateName);
emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", () => {
    validatePassword();
    if (confirmPasswordInput.value) validateConfirmPassword();
});
confirmPasswordInput.addEventListener("input", validateConfirmPassword);

/* ── Submit ──────────────────────────────────────────────── */
document.getElementById("registerForm").addEventListener("submit", function (e) {
    const isValid = [
        validateName(),
        validateEmail(),
        validatePassword(),
        validateConfirmPassword()
    ].every(Boolean);
    if (!isValid) e.preventDefault();
});

/* ── Password eye toggles ────────────────────────────────── */
function setupEyeToggle(btnId, iconId, inputEl) {
    const btn  = document.getElementById(btnId);
    const icon = document.getElementById(iconId);
    if (!btn) return;
    btn.addEventListener('click', () => {
        const showing  = inputEl.type === 'text';
        inputEl.type   = showing ? 'password' : 'text';
        icon.className = showing ? 'fa fa-eye' : 'fa fa-eye-slash';
        btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
}

setupEyeToggle('eyeBtn1', 'eyeIcon1', passwordInput);
setupEyeToggle('eyeBtn2', 'eyeIcon2', confirmPasswordInput);