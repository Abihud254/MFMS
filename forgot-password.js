document.getElementById('forgotPasswordForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Clear previous messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            successMessage.textContent = 'If an account with this email exists, a password reset link has been sent.';
            successMessage.style.display = 'block';
            document.getElementById('forgotPasswordForm').reset();
        } else {
            const errorData = await response.json();
            errorMessage.textContent = errorData.message || 'An error occurred. Please try again.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
});
