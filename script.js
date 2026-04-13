const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const statusText = document.getElementById("status");
const result = document.getElementById("weather-result");

const cityNameEl = document.getElementById("city-name");
const weatherTimeEl = document.getElementById("weather-time");
const weatherCodeTextEl = document.getElementById("weather-code-text");
const temperatureEl = document.getElementById("temperature");
const windEl = document.getElementById("wind");
const apparentTempEl = document.getElementById("apparent-temp");
const humidityEl = document.getElementById("humidity");
const dayNightEl = document.getElementById("day-night");
const coordsEl = document.getElementById("coords");

const weatherCodeMap = {
	0: "Clear sky",
	1: "Mainly clear",
	2: "Partly cloudy",
	3: "Overcast",
	45: "Fog",
	48: "Depositing rime fog",
	51: "Light drizzle",
	53: "Moderate drizzle",
	55: "Dense drizzle",
	56: "Freezing drizzle",
	57: "Dense freezing drizzle",
	61: "Slight rain",
	63: "Moderate rain",
	65: "Heavy rain",
	66: "Freezing rain",
	67: "Heavy freezing rain",
	71: "Slight snow",
	73: "Moderate snow",
	75: "Heavy snow",
	77: "Snow grains",
	80: "Rain showers",
	81: "Moderate rain showers",
	82: "Violent rain showers",
	85: "Snow showers",
	86: "Heavy snow showers",
	95: "Thunderstorm",
	96: "Thunderstorm with hail",
	99: "Severe thunderstorm with hail"
};

function setStatus(message, isError = false) {
	statusText.textContent = message;
	statusText.classList.toggle("error", isError);
}

async function fetchCityCoordinates(city) {
	const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
	const response = await fetch(geoUrl);

	if (!response.ok) {
		throw new Error("Failed to fetch location data.");
	}

	const data = await response.json();
	const place = data.results && data.results[0];

	if (!place) {
		throw new Error("City not found. Try another city name.");
	}

	return place;
}

async function fetchWeather(lat, lon) {
	const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m&timezone=auto`;
	const response = await fetch(weatherUrl);

	if (!response.ok) {
		throw new Error("Failed to fetch weather data.");
	}

	const data = await response.json();

	if (!data.current) {
		throw new Error("Weather data unavailable for this location.");
	}

	return data.current;
}

function renderWeather(place, current) {
	const fullName = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
	cityNameEl.textContent = fullName;
	weatherTimeEl.textContent = `Updated: ${new Date(current.time).toLocaleString()}`;
	weatherCodeTextEl.textContent = weatherCodeMap[current.weather_code] || "Unknown";

	temperatureEl.textContent = `${Math.round(current.temperature_2m)} C`;
	windEl.textContent = `Wind: ${Math.round(current.wind_speed_10m)} km/h`;
	apparentTempEl.textContent = `${Math.round(current.apparent_temperature)} C`;
	humidityEl.textContent = `${current.relative_humidity_2m}%`;
	dayNightEl.textContent = current.is_day ? "Day" : "Night";
	coordsEl.textContent = `${place.latitude.toFixed(2)}, ${place.longitude.toFixed(2)}`;

	result.classList.remove("hidden");
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	const city = cityInput.value.trim();

	if (!city) {
		setStatus("Please enter a city name.", true);
		result.classList.add("hidden");
		return;
	}

	setStatus("Loading weather data...");
	result.classList.add("hidden");

	try {
		const place = await fetchCityCoordinates(city);
		const current = await fetchWeather(place.latitude, place.longitude);
		renderWeather(place, current);
		setStatus("Weather loaded successfully.");
	} catch (error) {
		setStatus(error.message || "Something went wrong.", true);
	}
});
