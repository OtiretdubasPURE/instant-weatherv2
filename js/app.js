// Sélection des éléments
const codePostalInput = document.getElementById("code-postal");
const communeSelect = document.getElementById("communeSelect");
const validationButton = document.getElementById("validationButton");
const daysRange = document.getElementById("daysRange");
const daysValue = document.getElementById("daysValue");
const loadingSpinner = document.getElementById("loadingSpinner");

// Variables pour stocker les données de la commune sélectionnée
let selectedCommuneData = null;

// Fonction pour effectuer la requête API des communes en utilisant le code postal
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

// Fonction pour afficher les communes dans la liste déroulante
function displayCommunes(data) {
  communeSelect.innerHTML = "";
  
  // Supprimer un message d'erreur précédent s'il existe
  const existingMessage = document.getElementById("error-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // S'il y a au moins une commune retournée dans data
  if (data.length) {
    // Ajouter une option par défaut
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Sélectionnez une commune";
    communeSelect.appendChild(defaultOption);
    
    data.forEach((commune) => {
      const option = document.createElement("option");
      option.value = commune.code;
      option.textContent = commune.nom;
      option.dataset.lat = commune.centre?.coordinates?.[1] || '';
      option.dataset.lon = commune.centre?.coordinates?.[0] || '';
      communeSelect.appendChild(option);
    });
    
    communeSelect.style.display = "block";
    validationButton.style.display = "block";
  } else {
    // Afficher un message d'erreur
    const message = document.createElement("p");
    message.id = "error-message";
    message.textContent = "Le code postal saisi n'est pas valide";
    message.classList.add('errorMessage');
    document.body.appendChild(message);

    // Masquer les éléments inutiles
    communeSelect.style.display = "none";
    validationButton.style.display = "none";

    // Recharger la page après 3 secondes
    setTimeout(() => location.reload(), 3000);
  }
}

// Fonction pour effectuer la requête API de météo
async function fetchMeteoByCommune(selectedCommune, days = 1) {
  try {
    const promises = [];
    
    // Créer les requêtes pour chaque jour
    for (let i = 0; i < days; i++) {
      const response = fetch(
        `https://api.meteo-concept.com/api/forecast/daily/${i}?token=1cac03e1610fdd7a957cb8384f3026b88c7edce10e946b03cc3181b4b4438e24&insee=${selectedCommune}`
      );
      promises.push(response);
    }
    
    // Attendre toutes les réponses
    const responses = await Promise.all(promises);
    const dataPromises = responses.map(response => response.json());
    const allData = await Promise.all(dataPromises);
    
    return allData;
  } catch (error) {
    console.error("Erreur lors de la requête API:", error);
    throw error;
  }
}

// Fonction pour obtenir les options sélectionnées
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

// Mise à jour de l'affichage du nombre de jours
daysRange.addEventListener("input", () => {
  daysValue.textContent = daysRange.value;
});

// Ajout de l'écouteur d'événement "input" sur le champ code postal
codePostalInput.addEventListener("input", async () => {
  const codePostal = codePostalInput.value;
  communeSelect.style.display = "none";
  validationButton.style.display = "none";

  // Supprimer un message d'erreur précédent s'il existe
  const existingMessage = document.getElementById("error-message");
  if (existingMessage) {
    existingMessage.remove();
  }

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

// Ajout de l'écouteur d'événement "click" sur le bouton de validation
validationButton.addEventListener("click", async () => {
  const selectedCommune = communeSelect.value;
  const numberOfDays = parseInt(daysRange.value);
  
  if (selectedCommune) {
    // Afficher le spinner de chargement
    loadingSpinner.style.display = "block";
    
    try {
      const weatherData = await fetchMeteoByCommune(selectedCommune, numberOfDays);
      const selectedOptions = getSelectedOptions();
      const communeCoordinates = getSelectedCommuneCoordinates();
      
      // Masquer le spinner
      loadingSpinner.style.display = "none";
      
      // Créer les cartes météo
      createWeatherCards(weatherData, selectedOptions, communeCoordinates);
    } catch (error) {
      console.error("Erreur lors de la requête API meteoConcept:", error);
      
      // Masquer le spinner et afficher un message d'erreur
      loadingSpinner.style.display = "none";
      
      const errorMessage = document.createElement("p");
      errorMessage.textContent = "Erreur lors du chargement des données météo";
      errorMessage.classList.add('errorMessage');
      document.body.appendChild(errorMessage);
    }
  }
});