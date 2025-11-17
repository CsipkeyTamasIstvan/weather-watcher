<template>
  <div>
    <h2>Új riasztás</h2>
    <form @submit.prevent="saveAlert">
      <label>
        Feltétel
        <select v-model="type">
          <option value="temp_above">Hőmérséklet felett</option>
          <option value="temp_below">Hőmérséklet alatt</option>
          <option value="wind_above">Szélsebesség felett</option>
        </select>
      </label>
      <label>
        Érték
        <input type="number" v-model.number="value" required />
      </label>
      <button type="submit">Mentés</button>
    </form>
    <p v-if="saved">Riasztás mentve.</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebase"; // nem használjuk így; ebből a fizikai db import helyett használjuk a db-t

// egyszerű Firestore SDK import helyes használata
import { db } from "../firebase";

const type = ref("temp_above");
const value = ref(30);
const saved = ref(false);

async function saveAlert() {
  const doc = {
    userId: "anonymous",
    locationId: "iasi",
    condition: { type: type.value, value: Number(value.value) },
    active: true,
    createdAt: serverTimestamp()
  };
  try {
    await addDoc(collection(db, "alerts"), doc);
    saved.value = true;
    setTimeout(() => saved.value = false, 2500);
  } catch (e) {
    console.error(e);
    alert("Hiba a mentésnél");
  }
}
</script>