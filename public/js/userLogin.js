const emailInput    = document.getElementById("email");
const passwordInput = document.getElementById("password");

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

emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePassword);

document.getElementById("loginForm").addEventListener("submit", function (e) {
    const isValid = [validateEmail(), validatePassword()].every(Boolean);
    if (!isValid) e.preventDefault();
});

// Password toggle
const eyeBtn  = document.getElementById('eyeBtn');
const eyeIcon = document.getElementById('eyeIcon');

eyeBtn.addEventListener('click', () => {
    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    eyeIcon.className  = showing ? 'fa fa-eye' : 'fa fa-eye-slash';
    eyeBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
});