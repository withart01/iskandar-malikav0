import admin from 'firebase-admin';

function getServiceAccount(): admin.ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not configured');
  }

  return JSON.parse(raw) as admin.ServiceAccount;
}

function getFirebaseApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export function getFirebaseAuth() {
  return admin.auth(getFirebaseApp());
}

export function getFirestore() {
  return admin.firestore(getFirebaseApp());
}
