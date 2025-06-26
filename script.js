let map;

function initMap() {
  $.getJSON("content.json", function(data) {
    $('#pageTitle').text(data.title);

    const location = data.location;
    const officeLatLng = { lat: location.lat, lng: location.lng };

    map = new google.maps.Map(document.getElementById("map"), {
      center: officeLatLng,
      zoom: 16,
      mapTypeControl: false
    });

    const marker = new google.maps.Marker({
      position: officeLatLng,
      map: map,
      title: location.name
    });

    const contentString = `
      <div class="text-center">
        <img src="${location.logo}" alt="LOR Logo" style="max-width: 150px;" class="mb-2"><br>
        <strong>${location.name}</strong><br>
        <small>${location.address}</small>
      </div>
    `;

    const infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    marker.addListener("click", () => {
      infowindow.open(map, marker);
    });
  });
}
