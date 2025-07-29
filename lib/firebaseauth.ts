// lib/firebaseAuth.ts
import { auth, db } from './firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  // After login, create/update user doc in Firestore
  await setDoc(doc(db, 'users', result.user.uid), {
    email: result.user.email,
    signupMethod: 'google',
    createdAt: serverTimestamp(),
  }, { merge: true });
  return result.user;
}

export async function signUpWithEmail(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    signupMethod: 'email',
    createdAt: serverTimestamp(),
  }, { merge: true });
  return userCredential.user;
}

export async function signInWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  // No need to create doc, should already exist
  return userCredential.user;
}
