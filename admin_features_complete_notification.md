I have successfully implemented both of the requested admin features.

**1. Clear Database Feature:**
-   **Backend:** A `DELETE /api/admin/clear-database` endpoint has been created.
-   **Frontend:** A "Clear Database" button is now available on the `Dashboard` for admin users. It includes a confirmation dialog to prevent accidental data deletion.

**2. Promote to Admin Feature:**
-   **Backend:** A `PUT /api/admin/promote/:userId` endpoint has been created to elevate a user's role to 'admin'. The `GET /api/members` endpoint has also been updated to include user information with each member.
-   **Frontend:** A "Promote to Admin" button is now available on each member's card on the `Members` page. This button is only visible to admins and is not shown for members who are already admins.

**Next Steps:**
1.  **Redeploy your backend application to Render** to deploy the new admin endpoints and updated members route.
2.  **Redeploy your frontend application to Vercel** to deploy the updated `Dashboard` and `Members` components.

Once both deployments are complete, you will be able to use these new admin features.
