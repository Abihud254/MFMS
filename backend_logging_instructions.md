I've added a logging middleware to the backend server to help diagnose the 405 error. Please follow these steps:

1.  If your backend server is running, please stop it.
2.  Start the backend server. You can likely do this by running `node chama-backend/server.js` from the root of your project.
3.  Open the registration page in your browser and try to register a new user.
4.  After you see the 405 error in the browser's console, please copy and paste the logs from your backend server's console. The logs should show the incoming request method and path.
