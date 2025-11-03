"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseInitialized = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
let firebaseInitialized = false;
exports.firebaseInitialized = firebaseInitialized;
try {
    if (!firebase_admin_1.default.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (projectId && clientEmail && privateKey) {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert({
                    projectId,
                    privateKey,
                    clientEmail,
                }),
            });
            exports.firebaseInitialized = firebaseInitialized = true;
            console.log('✅ Firebase Admin initialized successfully');
        }
        else {
            console.warn('⚠️  Firebase credentials missing. Some features may not work.');
            console.warn('Required env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
        }
    }
}
catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    console.warn('⚠️  Continuing without Firebase Admin. Some features may not work.');
}
exports.default = firebase_admin_1.default;
//# sourceMappingURL=firebase.js.map