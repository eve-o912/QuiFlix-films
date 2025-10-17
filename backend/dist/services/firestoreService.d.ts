import admin from 'firebase-admin';
export declare const addFilmMetadata: (filmId: string, metadata: any) => Promise<void>;
export declare const getFilmMetadata: (filmId: string) => Promise<admin.firestore.DocumentData | undefined>;
//# sourceMappingURL=firestoreService.d.ts.map