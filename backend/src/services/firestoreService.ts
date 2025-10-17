import admin from 'firebase-admin';

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = admin.firestore();

export const addFilmMetadata = async (filmId: string, metadata: any) => {
  try {
    await db.collection('films').doc(filmId).set(metadata);
  } catch (error) {
    console.error('Error adding film metadata to Firestore:', error);
    throw error;
  }
};

export const getFilmMetadata = async (filmId: string) => {
  try {
    const doc = await db.collection('films').doc(filmId).get();
    if (!doc.exists) {
      throw new Error('Film metadata not found');
    }
    return doc.data();
  } catch (error) {
    console.error('Error getting film metadata from Firestore:', error);
    throw error;
  }
};
