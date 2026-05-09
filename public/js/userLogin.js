// Password show/hide toggle
        const eyeBtn  = document.getElementById('eyeBtn');
        const eyeIcon = document.getElementById('eyeIcon');
        const pwInput = document.getElementById('password');

        eyeBtn.addEventListener('click', function () {
            const showing = pwInput.type === 'text';
            pwInput.type  = showing ? 'password' : 'text';
            eyeIcon.className = showing ? 'fa fa-eye' : 'fa fa-eye-slash';
            eyeBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
        });

        // Mirror JS validation errors → red border on input-group wrapper
        const emailError    = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');
        const emGroup       = document.getElementById('emailGroup');
        const pwGroup       = document.getElementById('passwordGroup');

        const errorObserver = new MutationObserver(() => {
            emGroup.classList.toggle('is-invalid', !!emailError.textContent.trim());
            pwGroup.classList.toggle('is-invalid', !!passwordError.textContent.trim());
        });
        errorObserver.observe(emailError,    { childList: true, characterData: true, subtree: true });
        errorObserver.observe(passwordError, { childList: true, characterData: true, subtree: true });