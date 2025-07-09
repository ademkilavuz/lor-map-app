let selectedMarker = null;
const dark_pin_icon = "https://ademkilavuz.github.io/lor-map-app/assets/images/Red_pin.png";
const default_pin_icon = "https://ademkilavuz.github.io/lor-map-app/assets/images/Yellow_pin.png";


let map;
let fullData = [];
let markers = [];
let geocoder;

function initMap() {
  geocoder = new google.maps.Geocoder();

  map = new google.maps.Map(document.getElementById("map"), {
     center: { lat: -25.2744, lng: 133.7751 },
    zoom: 4,
    mapTypeControl: false
  });
  
   map.addListener("click", () => {
    if (selectedMarker) {
      selectedMarker.setIcon(default_pin_icon);
      selectedMarker = null;
    }
  });

  $.getJSON("lor_map_data.json", function (data) {
    fullData = data;
    geocodeAndPlaceMarkers(fullData);
    updateSidebarList(fullData);
  });

  $('#menuToggle').on('click', () => {
    $('#sidebar').toggleClass('open');
  });

  $('#searchInput').on('input', function () {
    const search = $(this).val().toLowerCase();
    $('#sidebar').addClass('open');

    const filtered = fullData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );

    updateSidebarList(filtered);
  });
}

function geocodeAndPlaceMarkers(data) {
  data.forEach((item) => {
    const address = item.address;
    if (!address) return;

    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK") {
        const location = results[0].geometry.location;

        const marker = new google.maps.Marker({
      icon: default_pin_icon,
          map: map,
          position: location,
          title: item.projectName || item.id
        });

        markers.push({ id: item.id, marker });

        marker.addListener("click", () => {
        if (selectedMarker && selectedMarker !== marker) {
          selectedMarker.setIcon(default_pin_icon);
        }
        marker.setIcon(dark_pin_icon);
        selectedMarker = marker;

          showPanel(item);
          $('#menuSection').addClass('d-none');
          $('#panelContent').removeClass('d-none');
          $('#sidebar').addClass('open');
        });
      }
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
    section.append(<div class="state-header">${state}</div>);
    const list = $('<ul></ul>');
    grouped[state].forEach(item => {
      const label = item.projectName && item.projectName.trim() !== "" ? item.projectName + " - " + item.locationType : item.id;
      const li = $(<li>${label}</li>);
      li.on('click', () => {
        showPanel(item);
        $('#menuSection').addClass('d-none');
        $('#panelContent').removeClass('d-none');
        $('#sidebar').addClass('open');
        panToMarker(item.id);
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

function panToMarker(id) {
  google.maps.event.addListenerOnce(map, 'idle', () => {
  const found = markers.find(m => m.id === id);
  if (found) {
    const projection = map.getProjection();
    const center = found.marker.getPosition();

    const scale = Math.pow(2, map.getZoom());
    const offsetX = (map.getDiv().offsetWidth * 0.25) / scale;

    const latLng = found.marker.getPosition();
    const worldCoordinateCenter = projection.fromLatLngToPoint(latLng);
    const pixelOffset = new google.maps.Point(offsetX, 0);
    const worldCoordinateNewCenter = new google.maps.Point(
      worldCoordinateCenter.x - pixelOffset.x,
      worldCoordinateCenter.y
    );
    const newCenter = projection.fromPointToLatLng(worldCoordinateNewCenter);

    map.panTo(newCenter);
    map.setZoom(12);
  }
  });
}

function showPanel(data) {
  const content = document.getElementById("panelContent");
  const imageCarousel = createCarousel(data);

  content.innerHTML = 
    <button id="returnButton" class="btn btn-outline-secondary mb-3">← Back</button>
    ${imageCarousel}
    <h5 class="mt-3">${data.projectName}</h5>
    <p><strong>Location/Type:</strong> ${data.locationType}</p>
    <p><strong>City:</strong> ${data.city}, ${data.state}</p>
    <p><strong>Aboriginal City:</strong> ${data.aboriginalCity}</p>
    <p><strong>Artist:</strong> ${data.artist}</p>
    <p><strong>Initiative:</strong> ${data.initiative}</p>
    <p><strong>Description:</strong> ${data.description}</p>
    <p><strong>Artist Bio:</strong> ${data.artistBio}</p>
    <p><strong>Contact:</strong> ${data.contact}</p>
    <p><a href="${data.moreInfo}" target="_blank">More Info</a></p>
  ;

  $('#returnButton').on('click', () => {
    $('#menuSection').removeClass('d-none');
    $('#panelContent').addClass('d-none');
  });
}

function createCarousel(data) {
  if (!data.images || data.images.length === 0) return '';

  const indicators = data.images.map((_, idx) =>
    <button type="button" data-bs-target="#carousel${data.id}" data-bs-slide-to="${idx}" ${idx === 0 ? 'class="active"' : ''}></button>
  ).join('');

  const items = data.images.map((file, idx) => {
    const filePath = assets/${data.id}/${file};
    const ext = file.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return 
        <div class="carousel-item ${idx === 0 ? 'active' : ''}">
          <img src="${filePath}" class="d-block" alt="Slide ${idx + 1}" />
        </div>;
    } else {
      return 
        <div class="carousel-item ${idx === 0 ? 'active' : ''}">
          <div class="p-4 text-center">
            <i class="bi bi-file-earmark-arrow-down-fill" style="font-size: 3rem;"></i>
            <p class="mt-2">${file}</p>
            <a href="${filePath}" download class="btn btn-primary btn-sm">Download File</a>
          </div>
        </div>;
    }
  }).join('');

  return 
    <div id="carousel${data.id}" class="carousel slide" data-bs-ride="false">
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
    </div>;
}
