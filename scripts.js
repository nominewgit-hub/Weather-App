/* ================= CONFIG ================= */
const API_KEY = '51ea8286067c61f6b472d4a0341d8ed6';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/* ================= STATE ================= */
const state = {
  loading: false,
  weather: null
};

/* ================= DOM ================= */
let UI = null;

function initUI() {
  UI = {
    card: document.getElementById('weatherCard'),
    error: document.getElementById('errorMessage'),
    loader: document.getElementById('loadingSpinner'),

    showLoading() {
      this.loader.style.display = 'block';
      this.card.style.display = 'none';
      this.error.style.display = 'none';
    },

    showError(msg) {
      this.error.textContent = msg;
      this.error.style.display = 'block';
      this.card.style.display = 'none';
      this.loader.style.display = 'none';
    },

    render(data) {
      document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
      document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
      document.getElementById('description').textContent = data.weather[0].description;

      document.getElementById('humidity').textContent = data.main.humidity;
      document.getElementById('windSpeed').textContent = data.wind.speed;
      document.getElementById('cloudiness').textContent = data.clouds.all;

      document.getElementById('sunrise').textContent = formatTime(data.sys.sunrise);
      document.getElementById('sunset').textContent = formatTime(data.sys.sunset);

      document.getElementById('weatherIcon').textContent = getIcon(data.weather[0].main);

      changeBackground(data.weather[0].main.toLowerCase());

      this.card.style.display = 'block';
      this.error.style.display = 'none';
      this.loader.style.display = 'none';
    }
  };
}

/* ================= HELPERS ================= */
const formatTime = ts =>
  new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getIcon = main => ({
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️'
}[main] || '🌤️');

/* ================= BACKGROUND ================= */
function changeBackground(type) {
  const themes = {
    clear: 'linear-gradient(135deg,#87CEEB,#FFD700)',
    clouds: 'linear-gradient(135deg,#B0C4DE,#778899)',
    rain: 'linear-gradient(135deg,#4682B4,#2F4F4F)',
    snow: 'linear-gradient(135deg,#FFF,#E0FFFF)'
  };
  document.body.style.background = themes[type] || themes.clear;
}

/* ================= API ================= */
async function fetchWeather(params) {
  UI.showLoading();
  try {
    const url = `${BASE_URL}?${params}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();
    UI.render(data);
  } catch (err) {
    UI.showError(err.message);
  }
}

/* ================= EVENTS ================= */
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  
  document.getElementById('cityForm').addEventListener('submit', e => {
    e.preventDefault();
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();

    // Validation: Check if field is empty
    if (!city) {
      UI.showError('❌ Please enter a city name.');
      cityInput.focus();
      return;
    }

    // Validation: Check minimum length (at least 2 characters)
    if (city.length < 2) {
      UI.showError('❌ City name must be at least 2 characters long.');
      cityInput.focus();
      return;
    }

    // Validation: Check for valid characters (letters, spaces, hyphens, apostrophes)
    const validCityPattern = /^[a-zA-Z\s\-']+$/;
    if (!validCityPattern.test(city)) {
      UI.showError('❌ City name can only contain letters, spaces, hyphens, and apostrophes.');
      cityInput.focus();
      return;
    }

    // All validations passed - fetch weather
    cityInput.value = '';
    fetchWeather(`q=${city}`);
  });

  document.getElementById('locationBtn').addEventListener('click', () => {
    if (navigator.geolocation) {
      UI.showLoading();
      navigator.geolocation.getCurrentPosition(
        pos => {
          fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        },
        error => {
          let errorMsg = 'Unable to get your location.';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location access denied. Please allow location access in browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location information is unavailable. Please try again.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timed out. Please try again.';
              break;
          }
          UI.showError(errorMsg);
        }
      );
    } else {
      UI.showError('Geolocation is not supported by your browser.');
    }
  });

  // Auto-load on page load
  document.getElementById('locationBtn').click();
});

/* ================= AUTO LOAD ================= */
// Already handled in DOMContentLoaded above
