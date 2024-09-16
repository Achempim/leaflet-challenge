// Create a map centered at some point on the globe (latitude, longitude) with a zoom level
var map = L.map('map').setView([20, -20], 2);

// Add a tile layer (basemap) to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch earthquake GeoJSON data from USGS
var earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Define marker size based on earthquake magnitude
function markerSize(magnitude) {
  return magnitude * 4;
}

// Define marker color based on earthquake depth
function markerColor(depth) {
  if (depth > 90) return '#FF5F65';  // Deep red for deep quakes
  else if (depth > 70) return '#FCA35D';
  else if (depth > 50) return '#FDB72A';
  else if (depth > 30) return '#F7DB11';
  else if (depth > 10) return '#DCFF92';
  else return '#A3F600';             // Green for shallow quakes
}

// Fetch data and plot earthquakes on the map
fetch(earthquakeUrl)
  .then(response => response.json())
  .then(data => {
    // Define a GeoJSON layer
    L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: markerSize(feature.properties.mag),
          fillColor: markerColor(feature.geometry.coordinates[2]),  // depth is the third coordinate
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      // Bind popups to each marker
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`
          <strong>Location:</strong> ${feature.properties.place}<br>
          <strong>Magnitude:</strong> ${feature.properties.mag}<br>
          <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km<br>
          <strong>Time:</strong> ${new Date(feature.properties.time).toLocaleString()}
        `);
      }
    }).addTo(map);
  });

// Add a legend to the map
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'legend');
  var grades = [-10, 10, 30, 50, 70, 90];
  var colors = ['#A3F600', '#DCFF92', '#F7DB11', '#FDB72A', '#FCA35D', '#FF5F65'];

  div.innerHTML += '<strong>Depth (km)</strong><br>';
  
  // Loop through depth intervals to create a legend
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + colors[i] + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

// Add the legend to the map
legend.addTo(map);
