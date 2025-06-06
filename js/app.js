// Récupération des éléments du DOM
const codePostalInput = document.getElementById("code-postal");
const communeSelect = document.getElementById("communeSelect");
const validationButton = document.getElementById("validationButton");
const daysRange = document.getElementById("daysRange");
const daysValue = document.getElementById("daysValue");
const loadingSpinner = document.getElementById("loadingSpinner");

// Variable globale pour stocker les données de la commune
let selectedCommuneData = null;

// Fonction pour récupérer les communes via l'API gouvernementale
async function fetchCommunesByCodePostal(codePostal) {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=nom,code,codesPostaux,centre`
    );
    const data = await response.json();
    console.table(data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
}

// Fonction pour remplir le select avec les communes trouvées
function displayCommunes(data) {
  communeSelect.innerHTML = "";
  
  // Suppression des messages d'erreur précédents
  const existingMessage = document.getElementById("error-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Vérification si des communes ont été trouvées
  if (data.length) {
    // Option par défaut
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Sélectionnez une commune";
    communeSelect.appendChild(defaultOption);
    
    // Création d'une option pour chaque commune
    data.forEach((commune) => {
      const option = document.createElement("option");
      option.value = commune.code;
      option.textContent = commune.nom;
      option.dataset.lat = commune.centre?.coordinates?.[1] || '';
      option.dataset.lon = commune.centre?.coordinates?.[0] || '';
      communeSelect.appendChild(option);
    });
    
    // Affichage des éléments de sélection
    communeSelect.style.display = "block";
    validationButton.style.display = "block";
  } else {
    // Gestion du cas où aucune commune n'est trouvée
    const message = document.createElement("p");
    message.id = "error-message";
    message.textContent = "Le code postal saisi n'est pas valide";
    message.classList.add('errorMessage');
    document.body.appendChild(message);

    // Masquage des éléments inutiles
    communeSelect.style.display = "none";
    validationButton.style.display = "none";

    // Rechargement automatique après 3 secondes
    setTimeout(() => location.reload(), 3000);
  }
}

// Fonction pour récupérer les données météo via l'API Météo Concept
async function fetchMeteoByCommune(selectedCommune, days = 1) {
  try {
    const promises = [];
    
    // Création des requêtes pour chaque jour demandé
    for (let i = 0; i < days; i++) {
      const response = fetch(
        `https://api.meteo-concept.com/api/forecast/daily/${i}?token=1cac03e1610fdd7a957cb8384f3026b88c7edce10e946b03cc3181b4b4438e24&insee=${selectedCommune}`
      );
      promises.push(response);
    }
    
    // Exécution parallèle de toutes les requêtes
    const responses = await Promise.all(promises);
    const dataPromises = responses.map(response => response.json());
    const allData = await Promise.all(dataPromises);
    
    return allData;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
}

// Fonction pour récupérer les options cochées par l'utilisateur
function getSelectedOptions() {
  return {
    showLatitude: document.getElementById("showLatitude").checked,
    showLongitude: document.getElementById("showLongitude").checked,
    showRainfall: document.getElementById("showRainfall").checked,
    showWind: document.getElementById("showWind").checked,
    showWindDirection: document.getElementById("showWindDirection").checked
  };
}

// Fonction pour obtenir les coordonnées de la commune sélectionnée
function getSelectedCommuneCoordinates() {
  const selectedOption = communeSelect.options[communeSelect.selectedIndex];
  return {
    latitude: selectedOption.dataset.lat,
    longitude: selectedOption.dataset.lon,
    nom: selectedOption.textContent
  };
}

// Gestion du slider pour le nombre de jours
daysRange.addEventListener("input", () => {
  daysValue.textContent = daysRange.value;
});

// Écouteur d'événement pour la saisie du code postal
codePostalInput.addEventListener("input", async () => {
  const codePostal = codePostalInput.value;
  communeSelect.style.display = "none";
  validationButton.style.display = "none";

  // Nettoyage des messages d'erreur précédents
  const existingMessage = document.getElementById("error-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Validation du format du code postal (5 chiffres)
  if (/^\d{5}$/.test(codePostal)) {
    try {
      const data = await fetchCommunesByCodePostal(codePostal);
      displayCommunes(data);
    } catch (error) {
      console.error(
        "Une erreur est survenue lors de la recherche de la commune :",
        error
      );
    }
  }
});

// Écouteur d'événement pour le bouton de validation
validationButton.addEventListener("click", async () => {
  const selectedCommune = communeSelect.value;
  const numberOfDays = parseInt(daysRange.value);
  
  if (selectedCommune) {
    // Affichage du spinner de chargement
    loadingSpinner.style.display = "block";
    
    try {
      // Récupération des données météo
      const weatherData = await fetchMeteoByCommune(selectedCommune, numberOfDays);
      const selectedOptions = getSelectedOptions();
      const communeCoordinates = getSelectedCommuneCoordinates();
      
      // Masquage du spinner
      loadingSpinner.style.display = "none";
      
      // Génération des cartes météo
      createWeatherCards(weatherData, selectedOptions, communeCoordinates);
    } catch (error) {
      console.error("Erreur lors de la requête API meteoConcept:", error);
      
      // Gestion de l'erreur avec message utilisateur
      loadingSpinner.style.display = "none";
      
      const errorMessage = document.createElement("p");
      errorMessage.textContent = "Erreur lors du chargement des données météo";
      errorMessage.classList.add('errorMessage');
      document.body.appendChild(errorMessage);
    }
  }
});