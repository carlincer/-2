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
  apiKey: "AIzaSyCqNuiO8bZrNQGYNGnTFxb2Y7h3KCyaDKo",
  authDomain: "gachaundae.firebaseapp.com",
  projectId: "gachaundae",
  storageBucket: "gachaundae.firebasestorage.app",
  messagingSenderId: "51875901280",
  appId: "1:51875901280:web:bd60f4be11e540c6ffb805",
  measurementId: "G-CM41CJLP3J"
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
    const locations = snapshot.docs.map(docData => ({
      id: docData.id,
      ...docData.data()
    }));
    callback(locations);
  }, (error) => {
    console.error("Firebase 실시간 조회 오류:", error);
  });
}

export async function deleteFrequentLocation(id) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Firebase 삭제 중 오류 발생:", error);
    throw error;
  }
}
