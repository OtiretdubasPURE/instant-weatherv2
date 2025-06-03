// Fonction pour créer les cartes météo
function createWeatherCards(weatherDataArray, selectedOptions, communeInfo) {
  // Vider la section météo
  const weatherSection = document.getElementById("weatherInformation");
  weatherSection.innerHTML = "";
  
  // Créer un conteneur pour toutes les cartes
  const cardsContainer = document.createElement("div");
  cardsContainer.classList.add("weather-cards-container");
  
  // Créer une carte pour chaque jour
  weatherDataArray.forEach((dayData, index) => {
    const card = createSingleWeatherCard(dayData, selectedOptions, communeInfo, index);
    cardsContainer.appendChild(card);
  });
  
  // Ajouter le conteneur à la section météo
  weatherSection.appendChild(cardsContainer);
  
  // Ajouter un bouton de retour
  addReloadButton();
  
  // Gérer la visibilité des sections
  const requestSection = document.getElementById("cityForm");
  requestSection.style.display = "none";
  weatherSection.style.display = "block";
}

// Fonction pour créer une seule carte météo
function createSingleWeatherCard(dayData, selectedOptions, communeInfo, dayIndex) {
  const card = document.createElement("div");
  card.classList.add("weather-card");
  
  // Titre de la carte avec la date
  const cardTitle = document.createElement("h3");
  const date = new Date(dayData.forecast.datetime);
  const dateString = date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  if (dayIndex === 0) {
    cardTitle.textContent = `Aujourd'hui - ${dateString}`;
  } else {
    cardTitle.textContent = dateString;
  }
  cardTitle.classList.add("card-title");
  card.appendChild(cardTitle);
  
  // Nom de la commune
  const communeName = document.createElement("p");
  communeName.textContent = `📍 ${communeInfo.nom}`;
  communeName.classList.add("commune-name");
  card.appendChild(communeName);
  
  // Conteneur pour les informations météo principales
  const mainWeatherInfo = document.createElement("div");
  mainWeatherInfo.classList.add("main-weather-info");
  
  // Icône météo basée sur le code weather
  const weatherIcon = getWeatherIcon(dayData.forecast.weather);
  const iconElement = document.createElement("div");
  iconElement.innerHTML = weatherIcon;
  iconElement.classList.add("weather-icon");
  mainWeatherInfo.appendChild(iconElement);
  
  // Conteneur pour les températures
  const tempContainer = document.createElement("div");
  tempContainer.classList.add("temperature-container");
  
  const tempMin = document.createElement("div");
  tempMin.innerHTML = `🌡️ Min: <strong>${dayData.forecast.tmin}°C</strong>`;
  tempMin.classList.add("temp-min");
  
  const tempMax = document.createElement("div");
  tempMax.innerHTML = `🌡️ Max: <strong>${dayData.forecast.tmax}°C</strong>`;
  tempMax.classList.add("temp-max");
  
  tempContainer.appendChild(tempMin);
  tempContainer.appendChild(tempMax);
  mainWeatherInfo.appendChild(tempContainer);
  
  card.appendChild(mainWeatherInfo);
  
  // Informations météo de base
  const baseInfo = document.createElement("div");
  baseInfo.classList.add("base-weather-info");
  
  const rainProba = document.createElement("div");
  rainProba.innerHTML = `☔ Probabilité de pluie: <strong>${dayData.forecast.probarain}%</strong>`;
  baseInfo.appendChild(rainProba);
  
  const sunHours = document.createElement("div");
  sunHours.innerHTML = `☀️ Ensoleillement: <strong>${displayHours(dayData.forecast.sun_hours)}</strong>`;
  baseInfo.appendChild(sunHours);
  
  card.appendChild(baseInfo);
  
  // Informations supplémentaires (si sélectionnées)
  const additionalInfo = document.createElement("div");
  additionalInfo.classList.add("additional-info");
  
  if (selectedOptions.showLatitude && communeInfo.latitude) {
    const latitude = document.createElement("div");
    latitude.innerHTML = `🌍 Latitude: <strong>${parseFloat(communeInfo.latitude).toFixed(4)}°</strong>`;
    additionalInfo.appendChild(latitude);
  }
  
  if (selectedOptions.showLongitude && communeInfo.longitude) {
    const longitude = document.createElement("div");
    longitude.innerHTML = `🌍 Longitude: <strong>${parseFloat(communeInfo.longitude).toFixed(4)}°</strong>`;
    additionalInfo.appendChild(longitude);
  }
  
  if (selectedOptions.showRainfall) {
    const rainfall = document.createElement("div");
    rainfall.innerHTML = `🌧️ Cumul de pluie: <strong>${dayData.forecast.rr1 || 0} mm</strong>`;
    additionalInfo.appendChild(rainfall);
  }
  
  if (selectedOptions.showWind) {
    const wind = document.createElement("div");
    wind.innerHTML = `💨 Vent moyen: <strong>${dayData.forecast.wind10m || 0} km/h</strong>`;
    additionalInfo.appendChild(wind);
  }
  
  if (selectedOptions.showWindDirection) {
    const windDirection = document.createElement("div");
    const directionText = getWindDirectionText(dayData.forecast.dirwind10m);
    windDirection.innerHTML = `🧭 Direction du vent: <strong>${dayData.forecast.dirwind10m || 0}° (${directionText})</strong>`;
    additionalInfo.appendChild(windDirection);
  }
  
  if (additionalInfo.children.length > 0) {
    const additionalTitle = document.createElement("h4");
    additionalTitle.textContent = "Informations supplémentaires";
    additionalTitle.classList.add("additional-title");
    card.appendChild(additionalTitle);
    card.appendChild(additionalInfo);
  }
  
  return card;
}

