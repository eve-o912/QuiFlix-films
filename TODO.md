# TODO: Restrict Admin Access to Specific Email

## Tasks
- [x] Update JWT token generation to include user's email
- [x] Modify admin middleware to check email instead of wallet address
- [x] Update token generation calls to pass email
- [x] Test admin access after setting email in profile (build successful)

## Files to Edit
- backend/src/middleware/auth.ts
- backend/src/middleware/adminAuth.ts
- backend/src/controllers/userController.ts

## Notes
- Admin email: stephenkaruru05@gmail.com (hardcoded)
- Ensure user updates profile to set email before admin access works
