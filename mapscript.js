//// JS RELATED TO MAP / LEAFLET

const startingPos =[59.326798, 18.071707];
const URL_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const URL_SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// Creating MAP and baseMap Layer and adding them to the DIV
// So even if other layers take time to load map shows right away
const map = L.map('map', {
  center: startingPos,
  zoom: 12,
  fullscreenControl: true,
  attributionControl: false,
  renderer: L.canvas()
});

L.control.attribution({
  position: 'bottomleft'
}).addTo(map);

// Add Geolocation button/feature
L.control.locate().addTo(map);

// Creating Basemaps
const baseMap = L.tileLayer(URL_OSM, {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kitpaddle',
  minZoom: 10
}).addTo(map);
const baseMapSat = new L.tileLayer(URL_SAT, {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a> & <a href="https://www.openstreetmap.org/copyright">OSM</a>& <a href="https://www.esri.com/en-us/home">ESRI</a> kitpaddle',
  minZoom: 10,
  updateWhenIdle: true,
  keepBuffer: 5,
  edgeBufferTiles: 2
});
// Creating Layergroup for basemaps
const baseMaps = {
  "Detailed Map": baseMap,
  "Satellite": baseMapSat
};

// Create control with layerGroups
let panelLayers = new L.control.layers(baseMaps);
// Add control AND layers to map
panelLayers.addTo(map);