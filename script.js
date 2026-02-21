const API_KEY = "e3360634dc1067546e225ee50467d724";
const UNITS = "metric"; // metric = Celsius

const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");

const placeEl = document.getElementById("place");
const timeEl = document.getElementById("time");
const iconEl = document.getElementById("icon");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const feelsEl = document.getElementById("feels");

const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");

const errorEl = document.getElementById("error");

function showError(msg) {
  errorEl.textContent = msg || "";
}

function requireKey() {
  if (!API_KEY || API_KEY.includes("YOUR_KEY_HERE")) {
    showError("Add your OpenWeatherMap API key in script.js (API_KEY).");
    return false;
  }
  return true;
}

function iconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function formatLocalTime(unixSeconds, tzOffsetSeconds) {
  const ms = (unixSeconds + tzOffsetSeconds) * 1000;
  const d = new Date(ms);
  return d.toUTCString().replace("GMT", "").trim();
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    let errText = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data && data.message) errText = data.message;
    } catch {}
    throw new Error(errText);
  }
  return res.json();
}

function renderCurrent(data) {
  const name = data.name || "—";
  const country = data.sys?.country ? `, ${data.sys.country}` : "";
  placeEl.textContent = `${name}${country}`;

  const tz = data.timezone ?? 0;
  const now = data.dt ?? Math.floor(Date.now() / 1000);
  timeEl.textContent = `Local time: ${formatLocalTime(now, tz)}`;

  const temp = Math.round(data.main?.temp);
  const feels = Math.round(data.main?.feels_like);
  tempEl.textContent = Number.isFinite(temp) ? temp : "—";
  feelsEl.textContent = Number.isFinite(feels) ? feels : "—";

  const desc = data.weather?.[0]?.description ?? "—";
  descEl.textContent = desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : "—";

  const iconCode = data.weather?.[0]?.icon;
  if (iconCode) {
    iconEl.src = iconUrl(iconCode);
    iconEl.style.display = "block";
    iconEl.alt = data.weather?.[0]?.main || "Weather icon";
  } else {
    iconEl.style.display = "none";
  }

  humidityEl.textContent = data.main?.humidity ?? "—";
  windEl.textContent = data.wind?.speed ?? "—";
  pressureEl.textContent = data.main?.pressure ?? "—";
  const visKm = data.visibility != null ? (data.visibility / 1000).toFixed(1) : "—";
  visibilityEl.textContent = visKm;
}

async function loadWeather(city) {
  showError("");
  if (!requireKey()) return;

  const q = city.trim();
  if (!q) {
    showError("Type a city name.");
    return;
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${API_KEY}&units=${UNITS}`;

  try {
    const current = await fetchJson(url);
    renderCurrent(current);
  } catch (err) {
    showError(err.message || "Something went wrong.");
  }
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  loadWeather(cityInput.value);
});

loadWeather("greater noida");