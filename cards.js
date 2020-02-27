

//var ckanapi = "https://cioosatlantic.ca/ckan/api/3/action/"
//var query = ckanapi + "package_list"
var query = "./package_list.json"
fetch(query)
.then(res => {return res.json})
.then(da => {return console.log(da.help)});
//https://cioosatlantic.ca/ckan/api/3/action/package_show?id=sma_st_johns
const app = document.getElementById('root');

const logo = document.createElement('img');
logo.src = 'https://dev.cioosatlantic.ca/wp-content/uploads/cioos_atlantic_en.png';

const container = document.createElement('div');
container.setAttribute('class', 'container');

app.appendChild(logo);
app.appendChild(container);

var request = new XMLHttpRequest();
request.open('GET', 'package_list.json', true);
request.onload = function () {

  // Begin accessing JSON data here
  var data = JSON.parse(this.response);
  if (request.status >= 200 && request.status < 400) {
    data.result.forEach(station => {
            fetch("./"+"sma_saint_john_wharf")
            .then(resp => resp.json())
            .then(dt => JSON.parse(JSON.stringify(dt)))
            .then(dat => console.log(dat.help));
            //console.log()

            const card = document.createElement('div');
            card.setAttribute('class', 'card');

            const h1 = document.createElement('h1');
            h1.textContent = station;

            const p = document.createElement('p');
            station.description = station.substring(0, 3);
            p.textContent = `${"Information about this station will appear here!"}...`;

            container.appendChild(card);
            card.appendChild(h1);
            card.appendChild(p);
    });
  } else {
    const errorMessage = document.createElement('marquee');
    errorMessage.textContent = `Gah, it's not working!`;
    app.appendChild(errorMessage);
  }
}

request.send();

