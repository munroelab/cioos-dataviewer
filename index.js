var map = L.map('map', {
    center: [47.570608, -54.720862],
    zoom: 4
});


var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


OpenTopoMap.addTo(map);   

function popupFunc(row) {
    var popupElem = document.createElement("div");   
    var popupSVGElem= document.createElement("div");   
    var node = document.createTextNode("Station name: " + row['title']); 
    var node1 = document.createTextNode(" dataset_id: " + row['datasetID']);
    var svgNode = createSVG(popupSVGElem, row);
    popupElem.appendChild(node);
    popupElem.appendChild(node1);
    popupElem.appendChild(svgNode);
    return popupElem;
}

function createSVG(popupSVGElem, row){
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 20, bottom: 30, left: 40},
    width = 300 - margin.left - margin.right,
    height = 280- margin.top - margin.bottom;
    console.log(row);

// append the svg object to the body of the page
    var svg =d3.select(popupSVGElem)
   // .append("div")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  //return svg.node();
  
  //Read the data

  let url = dataurl('csv', 
                    row['datasetID'], 
                    'time%2Cwind_spd_avg&time%3E=2018-11-21&time%3C=2020-01-29T22%3A00%3A01Z')
 
    d3.csv(url,
    // When reading the csv, I must format variables:
    function(d){
    return { date : d3.utcParse("%Y-%m-%dT%H:%M:%SZ")(d.time), value : d.wind_spd_avg }
    
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

    // adding Labels to axises
    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", 250 )
    .text("time");

    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -34)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Average wind speed ");

    // Add the line
    svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.date) })
      .y(function(d) { return y(d.value) })
      .defined(function(d) { return !isNaN(d.value); })
      )
      
    })
  
  return popupSVGElem;
}

// function retrieveStationData(stationCoordArray){
//     //var stationcoord = prompt("Please enter the coordinate", coords[1][1]);
//     var stationcoord = stationCoordArray;
//     for (i = 1; i < data['table']["rows"].length; i++){
//       stationData =  data['table']["rows"][i];
//       if (stationData.includes(parseFloat(stationCoordArray[0]))){
//         if (stationData.includes(parseFloat(stationCoordArray[1]))){

//           //This is where the unique data is supposed to be shown!
//        // return alert("The station's ID is:  " + data['table']["rows"][i][0]);
//         }
//       }

//     }
//   }
  //myDataPoint.bindPopup(  popupFunc);
function markerClick(e){
    var stationCoord = this.getLatLng();
    console.log(stationCoord);
    var lat=stationCoord.lat;
    var lang= stationCoord.lng;
    var stationCoordArray= [lat,lang];
    console.log(stationCoordArray);
    //var retrv= retrieveStationData(stationCoordArray);
} 

//Function to handle data
function handleData(data) {
  console.log(data);
  data.forEach(row=>{
    coords = [row['minLatitude'], row['minLongitude']]
    var marker =L.marker(coords);
      //.bindPopup(popupFunc(row))
      marker.addTo(map);     
      marker.on('click',function(e){
        var popup=e.target.bindPopup(popupFunc(row))
      });

  });
 // document.getElementById("demo").innerHTML = data['table']["columnNames"].indexOf("minLongitude",0) + ' minlan and minlat';   
};


//Fetching .json file using URL
fetch("https://www.smartatlantic.ca/erddap/tabledap/allDatasets.json?datasetID%2Caccessible%2Cinstitution%2CdataStructure%2Ccdm_data_type%2Cclass%2Ctitle%2CminLongitude%2CmaxLongitude%2ClongitudeSpacing%2CminLatitude%2CmaxLatitude%2ClatitudeSpacing%2CminAltitude%2CmaxAltitude%2CminTime%2CmaxTime%2CtimeSpacing%2Cgriddap%2Csubset%2Ctabledap%2CMakeAGraph%2Csos%2Cwcs%2Cwms%2Cfiles%2Cfgdc%2Ciso19115%2Cmetadata%2CsourceUrl%2CinfoUrl%2Crss%2Cemail%2CtestOutOfDate%2CoutOfDate%2Csummary")
.then(response => {return response.json()})
.then(data => {
  columnNames = data['table']['columnNames']
  dict = [];
  data['table']["rows"].slice(1).forEach(rows=>{
    var pairs = {};
    columnNames.forEach((columnName, i) => pairs[columnName]= rows[i]);

    dict.push(pairs)
  })
  return dict;
  })
.then(  
  data=> handleData(data)
  );

  
//building data url
function dataurl(datatype, stationname, query){

  // "https://www.smartatlantic.ca/erddap/tabledap/SMA_st_johns.csv?time%2Cwind_spd_avg&time%3E=2018-11-21&time%3C=2020-01-29T22%3A00%3A01Z"

  var theurl = "https://www.smartatlantic.ca/erddap/tabledap/" + 
  stationname + "." + datatype+ "?" + query
  return theurl
}
