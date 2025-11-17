<template>
  <div>
    <h2>Utolsó mérések (hőmérséklet)</h2>
    <canvas ref="canvas"></canvas>
    <button @click="load">Frissít</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const canvas = ref(null);
let chart = null;

async function load() {
  const q = query(collection(db, "weather_readings"), orderBy("timestamp", "desc"), limit(50));
  const snap = await getDocs(q);
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const ordered = rows.reverse();
  const labels = ordered.map(r => {
    const ts = r.timestamp?.toDate ? r.timestamp.toDate() : new Date();
    return ts.toLocaleString();
  });
  const temps = ordered.map(r => r.data?.temp ?? r.data?.main?.temp ?? null);

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = temps;
    chart.update();
    return;
  }

  chart = new Chart(canvas.value.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temperature (°C)",
        data: temps,
        borderColor: "#1976d2",
        backgroundColor: "rgba(25,118,210,0.2)",
        fill: true
      }]
    }
  });
}

onMounted(() => {
  load();
});
</script>