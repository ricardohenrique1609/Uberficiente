
// Variáveis globais
let map;
let geocoder;
let selectedField = 'pickup'; // Campo selecionado (pickup ou dropoff)
let directionsService; // Para calcular a rota e a distância

// Inicializa o mapa
function initMap() {
  // Inicializando o mapa centrado em São Paulo, Brasil
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.5505, lng: -46.6333 }, // São Paulo
    zoom: 12,
  });

  // Inicializa o geocoder e o serviço de direções
  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService();

  // Adiciona evento de clique no mapa
  map.addListener("click", function (event) {
    const clickedLocation = event.latLng;
    getAddressFromCoordinates(clickedLocation);
  });

  // Adiciona eventos nos campos de retirada e chegada
  document.getElementById("pickup").addEventListener("focus", function () {
    selectedField = 'pickup';
  });

  document.getElementById("dropoff").addEventListener("focus", function () {
    selectedField = 'dropoff';
  });

  // Adiciona o evento de submit no formulário
  document.getElementById("rideForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Previne o recarregamento da página
    calculatePrice(); // Chama a função de cálculo de preço
  });
}

// Função para obter o endereço das coordenadas
function getAddressFromCoordinates(latLng) {
  geocoder.geocode({ location: latLng }, function (results, status) {
    if (status === "OK") {
      if (results[0]) {
        const address = results[0].formatted_address;
        
        if (selectedField === 'pickup') {
          document.getElementById("pickup").value = address;
        } else {
          document.getElementById("dropoff").value = address;
        }
      } else {
        alert("Nenhum resultado encontrado.");
      }
    } else {
      alert("Geocodificação falhou: " + status);
    }
  });
}


// Variáveis globais


function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -23.5505, lng: -46.6333 },
    zoom: 12,
  });

  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService();

  map.addListener("click", function (event) {
    const clickedLocation = event.latLng;
    getAddressFromCoordinates(clickedLocation);
  });

  document.getElementById("pickup").addEventListener("focus", function () {
    selectedField = 'pickup';
  });

  document.getElementById("dropoff").addEventListener("focus", function () {
    selectedField = 'dropoff';
  });

  document.getElementById("rideForm").addEventListener("submit", function (event) {
    console.log("Formulário enviado"); // Verifique se o console imprime isso
    event.preventDefault(); // Previne o recarregamento da página
    calculatePrice(); // Chama a função de cálculo de preço
  });
}

function getAddressFromCoordinates(latLng) {
  geocoder.geocode({ location: latLng }, function (results, status) {
    if (status === "OK") {
      if (results[0]) {
        const address = results[0].formatted_address;
        if (selectedField === 'pickup') {
          document.getElementById("pickup").value = address;
        } else {
          document.getElementById("dropoff").value = address;
        }
      } else {
        alert("Nenhum resultado encontrado.");
      }
    } else {
      alert("Geocodificação falhou: " + status);
    }
  });
}

function calculatePrice() {
  console.log("Calculando preço..."); // Adicione este log para ver se a função está sendo chamada
  const pickupAddress = document.getElementById("pickup").value;
  const dropoffAddress = document.getElementById("dropoff").value;

  if (!pickupAddress || !dropoffAddress) {
    alert("Por favor, insira os locais de retirada e chegada.");
    return;
  }

  const request = {
    origin: pickupAddress,
    destination: dropoffAddress,
    travelMode: 'DRIVING',
  };

  directionsService.route(request, function (result, status) {
    if (status == 'OK') {
      const distanceInMeters = result.routes[0].legs[0].distance.value;
      const distanceInKm = distanceInMeters / 1000;
      const price = calculateFare(distanceInKm);

      document.getElementById("priceDisplay").innerHTML = `Preço estimado: R$ ${price.toFixed(2)}`;
    } else {
      alert("Não foi possível calcular a rota. Verifique os endereços.");
    }
  });
}

function calculateFare(distanceInKm) {
  const baseFare = 5.00;
  const perKmRate = 2.00;
  const totalFare = baseFare + (perKmRate * distanceInKm);
  return totalFare;
}
document.querySelector('.button').addEventListener('click', function(event) {
  event.preventDefault(); // Previne qualquer comportamento padrão
  calculatePrice(); // Chama a função de cálculo de preço
});
