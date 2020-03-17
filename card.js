/**
 * Card will show all the information of that particular card
 */
const rootURL = 'https://cioosatlantic.ca/ckan/api/3/action/package_show?id='
class Card extends HTMLElement {
  constructor() {
    super();
    let params = new URLSearchParams(window.location.search)
    if (params.get('name')) {
      fetch(`${rootURL}${params.get('name')}`)
        .then((response) => {
          if (response.status !== 200) {
            throw new Error(`Status code ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Do something with the data
          this.data = data;
          this.init();
          // document.body.textContent = data['result']['notes_translated']['en'];
          // document.body.textContent = JSON.stringify(data, null, 2);
          console.log(data);
        })
        .catch(console.error);
    } else {
      console.error('Please provide a name parameter');
    }
  }

  init = () => {
    this.innerHTML = `
      <div>
        <div>
          <h4>${this.data['result']['notes_translated']['en']}</h4>
        </div>
      </div>
    `
  }
}

window.customElements.define('card-view', Card);