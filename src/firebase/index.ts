'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import * as localFirestore from './firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = localFirestore;
  const storage = getStorage(firebaseApp);

  const useEmulator =
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === 'true';

  if (useEmulator) {
    try {
      const authEmulatorHost =
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
      connectAuthEmulator(auth, http://${authEmulatorHost});

      const storageHost =
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost';
      const storagePort = Number(
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT || '9199'
      );
      connectStorageEmulator(storage, storageHost, storagePort);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed connecting to Firebase emulators', e);
      }
    }
  }

  return {
    firebaseApp,
    auth,
    firestore,
    storage,
  };
}

// ❌ REMOVE THIS: export * from './client-provider';
// Client-provider contains JSX and breaks build

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
