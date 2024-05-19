/*===================================================
WebMapping of Location of Interest and Their travel Path
Author: Pascal Ogola              
===================================================*/
// Add the map and the tiles

var mapCentre = [-1.240347, 36.828053]
var mapZoom = 15

var map = L.map('map').setView(mapCentre, mapZoom);
// Add Basemap Tilelayers
// Two basemaps have been selected, one satellite and the other and topomap
// Add Osm Layer
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
 // Add Google Satelite Layer
googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
   maxZoom: 20,
   subdomains:['mt0','mt1','mt2','mt3']
});

// Define Layer Control Variables
// Add the basemaps to the Layer Control Variable
var baseLayers = {
    "OpenStreetMap": osm,
    "Satellite":googleSat
};

var overlays = {};
//Add Layer Control to Map
var layerControl = L.control.layers(baseLayers, overlays).addTo(map);

// Fetch data and add to the map
// Define function to fetch the data and convert it to a geojson layer
// Function to fetch and add GeoJSON layer
function fetchAndAddGeoJSONLayer(map, layerURL, options) {
    return fetch(layerURL)
    .then(response => {
        if (!response.ok) {
        throw new Error(`Failed to fetch ${layerURL}: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Create an L.GeoJSON layer with the fetched data and specified options and add to map
        var geojsonLayer = L.geoJSON(data, options).addTo(map);

        // Add a flag to add popup and further styling
        if (options) {
            geojsonLayer.bindPopup(options.popupContent);
        }
        // Return the GeoJSON layer
        return geojsonLayer;
    })
    .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
    });
}
  
// Fetch and add the Points of Interest to the Map
const PointsOfInterestURL = './data/PointsOfinterest.geojson';
var PoIMarkerOptions = L.icon({
    iconUrl: './img/marker-red.png',
    iconSize: [25, 40],
    iconAnchor: [20, 20],
});
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#800080",
    color: "#800080",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
const PointsOfInterestOptions = {
    // convert the layer to marker
    pointToLayer: function (layer, latlng) {
        var type = layer.properties.type;
        if (type === 'PoI'){
            return L.marker(latlng, {icon : PoIMarkerOptions});
        } else {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
        // console.log(layer.properties.type)
        // return L.marker(latlng, {icon : PoIMarkerOptions});
        // return L.circleMarker(latlng, PoIMarkerOptions);
    },
    // Popup content to be displayed when clicking on PointsOfInterest
    popupContent: function (layer) {
      return layer.feature.properties.name;
    }
};
const PathToPointsOfInterestURL = './data/PathToPointsOfinterest.geojson';
const PathToPointsOfInterestOptions = {
    // Add layer style
    style: {
        color: 'red',
        weight: 3,
        opacity: 0.6,
    },
    // Popup content to be displayed when clicking on PointsOfInterest
    popupContent: function (layer) {
      return layer.feature.properties.name;
    }
};
  
  // Fetch and add the GeoJSON layer to the map
var PoI = fetchAndAddGeoJSONLayer(map, PointsOfInterestURL, PointsOfInterestOptions)
.then(geojsonLayer => {
    // Add the Layer to the Layer Control
    layerControl.addOverlay(geojsonLayer, "Points of Interest");
});
var RouteToPointOfInterest = fetchAndAddGeoJSONLayer(map, PathToPointsOfInterestURL, PathToPointsOfInterestOptions)
.then(geojsonLayer => {
    // Add the Layer to the Layer Control
    layerControl.addOverlay(geojsonLayer, "Route to Point of Interest");
});


// Add Legend to the Map
const legend = L.control.Legend({
    position: "bottomright",
    collapsed: false,
    symbolWidth: 24,
    opacity: 1,
    column: 1,
    legends: [{
        label: "Point Of Interest",
        type: "image",
        url: "img/marker-red.png",
    }, {
        label: "Karura Forest Gate",
        type: "circle",
        color: "#800080",
        fillColor: "#800080",
        weight: 1,
        layers: PoI
    },{
        label: "Route to Point of Interest",
        type: "polyline",
        color: "#FF0000",
        fillColor: "#FF0000",
        weight: 2,
        layers: RouteToPointOfInterest
    }]
}).addTo(map);