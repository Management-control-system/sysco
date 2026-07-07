/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Server-side Firebase Admin SDK bootstrap.
 *
 * This module NEVER runs in the browser. It uses a service account with
 * elevated privileges to bypass Firestore Security Rules, which is exactly
 * why all sensitive operations (verifying PINs, minting auth tokens,
 * confirming payments) must happen here and never on the client.
 *
 * Configure by setting FIREBASE_SERVICE_ACCOUNT_KEY in your environment to
 * the full JSON content of a Firebase service account key
 * (Firebase Console -> Project Settings -> Service Accounts -> Generate new
 * private key).
 */
import admin from 'firebase-admin';

let initialized = false;

export function getAdminApp(): admin.app.App | null {
  if (initialized) {
    return admin.apps[0] as admin.app.App;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.warn(
      '[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_KEY is not set. Cloud auth, ' +
      'PIN verification and payment confirmation endpoints will be disabled ' +
      'until this is configured.'
    );
    return null;
  }

  try {
    const serviceAccount = JSON.parse(raw);
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    return app;
  } catch (error) {
    console.error('[firebaseAdmin] Failed to initialize Firebase Admin SDK:', error);
    return null;
  }
}

export function getAdminDb(): admin.firestore.Firestore | null {
  const app = getAdminApp();
  if (!app) return null;
  return admin.firestore();
}

export function getAdminAuth(): admin.auth.Auth | null {
  const app = getAdminApp();
  if (!app) return null;
  return admin.auth();
}

export { admin };
