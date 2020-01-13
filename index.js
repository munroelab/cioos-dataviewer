var map = L.map('map',{ center: [47.570608, -52.720862], zoom: 10});

    	// Add OpenStreetMap tile layer to map element
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
         { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);