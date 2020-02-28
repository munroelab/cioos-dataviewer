

//var ckanapi = "https://cioosatlantic.ca/ckan/api/3/action/"
//var query = ckanapi + "package_list"
// var query = "https://cioosatlantic.ca/ckan/api/3/action/package_list.json"
// fetch(query)
// .then(res => {return res.json})
// .then(da => {return console.log(da.help)});
//https://cioosatlantic.ca/ckan/api/3/action/package_show?id=sma_st_johns
const app = document.getElementById('root');

const logo = document.createElement('img');
logo.src = 'https://dev.cioosatlantic.ca/wp-content/uploads/cioos_atlantic_en.png';

const container = document.createElement('div');
container.setAttribute('class', 'container');

app.appendChild(logo);
app.appendChild(container);

var request = new XMLHttpRequest();
request.open('GET', 'https://cioosatlantic.ca/ckan/api/3/action/package_list', true);
request.onload = function () {

  // Begin accessing JSON data here
  var data = JSON.parse(this.response);
  if (request.status >= 200 && request.status < 400) {
    data.result.forEach(station => {
            fetch("https://cioosatlantic.ca/ckan/api/3/action/package_show?id=" + station)
            .then(resp => resp.json())
            .then(dt => JSON.parse(JSON.stringify(dt)))
            .then(dat => 
            //console.log()

            {const card = document.createElement('div');
            card.setAttribute('class', 'card');

            const h1 = document.createElement('h1');
            h1.textContent = "Station Name:\n" + station;

            const p = document.createElement('p');
            p.textContent = `${dat.result.notes_translated.en.substring(0, 300)}...`;

            container.appendChild(card);
            card.appendChild(h1);
            card.appendChild(p);
            console.log(dat.result.notes_translated.en)});
    });
  } else {
    const errorMessage = document.createElement('marquee');
    errorMessage.textContent = `Gah, it's not working!`;
    app.appendChild(errorMessage);
  }
}

request.send();

