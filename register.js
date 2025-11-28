document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Clear previous messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            successMessage.textContent = 'Registration successful! You can now log in.';
            successMessage.style.display = 'block';
            document.getElementById('registerForm').reset();
        } else {
            const errorData = await response.json();
            errorMessage.textContent = errorData.message || 'Registration failed. Please try again.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorMessage.textContent = 'An error occurred during registration. Please try again.';
        errorMessage.style.display = 'block';
    }
});
