// src/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const COLLECTION_NAME = "frequent_locations";

export async function saveFrequentLocation(name, lat, lng) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name: name,
      lat: lat,
      lng: lng,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Firebase 저장 중 오류 발생:", error);
    throw error;
  }
}

export function subscribeFrequentLocations(callback) {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const locations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(locations);
  }, (error) => {
    console.error("Firebase 실시간 조회 오류:", error);
  });
}

export async function deleteFrequentLocation(id) {
  try {
    await deleteDoc(doc(docRef(db, COLLECTION_NAME, id)));
  } catch (error) {
    console.error("Firebase 삭제 중 오류 발생:", error);
    throw error;
  }
}