// Fonction pour obtenir l'icône météo selon le code
function getWeatherIcon(weatherCode) {
  const weatherIcons = {
    0: "☀️", // Soleil
    1: "🌤️", // Peu nuageux
    2: "⛅", // Ciel voilé
    3: "☁️", // Nuageux
    4: "☁️", // Très nuageux
    5: "🌫️", // Brouillard
    6: "🌦️", // Pluie faible
    7: "🌧️", // Pluie modérée
    8: "🌧️", // Pluie forte
    9: "🌦️", // Pluie faible intermittente
    10: "🌧️", // Pluie modérée intermittente
    11: "🌧️", // Pluie forte intermittente
    12: "🌨️", // Neige faible
    13: "❄️", // Neige modérée
    14: "❄️", // Neige forte
    15: "🌨️", // Neige faible intermittente
    16: "❄️", // Neige modérée intermittente
    17: "❄️", // Neige forte intermittente
    18: "🌧️", // Pluie et neige mêlées faibles
    19: "🌧️", // Pluie et neige mêlées modérées
    20: "🌧️", // Pluie et neige mêlées fortes
    21: "⛈️", // Orage faible
    22: "⛈️", // Orage modéré
    23: "⛈️", // Orage fort
    24: "⛈️", // Orage faible avec grêle
    25: "⛈️", // Orage modéré avec grêle
    26: "⛈️", // Orage fort avec grêle
    27: "🌨️", // Chutes de neige faibles
    28: "❄️", // Chutes de neige modérées
    29: "❄️"  // Chutes de neige fortes
  };
  
  return weatherIcons[weatherCode] || "🌤️";
}

// Fonction pour convertir la direction du vent en texte
function getWindDirectionText(degrees) {
  if (!degrees && degrees !== 0) return "N/A";
  
  const directions = [
    "Nord", "Nord-Nord-Est", "Nord-Est", "Est-Nord-Est",
    "Est", "Est-Sud-Est", "Sud-Est", "Sud-Sud-Est",
    "Sud", "Sud-Sud-Ouest", "Sud-Ouest", "Ouest-Sud-Ouest",
    "Ouest", "Ouest-Nord-Ouest", "Nord-Ouest", "Nord-Nord-Ouest"
  ];
  
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Fonction pour afficher les heures correctement
function displayHours(sunHours) {
  if (!sunHours && sunHours !== 0) return "N/A";
  return sunHours + (sunHours > 1 ? " heures" : " heure");
}

// Fonction pour ajouter le bouton de rechargement
function addReloadButton() {
  // Supprimer le bouton existant s'il y en a un
  const existingButton = document.getElementById("reloadButton");
  if (existingButton) {
    existingButton.remove();
  }
  
  const reloadButton = document.createElement("button");
  reloadButton.id = "reloadButton";
  reloadButton.textContent = "🔄 Nouvelle recherche";
  reloadButton.classList.add("reloadButton");
  
  // Ajouter un listener sur le bouton
  reloadButton.addEventListener("click", function () {
    location.reload();
  });
  
  // Ajouter le bouton après la section météo
  const weatherSection = document.getElementById("weatherInformation");
  weatherSection.appendChild(reloadButton);
}

// Fonction de compatibilité pour l'ancienne version (si nécessaire)
function createCard(data) {
  console.warn("createCard() est obsolète, utilisez createWeatherCards() à la place");
  const selectedOptions = {
    showLatitude: false,
    showLongitude: false,
    showRainfall: false,
    showWind: false,
    showWindDirection: false
  };
  const communeInfo = { nom: "Commune inconnue", latitude: null, longitude: null };
  createWeatherCards([data], selectedOptions, communeInfo);
}