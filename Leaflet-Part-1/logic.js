  // Create a Leaflet map centered at [latitude, longitude] with a zoom level of 2
  var map = L.map('map').setView([20, -20], 2);

  // Add a tile layer (basemap) from OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Earthquake GeoJSON data URL from USGS
  var earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

  // Function to determine marker size based on earthquake magnitude
  function markerSize(magnitude) {
    return magnitude * 4;  // Scale magnitude for visualization
  }

  // Function to determine marker color based on earthquake depth
  function markerColor(depth) {
    if (depth > 90) return '#FF5F65';  // Deep red for deep quakes
    else if (depth > 70) return '#FCA35D';
    else if (depth > 50) return '#FDB72A';
    else if (depth > 30) return '#F7DB11';
    else if (depth > 10) return '#DCFF92';
    else return '#A3F600';  // Green for shallow quakes
  }

  // Use D3.js to fetch GeoJSON earthquake data
  d3.json(earthquakeUrl).then(function(data) {
    
    // Create a GeoJSON layer and add it to the Leaflet map
    L.geoJson(data, {
      // For each earthquake, create a circle marker
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: markerSize(feature.properties.mag),  // Size circle by magnitude
          fillColor: markerColor(feature.geometry.coordinates[2]),  // Color by depth (3rd coordinate is depth)
          color: '#000',  // Black outline for circles
          weight: 1,  // Outline thickness
          opacity: 1,
          fillOpacity: 0.8  // Slightly transparent fill
        });
      },
      // Add a popup to each marker displaying details of the earthquake
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`
          <strong>Location:</strong> ${feature.properties.place}<br>
          <strong>Magnitude:</strong> ${feature.properties.mag}<br>
          <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km<br>
          <strong>Time:</strong> ${new Date(feature.properties.time).toLocaleString()}
        `);
      }
    }).addTo(map);  // Add the layer to the Leaflet map
  }).catch(function(error) {
    console.error('Error fetching data:', error);  // Handle any errors in data fetching
  });

  // Add a legend to the map to represent depth with color
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    var grades = [-10, 10, 30, 50, 70, 90];
    var colors = ['#A3F600', '#DCFF92', '#F7DB11', '#FDB72A', '#FCA35D', '#FF5F65'];

    div.innerHTML += '<strong>Depth (km)</strong><br>';
    
    // Loop through depth intervals to generate legend items
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;  // Return the legend container
  };

  // Add the legend to the Leaflet map
  legend.addTo(map)
 