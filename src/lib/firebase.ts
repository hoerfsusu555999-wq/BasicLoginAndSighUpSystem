import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      name: user.displayName || 'Unknown User',
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return user;
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(result.user, { displayName: name });
  
  await setDoc(doc(db, 'users', result.user.uid), {
    uid: result.user.uid,
    name,
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return result.user;
};

export const loginWithEmail = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);

export const resetPassword = (email: string) => 
  sendPasswordResetEmail(auth, email);

export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user authenticated');
  
  // Delete Firestore document first
  await deleteDoc(doc(db, 'users', user.uid));
  
  // Delete Auth user
  await deleteUser(user);
};

export const logout = () => signOut(auth);
