import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBpzOlBSVhJmBZQ7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7",
  authDomain: "whatsapp-bot-xxxxx.firebaseapp.com",
  projectId: "whatsapp-bot-xxxxx",
  storageBucket: "whatsapp-bot-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
