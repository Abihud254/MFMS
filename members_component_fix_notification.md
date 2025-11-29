I have resolved the issue with the "add new member" popup window in the `Members` component. The component was corrupted with duplicate code, which I have now cleaned up. The "add new member" dialog should now be visible and fully functional.

I have also completed the implementation of the **"Promote to Admin"** feature.

Here is a summary of the latest changes:

**Backend:**
-   A `PUT /api/admin/promote/:userId` endpoint has been created to elevate a user's role to 'admin'.
-   The `GET /api/members` endpoint has been updated to include user information with each member, which is necessary for the "Promote to Admin" feature.

**Frontend (`Members.tsx`):**
-   The component has been cleaned up and is no longer corrupted.
-   The "add new member" dialog is now visible and functional.
-   A "Promote to Admin" button is now available on each member's card for admin users.

**Next Steps:**
1.  **Redeploy your backend application to Render** to deploy the new admin endpoints and updated members route.
2.  **Redeploy your frontend application to Vercel** to deploy the updated `Members` component.

Once both deployments are complete, you will be able to add new members and use the "Promote to Admin" feature.
