<template>
  <div>
    <h2>Push értesítések</h2>
    <p>Kapcsold be, hogy riasztásokat kaphass.</p>
    <button @click="subscribe">Subscribe to Alerts</button>
    <p v-if="token">Token saved (preview): {{ tokenPreview }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { messaging } from "../firebase";
import { getToken } from "firebase/messaging";

const token = ref(null);
const vapidKey = "BFGn9xfyFsuEyVag9IKlrVWFrQg9LzTn8NcBK_G9FOzan3skC6Hj9J8gVkr7H9c1ZBBSEVStx5w_JRTgd-GZSOg";

async function subscribe() {
  try {
    const t = await getToken(messaging, { vapidKey });
    if (!t) throw new Error("No token");
    token.value = t;
    // Küldés server endpointnak — egyszerű megoldás: Firestore write végpont functions vagy használj firebase SDK-t
    await fetch("/save-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: t })
    });
    alert("Subscribed for push notifications");
  } catch (e) {
    console.error(e);
    alert("Could not get permission or token: " + e.message);
  }
}

const tokenPreview = computed(() => token.value ? token.value.slice(0, 12) + "..." : "");
</script>