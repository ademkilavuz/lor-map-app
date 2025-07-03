let map;

// City coordinates used for pin placement
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
    const grouped = {};

    data.forEach(item => {
      // Group by state
      if (!grouped[item.state]) grouped[item.state] = [];
      grouped[item.state].push(item);

      // Use city coordinates or fallback
      const coords = cityCoordinates[item.city] || {
        lat: -25 + Math.random(),
        lng: 133 + Math.random()
      };

      const marker = new google.maps.Marker({
        position: coords,
        map: map,
        title: item.project_name
      });

      const infowindow = new google.maps.InfoWindow({
        content: item.project_name
      });

      marker.addListener("mouseover", () => infowindow.open(map, marker));
      marker.addListener("mouseout", () => infowindow.close());
      marker.addListener("click", () => showPanel(item));
    });

    generateSidebarMenu(grouped);
  });
}

function generateSidebarMenu(groupedData) {
  const container = $('#menuContent');
  container.empty();

  for (const state in groupedData) {
    const section = $('<div class="state-section"></div>');
    section.append(`<div class="state-header">${state}</div>`);
    const list = $('<ul></ul>');
    groupedData[state].forEach(item => {
      const li = $(`<li>${item.id}</li>`);
      li.on('click', () => showPanel(item));
      list.append(li);
    });
    section.append(list);
    container.append(section);
  }

  $('#menuToggle').on('click', () => {
    $('#sidebar').toggleClass('open');
  });
}

function showPanel(data) {
  const content = document.getElementById("panelContent");
  const imageCarousel = createCarousel(data);

  content.innerHTML = `
    <h5 class="mt-3">${data.project_name}</h5>
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
}

function createCarousel(data) {
  if (!data.images || data.images.trim() === '') return '';
  const folderPath = `visuals/${data.state}/${data.id}`;
  const imageList = data.images.split(',').map(img => img.trim()).filter(Boolean);
  if (imageList.length === 0) return '';

  const indicators = imageList.map((_, idx) =>
    `<button type="button" data-bs-target="#carousel${data.id}" data-bs-slide-to="${idx}" ${idx === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${idx+1}"></button>`
  ).join('');

  const items = imageList.map((img, idx) =>
    `<div class="carousel-item ${idx === 0 ? 'active' : ''}">
      <img src="${folderPath}/${img}" class="d-block w-100" alt="Slide ${idx+1}" />
    </div>`
  ).join('');

  return `
    <div id="carousel${data.id}" class="carousel slide mt-3" data-bs-ride="carousel">
      <div class="carousel-indicators">${indicators}</div>
      <div class="carousel-inner">${items}</div>
      <button class="carousel-control-prev" type="button" data-bs-target="#carousel${data.id}" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carousel${data.id}" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  `;
}
