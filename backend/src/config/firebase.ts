// /backend/src/config/firebase.ts
import admin from 'firebase-admin';

let firebaseInitialized = false;

try {
  if (!admin.apps.length) {
    // Check if all required environment variables are present
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      console.warn('⚠️  Firebase credentials missing. Some features may not work.');
      console.warn('Required env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    }
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error);
  console.warn('⚠️  Continuing without Firebase Admin. Some features may not work.');
}

export { firebaseInitialized };
export default admin;