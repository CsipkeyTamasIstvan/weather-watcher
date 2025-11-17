const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();
const fcm = admin.messaging();

exports.saveToken = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send({ error: 'Method not allowed' });

    const body = req.body;
    if (!body || !body.token) return res.status(400).send({ error: 'Missing token' });

    const token = String(body.token).trim();
    if (!token) return res.status(400).send({ error: 'Empty token' });

    // opcionális: deduplikálás (update vagy set with token as id)
    await db.collection('fcm_tokens').add({ token, createdAt: admin.firestore.FieldValue.serverTimestamp() });

    return res.status(201).send({ status: 'ok' });
  } catch (err) {
    console.error('saveToken error', err);
    return res.status(500).send({ error: 'internal' });
  }
});


// Konfiguráció: firebase functions:config:set openweather.key="YOUR_KEY" default.location_lat="47.1595" default.location_lon="27.5895"
const OPENWEATHER_KEY = functions.config()?.openweather?.key || process.env.OPENWEATHER_KEY;
const DEFAULT_LAT = functions.config()?.default?.location_lat || "47.1595";
const DEFAULT_LON = functions.config()?.default?.location_lon || "27.5895";
const LOCATION_ID = "iasi";

function shouldTrigger(condition, data) {
  const type = condition.type;
  const val = Number(condition.value);
  if (type === "temp_above") return data.temp > val;
  if (type === "temp_below") return data.temp < val;
  if (type === "wind_above") return data.wind > val;
  return false;
}

exports.scheduledWeatherFetch = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
  try {
    if (!OPENWEATHER_KEY) {
      console.error("No OpenWeather key configured");
      return null;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}&appid=${OPENWEATHER_KEY}&units=metric`;
    const res = await axios.get(url);
    const main = res.data.main || {};
    const wind = res.data.wind || {};
    const payload = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      locationId: LOCATION_ID,
      data: {
        temp: main.temp,
        humidity: main.humidity,
        wind: wind.speed,
        raw: res.data
      }
    };
    await db.collection("weather_readings").add(payload);

    // Aktív riasztások lekérése ugyanarra a locationId-re
    const alertsSnap = await db.collection("alerts").where("active", "==", true).where("locationId", "==", LOCATION_ID).get();
    if (!alertsSnap.empty) {
      // Tokenek lekérése
      const tokensSnap = await db.collection("fcm_tokens").get();
      const tokens = tokensSnap.docs.map(d => d.data().token).filter(Boolean);
      for (const doc of alertsSnap.docs) {
        const alert = doc.data();
        if (shouldTrigger(alert.condition, payload.data)) {
          if (tokens.length > 0) {
            const message = {
              notification: {
                title: "Weather Alert",
                body: `Condition ${alert.condition.type} ${alert.condition.value} triggered. Current: ${payload.data.temp}°C`
              },
              tokens
            };
            const response = await fcm.sendMulticast(message);
            console.log("Sent notifications:", response.successCount);
          } else {
            console.log("No tokens to send to");
          }
        }
      }
    }
    return null;
  } catch (err) {
    console.error("scheduledWeatherFetch error", err);
    return null;
  }
});