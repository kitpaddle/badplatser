//// JS RELATED TO MAP / LEAFLET

const startingPos =[59.326798, 18.071707];
const URL_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const URL_SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const T_BADPLATSER = 'https://badplatsen.havochvatten.se/badplatsen/api';
const sthlmKommuner = ['Botkyrka', 'Danderyd', 'Ekerö', 'Haninge', 'Huddinge', 'Järfälla', 'Lidingö', 'Nacka', 'Norrtälje', 'Nykvarn', 'Nynäshamn', 'Salem', 'Sigtuna', 'Sollentuna', 'Solna', 'Stockholm', 'Sundbyberg', 'Södertälje', 'Tyresö', 'Täby', 'Upplands-Bro', 'Upplands Väsby', 'Vallentuna', 'Vaxholm','Värmdö', 'Österåker'];

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


async function loadBadplatser(url, options){
  
  const response = await fetch(url+'/feature');
  let d = await response.json();
  let data = d.features.filter( i => sthlmKommuner.some(e => e == i.properties.KMN_NAMN));

  const r = await fetch(url+'/detail')
  const details = await r.json();

  for (let i=0; i<data.length; i++){
    let id = data[i].properties.NUTSKOD;
    let detail = {};
    for (let j=0; j<details.length; j++){
      if(id == details[j].nutsCode){
        detail = details[j];
        if(id == "SE0110182000001238"){
          console.log(detail);
        }
      }
    }
    data[i].properties.algalValue = detail.algalValue;
    data[i].properties.algalText = detail.algalText;
    data[i].properties.bathInformation = detail.bathInformation;
    data[i].properties.euMotive = detail.euMotive;
    data[i].properties.euType = detail.euType;
    data[i].properties.contactUrl = detail.contactUrl;
    data[i].properties.sampleTemperature = detail.sampleTemperature;
    data[i].properties.classification = detail.classification;
    data[i].properties.classificationText = detail.classificationText;
    data[i].properties.dissuasion = detail.dissuasion;
    data[i].properties.sampleDate = detail.sampleDate;
    data[i].properties.sampleValue = detail.sampleValue;
  }
  console.log(data[34]);
  d.features = data;
  const tempLayer = L.geoJSON(d, options);
  tempLayer.addTo(map);
  
}

const badplatserStyle = {
  pointToLayer: function (feature, latlng) { 
    let p = feature.properties.classificationText;
    let colorStatus = '#999999';// Grey for unspecified
    if(p == 'Dålig kvalitet') colorStatus = '#d73027';
    else if(p == 'Tillfredställande kvalitet') colorStatus = '#d9ef8b';
    else if(p == 'Bra kvalitet') colorStatus = '#91cf60';
    else if(p == 'Utmärkt kvalitet') colorStatus = '#1a9850';

    return L.circleMarker(latlng, {
      radius: 7,
      fillColor: "#777777",
      weight: 5,
      color: colorStatus,
      opacity: 1,
      fillOpacity: 0.8
    })
  },
  onEachFeature: badplatsFeatures
}

function badplatsFeatures(feature, layer){

  let value = 'Uppgift saknas';
  switch(feature.properties.sampleValue){
    case 1:
      value = 'Tjänligt (låga halter bakterier)';
      break;
    case 2:
      value = 'Tjänligt med Anmärkning (föröjda nivåer bakterier men utan hälsorisk)';
      break;
    case 3:
      value = 'Otjänligt (ohälsosamma nivåer bakterier)';
      break;
    case 4:
      value = 'Uppgift saknas';
      break;
  }
  let date = new Date(feature.properties.sampleDate);
  let month = date.getMonth()+1;
  if (month<10) month="0"+month;
  let day = date.getDate();
  if (day<10) day = "0"+day;
  let hours = date.getHours();
  if(hours<10) hours="0"+hours;
  let mins = date.getMinutes();
  if (mins<10) mins="0"+mins;
  let d = date.getFullYear()+'-'+month+'-'+day+' '+hours+':'+mins;
  let output='<b>Namn: </b>'+feature.properties.NAMN;
  output+='<br><b>Klassifikation: </b>'+feature.properties.classification+' - '+feature.properties.classificationText;
  output+='<br><b>Senaste provtagning:</b>';
  output+='<ul><li>Datum: '+d+'</li>';
  output+='<li>Testresultat: '+feature.properties.sampleValue+' - '+value+'</li>';
  output+='<li>Algförekomst: '+feature.properties.algalText+'</li>';
  output+='<li>Temperatur: '+feature.properties.sampleTemperature+'C</li></ul>';
  output+='<b>Information: </b>'+feature.properties.bathInformation;
  output+='<br><b>För mer info besök: </b><a href="http://'+feature.properties.contactUrl+'">'+feature.properties.contactUrl+'</a>';
  layer.bindPopup(output);
}

loadBadplatser(T_BADPLATSER, badplatserStyle);