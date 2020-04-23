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
      const getDataURL = function (stationname) {
        // "https://www.smartatlantic.ca/erddap/tabledap/SMA_st_johns.csv?time%2Cwind_spd_avg&time%3E=2018-11-21&time%3C=2020-01-29T22%3A00%3A01Z"
        let theurl = `https://www.smartatlantic.ca/erddap/tabledap/${stationname}.csv?time%2Cwind_spd_avg&time%3E=2018-11-21&time%3C=2020-01-29T22%3A00%3A01Z`
        return theurl;
      }

      let header = station.slice(0, 3);
      let stationId = station.toString()
      if (header === 'sma') {
        stationId = stationId.replace('sma', 'SMA');
      } else {
        return;
      }
      fetch("https://cioosatlantic.ca/ckan/api/3/action/package_show?id=" + station)
        .then(resp => resp.json())
        .then(dt => JSON.parse(JSON.stringify(dt)))
        .then(dat => {
          const card = document.createElement('div');
          card.setAttribute('class', 'card'); //taking stuff from .card class in css

          const h1 = document.createElement('h1');
          h1.ondblclick = () => {
            let extended_card = document.getElementById('extended-card');
            extended_card.style.display = 'block';//
            let extended_card_content = document.querySelector('#content');
            
            extended_card_content.innerHTML = '';
            let canvas = document.createElement('canvas'); //html element 
            extended_card_content.appendChild(canvas);

            let url = getDataURL(stationId)
            const abortHandler = new AbortController(); // for timeout of requests
            const timeout = setTimeout(() => abortHandler.abort(), 5000);
            
            fetch(url, {signal: abortHandler.signal})
              .then((response) => {
                if (response.status !== 200) {
                  throw new Error('No Content Found')
                }
                return response.text();
              })
              .then(data => {
                data = parseCsv(data);
                data = formatDataset(data);
                console.log(data);
                const chart = new Chart(canvas.getContext('2d'), {
                  type: 'line',
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                  },
                  data: {
                    labels: data.map(d => d.month),
                    datasets: [{
                      label: 'Monthly Wind Speed',
                      data: data.map(d => d.values),
                      backgroundColor: 'rgba(240, 71, 41, 0.2)',
                      borderColor: 'rgba(240, 71, 41, 1)',
                      borderWidth: 1
                    }]
                  }
                });
              })
              .catch((err) => {
                console.error(err);
                extended_card_content.innerHTML = err.message;
              }).finally(() => clearTimeout(timeout));
          }

          h1.textContent = "Station Name:\n" + stationId;
          
          //h1.innerHTML = `Station Name:<br/><a href=/view_card.html?name=${station}>${station}</a>`

          const p = document.createElement('p');
          p.textContent = `${dat.result.notes_translated.en.substring(0, 300)}...`;

          container.appendChild(card);
          card.appendChild(h1);
          card.appendChild(p);
          // console.log(dat.result.notes_translated.en)
        });
    });
  } else {
    const errorMessage = document.createElement('marquee');
    errorMessage.textContent = `Gah, it's not working!`;
    app.appendChild(errorMessage);
  }
}
request.send();

function parseCsv(csvData) {
  let lines = csvData.split('\n')
  let data = [];
  
  let titles = lines[0].split(',')

  // checks if there is any data availabe!
  if (lines.length === 0 || titles.length === 0) {
    console.error('No values found');
    return;
  }

  for (let i = 2; i < lines.length; i++) {
    const [dateStr, windStr] = lines[i].split(',');
    
    // NOTE: 'moment.js' is a library for date
    // parse date
    let date = moment(dateStr);

    // parse wind speed
    let windSpd = Number.parseFloat(windStr);

    // if date or wind speed is invalid, skip the loop
    if (!date || isNaN(windSpd)) {
      continue;
    }
    //data frame to access columns via the title 
    data.push({
      [titles[0]]: date,
      [titles[1]]: windSpd
    });
  }
  return data;
}

/**
 * Parse dataset to be shown by months and the average wind_spd of that month
 * @param dataset dataset with properties {time: Moment, wind_spd_avg: number}
 */
function formatDataset(dataset) {
  return dataset
    .GroupBy(d => d.time.format('MM/YYYY'))
    .Distinct() // for enforcing unique values
    .Select(grp => ({
      month: grp.Key,
      values: grp.Sum(d => d.wind_spd_avg) / grp.Select(grp => grp.time).Count()
    }))
    .ToArray();
}