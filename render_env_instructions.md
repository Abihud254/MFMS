The error "secretOrPrivateKey must have a value" means that your backend server, deployed on Render, is missing a critical environment variable for generating JWT tokens.

Please follow these instructions to fix this:

### 1. Generate a Secret Key

You need a strong, random string for your `JWT_SECRET`. You can generate one easily using an online tool or by running the following command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the long string that this command outputs.

### 2. Add Environment Variables to Render

1.  Go to your Render Dashboard and navigate to your backend service.
2.  Go to the **Environment** tab.
3.  Under **Environment Variables**, click **Add Environment Variable**.
4.  Add the following two variables:

| Key | Value |
| :--- | :--- |
| `JWT_SECRET` | Paste the secret key you generated in the previous step. |
| `JWT_EXPIRE` | `7d` (or your preferred token expiration time, e.g., `1h`, `30d`) |

5.  Click **Save Changes**.

Render will automatically redeploy your service with the new environment variables. Once the deployment is complete, your login and registration should work without errors.
