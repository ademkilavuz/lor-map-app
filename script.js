let map;
let offsetMap = {}; // track offset per city

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -25.2744, lng: 133.7751 },
    zoom: 4,
    mapTypeControl: false
  });

  $.getJSON("lor_map_data.json", function (data) {
    data.forEach((item) => {
      const cityKey = `${item.city}_${item.state}`;
      if (!offsetMap[cityKey]) offsetMap[cityKey] = 0;

      const latBase = -25 + Math.random(); // Placeholder — ideally use real lat/lng
      const lngBase = 133 + Math.random();

      const offset = offsetMap[cityKey] * 0.02;
      offsetMap[cityKey]++;

      const lat = latBase + offset;
      const lng = lngBase + offset;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: item.project_name
      });

      const infowindow = new google.maps.InfoWindow({
        content: item.project_name
      });

      marker.addListener("mouseover", () => infowindow.open(map, marker));
      marker.addListener("mouseout", () => infowindow.close());

      marker.addListener("click", () => {
        showPanel(item);
      });
    });
  });
}

function showPanel(data) {
  const panel = document.getElementById("infoPanel");
  const content = document.getElementById("panelContent");
  panel.classList.add("open");

  const imageCarousel = createCarousel(data);

  content.innerHTML = `
    <h4>${data.project_name}</h4>
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

  document.getElementById("closePanel").onclick = () => {
    panel.classList.remove("open");
  };
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
    <div id="carousel${data.id}" class="carousel slide" data-bs-ride="carousel">
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
