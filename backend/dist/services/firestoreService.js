"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilmMetadata = exports.addFilmMetadata = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
if (!firebase_admin_1.default.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: privateKey,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
    });
}
const db = firebase_admin_1.default.firestore();
const addFilmMetadata = async (filmId, metadata) => {
    try {
        await db.collection('films').doc(filmId).set(metadata);
    }
    catch (error) {
        console.error('Error adding film metadata to Firestore:', error);
        throw error;
    }
};
exports.addFilmMetadata = addFilmMetadata;
const getFilmMetadata = async (filmId) => {
    try {
        const doc = await db.collection('films').doc(filmId).get();
        if (!doc.exists) {
            throw new Error('Film metadata not found');
        }
        return doc.data();
    }
    catch (error) {
        console.error('Error getting film metadata from Firestore:', error);
        throw error;
    }
};
exports.getFilmMetadata = getFilmMetadata;
//# sourceMappingURL=firestoreService.js.map