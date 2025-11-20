document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            // Assuming the backend returns a token
            if (data.token) {
                // Store the token (e.g., in localStorage)
                localStorage.setItem('token', data.token);
                // Redirect to the dashboard
                window.location.href = '/chama-frontend/'; // Adjust this path if needed
            } else {
                errorMessage.textContent = 'Login successful, but no token received.';
                errorMessage.style.display = 'block';
            }
        } else {
            const errorData = await response.json();
            errorMessage.textContent = errorData.message || 'Login failed. Please check your credentials.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred during login. Please try again.';
        errorMessage.style.display = 'block';
    }
});
