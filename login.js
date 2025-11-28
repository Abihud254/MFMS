document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    
fetch('/api/login', {
    method: 'POST', // or GET, depending on your API
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }), // use collected form values
})
.then(async response => {
    // Check if the response is OK (status in the 200-299 range)
    if (!response.ok) {
        // Attempt to parse as JSON first for server-defined errors
        try {
            const errorData = await response.json();
            // If it's valid JSON, throw it to be caught
            throw new Error(errorData.message || 'Server error');
        } catch (jsonError) {
            // If parsing as JSON fails (e.g., it's HTML or plain text)
            // Read the response as text and include it in the error
            const errorText = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorText.substring(0, 100)}`); // Limit text for brevity
        }
    }
    // If response is OK, parse as JSON
    return response.json();
})
.then(data => {
    // Handle successful login data
    console.log('Login successful:', data);
    // Redirect or update UI
})
.catch(error => {
    // This catch block will now handle both network errors and custom errors thrown above
    console.error('Login error:', error); // This will show a more informative error
    errorMessage.textContent = error.message || 'An unexpected error occurred during login.';
    errorMessage.style.display = 'block';
});

});
