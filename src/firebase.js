import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCdbihn5dGZJ183yb8g30orDWwtaKqLr0g",
  authDomain: "csipkey-weather-2025.firebaseapp.com",
  projectId: "csipkey-weather-2025",
  storageBucket: "csipkey-weather-2025.firebasestorage.app",
  messagingSenderId: "263084183640",
  appId: "1:263084183640:web:6a0714d5f293e279fc7a2d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { db, messaging };
export default app