let map;
let fullData = [];
let filteredData = [];

const cityCoordinates = {
  "Sydney": { lat: -33.8688, lng: 151.2093 },
  "Melbourne": { lat: -37.8136, lng: 144.9631 },
  "Brisbane": { lat: -27.4698, lng: 153.0251 },
  "Perth": { lat: -31.9505, lng: 115.8605 },
  "Adelaide": { lat: -34.9285, lng: 138.6007 },
  "Hobart": { lat: -42.8821, lng: 147.3272 },
  "Darwin": { lat: -12.4634, lng: 130.8456 },
  "Canberra": { lat: -35.2809, lng: 149.1300 },
  "Rockhampton": { lat: -23.3783, lng: 150.5100 }
};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -25.2744, lng: 133.7751 },
    zoom: 4,
    mapTypeControl: false
  });

  $.getJSON("lor_map_data.json", function (data) {
    fullData = data;
    filteredData = data;
    placeMarkers(data);
    updateSidebarList(data);
  });

  $('#menuToggle').on('click', () => {
    $('#sidebar').toggleClass('open');
  });

  $('#searchInput').on('input', function () {
    const search = $(this).val().toLowerCase();

    // Open sidebar if hidden
    if (!$('#sidebar').hasClass('open')) {
      $('#sidebar').addClass('open');
    }

    filteredData = fullData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );

    updateSidebarList(filteredData);
  });
}

function placeMarkers(data) {
  const cityGroups = {};

  data.forEach(item => {
    const key = `${item.city}_${item.state}`;
    if (!cityGroups[key]) cityGroups[key] = [];
    cityGroups[key].push(item);
  });

  Object.entries(cityGroups).forEach(([key, items]) => {
    const [city] = key.split('_');
    const base = cityCoordinates[city] || { lat: -25 + Math.random(), lng: 133 + Math.random() };

    const radius = 0.08;
    const angleStep = (2 * Math.PI) / items.length;

    items.forEach((item, index) => {
      const angle = index * angleStep;
      const lat = base.lat + radius * Math.cos(angle);
      const lng = base.lng + radius * Math.sin(angle);

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: item.project_name || item.id
      });

      marker.addListener("click", () => {
        showPanel(item);
        $('#menuSection').addClass('d-none');
        $('#panelContent').removeClass('d-none');
        $('#sidebar').addClass('open');
      });
    });
  });
}

function updateSidebarList(data) {
  const container = $('#menuContent');
  container.empty();

  const grouped = {};
  data.forEach(item => {
    if (!grouped[item.state]) grouped[item.state] = [];
    grouped[item.state].push(item);
  });

  for (const state in grouped) {
    const section = $('<div class="state-section"></div>');
    section.append(`<div class="state-header">${state}</div>`);
    const list = $('<ul></ul>');
    grouped[state].forEach(item => {
      const label = item.project_name && item.project_name.trim() !== "" ? item.project_name : item.id;
      const li = $(`<li>${label}</li>`);
      li.on('click', () => {
        showPanel(item);
        $('#menuSection').addClass('d-none');
        $('#panelContent').removeClass('d-none');
        $('#sidebar').addClass('open');
      });
      list.append(li);
    });
    section.append(list);
    container.append(section);
  }

  $('#returnButton').on('click', () => {
    $('#menuSection').removeClass('d-none');
    $('#panelContent').addClass('d-none');
  });
}

function showPanel(data) {
  const content = document.getElementById("panelContent");
  const imageCarousel = createCarousel(data);

  content.innerHTML = `
    <button id="returnButton" class="btn btn-outline-secondary mb-3">← Back</button>
    <h5 class="mt-3">${data.project_name || data.id}</h5>
    <p><strong>Location/Type:</strong> ${data.location_type}</p>
    <p><strong>City:</strong> ${data.city}, ${data.state}</p>
    <p><strong>Aboriginal City:</strong> ${data.aboriginal_city}</p>
    <p><strong>Artist:</strong> ${data.artist}</p>
    <p><strong>Initiative:</strong> ${data.initiative_type}</p>
    <p><strong>Description:</strong> ${data.description}</p>
    <p><strong>Artist Bio:</strong> ${data.artist_bio}</p>
    <p><strong>Contact:</strong> ${data.contact}</p>
    <p><a href="${data.links}" target="_blank">More Info</a></p>
    ${imageCarousel}
  `;

  $('#returnButton').on('click', () => {
    $('#menuSection').removeClass('d-none');
    $('#
