var map = L.map('map', {
    center: [47.570608, -54.720862],
    zoom: 4
});

var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

//var myDataPoint = L.marker([47.575232, -52.732506]).addTo(map);


function popupFunc(station_name, coordination) {
  //console.log(station_name)

    var popupElem = document.createElement("div");   
    //adding the information retrieved from data to the popup
    var node = document.createTextNode("Station name: " + station_name); 
    var node1 = document.createTextNode(" Coordinates: " + coordination);
    popupElem.appendChild(node);
    popupElem.appendChild(node1);
    
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 20, bottom: 30, left: 40},
    width = 220 - margin.left - margin.right,
    height = 160- margin.top - margin.bottom;

// append the svg object to the body of the page
    svg = d3.select(popupElem)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",

// When reading the csv, I must format variables:
function(d){
return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
},

// Now I can use this dataset:
function(data) {

// Add X axis --> it is a date format
var x = d3.scaleTime()
  .domain(d3.extent(data, function(d) { return d.date; }))
  .range([ 0, width ]);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, d3.max(data, function(d) { return +d.value; })])
  .range([ height, 0 ]);
svg.append("g")
  .call(d3.axisLeft(y));

// Add the line
svg.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 1.5)
  .attr("d", d3.line()
    .x(function(d) { return x(d.date) })
    .y(function(d) { return y(d.value) })
    )

})
    
    return popupElem;
}

//myDataPoint.bindPopup(popupFunc);
OpenTopoMap.addTo(map);


//Defining a function to handle data
function Aclosure() {
  return function handleData(data) {
    var coords = [];
    var station_name=[];
    
    for ( i = 1; i < data['table']["rows"].length; i++){
        //console.log("data: ", data['table']["rows"][i] )
        coords[i] = [data['table']["rows"][i][10],data['table']["rows"][i][7]]
        //getting the name of each station
        console.log(i)
        station_name[i]= data['table']["rows"][i][6]
        console.log("station name: ", station_name[i]);
    }
    
    for ( i = 1; i < coords.length; i++){
      var apoint = L.marker(coords[i]).on('click', function markerClick(e){
        var stationCoord = this.getLatLng();
        console.log(stationCoord);
        var lat=stationCoord.lat  ;
        var lang= stationCoord.lng;
        var stationCoordArray= [lat,lang];
        console.log(stationCoordArray);
        //calling retrieve and pass the stationCoordArray
        //utherwise  stationCoordArray is not accesible becuz its local
        var retrv= retrieve(stationCoordArray);
        
      }).addTo(map); 

      apoint.bindPopup(popupFunc(station_name[i],coords[i]));
      OpenTopoMap.addTo(map);
      
    }
    
    //retreiving data of a city only using its unique coordination
    function retrieve(stationCoordArray){
    //var stationcoord = prompt("Please enter the coordinate", coords[1][1]);
    var stationcoord = stationCoordArray;
    for (i = 1; i < data['table']["rows"].length; i++){
      citydata =  data['table']["rows"][i];
      if (citydata.includes(parseFloat(stationCoordArray[0]))){
        if (citydata.includes(parseFloat(stationCoordArray[1]))){

          //This is where the unique data is supposed to be shown!
        return alert("The station's ID is:  " + data['table']["rows"][i][0]);
        }
      }

    }
  }
    return document.getElementById("demo").innerHTML = data['table']["columnNames"].indexOf("minLongitude",0) + ' minlan and minlat';
  };
}
//Fetching .json file using URL
fetch("https://www.smartatlantic.ca/erddap/tabledap/allDatasets.json?datasetID%2Caccessible%2Cinstitution%2CdataStructure%2Ccdm_data_type%2Cclass%2Ctitle%2CminLongitude%2CmaxLongitude%2ClongitudeSpacing%2CminLatitude%2CmaxLatitude%2ClatitudeSpacing%2CminAltitude%2CmaxAltitude%2CminTime%2CmaxTime%2CtimeSpacing%2Cgriddap%2Csubset%2Ctabledap%2CMakeAGraph%2Csos%2Cwcs%2Cwms%2Cfiles%2Cfgdc%2Ciso19115%2Cmetadata%2CsourceUrl%2CinfoUrl%2Crss%2Cemail%2CtestOutOfDate%2CoutOfDate%2Csummary")
.then(response => {return response.json()})
.then(  
  Aclosure()
  );

  
