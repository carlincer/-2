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

const STORAGE_KEY = "frequent_locations";

/**
 * 1. 자주 가는 장소 저장
 */
export async function saveFrequentLocation(name, lat, lng) {
  try {
    const locations = getStoredLocations();
    const newLocation = {
      id: Date.now().toString(),
      name: name,
      lat: lat,
      lng: lng,
      createdAt: new Date().toISOString()
    };
    locations.unshift(newLocation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    
    // 변경 이벤트 전파
    window.dispatchEvent(new Event("storage-updated"));
    return newLocation.id;
  } catch (error) {
    console.error("저장 중 오류 발생:", error);
    throw error;
  }
}

/**
 * 2. 자주 가는 장소 목록 조회 및 실시간 감시
 */
export function subscribeFrequentLocations(callback) {
  const updateList = () => {
    const locations = getStoredLocations();
    callback(locations);
  };

  // 최초 1회 실행
  updateList();

  // 저장소 업데이트 이벤트 감지
  window.addEventListener("storage-updated", updateList);
  window.addEventListener("storage", updateList);

  // 구독 해제 함수 반환
  return () => {
    window.removeEventListener("storage-updated", updateList);
    window.removeEventListener("storage", updateList);
  };
}

/**
 * 3. 저장된 장소 삭제
 */
export async function deleteFrequentLocation(id) {
  try {
    let locations = getStoredLocations();
    locations = locations.filter(loc => loc.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    
    window.dispatchEvent(new Event("storage-updated"));
  } catch (error) {
    console.error("삭제 중 오류 발생:", error);
    throw error;
  }
}

// 헬퍼 함수
function getStoredLocations() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}
