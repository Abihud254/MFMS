document.getElementById('resetPasswordForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Clear previous messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match.';
        errorMessage.style.display = 'block';
        return;
    }

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        errorMessage.textContent = 'Invalid or missing reset token.';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`/api/auth/reset-password/${token}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        if (response.ok) {
            successMessage.textContent = 'Password has been reset successfully! You can now log in with your new password.';
            successMessage.style.display = 'block';
            document.getElementById('resetPasswordForm').reset();
        } else {
            const errorData = await response.json();
            errorMessage.textContent = errorData.error || 'Failed to reset password. The link may be expired or invalid.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Reset password error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
});
