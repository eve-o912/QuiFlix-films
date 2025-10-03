# TODO: Implement User Linking with Firebase Auth and Firestore

## Tasks
- [x] Enhance sign-in/sign-up UI components to redirect verified users to dashboard and show error messages on failure
- [ ] Update useAuth.tsx to handle errors and provide feedback
- [ ] Set up Firebase Cloud Functions for automatic Firestore document creation on user creation
- [ ] Test the implementation

## Details
- Verified user: Check user.emailVerified
- On success: Redirect to /dashboard
- On failure: Show error message using toast
- Cloud Function: Listen to auth.user().onCreate and create Firestore doc
