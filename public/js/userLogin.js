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

function togglePw() {
  const inp = document.getElementById('pwInput');
  const icon = document.getElementById('eyeIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    inp.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePassword);

document.getElementById("loginForm").addEventListener("submit", function (e) {
    const isValid = [validateEmail(), validatePassword()].every(Boolean);
    if (!isValid) e.preventDefault();
});